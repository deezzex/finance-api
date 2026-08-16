import { AppError, InsufficientFundsError, NotFoundError, SelfTransferError, ValidationError } from "../errors/AppError.ts";
import { transactionEmitter } from '../events/transactionEmitter.ts';
import { prisma } from '../db/prismaClient.ts'
import { logger as baseLogger } from '../logger/index.ts';
import type { Logger } from 'pino';
import { request, RequestError, type AccountDTO } from '@finance-api/shared';
import { config } from '../config/index.ts';
import { getExchangeRate } from '../cache/exchangeRateCache.ts';

function toAppError(err: unknown): AppError {
    if (err instanceof RequestError) {
        if (err.code === 'NOT_FOUND') return new NotFoundError(err.message);
        if (err.code === 'INSUFFICIENT_FUNDS') return new InsufficientFundsError(err.message);
        if (err.code === 'VALIDATION_ERROR') return new ValidationError(err.message);
    }
    return new AppError(502, 'INTERNAL_ERROR', 'accounts-service call failed.');
}

export async function transferMoney(fromId: string, toId: string, amount: number, callerId: string, idempotencyKey: string, log: Logger = baseLogger) {
    log.info({ fromId, toId, amount, idempotencyKey }, 'transfer.attempt');

    try {
        if (fromId === toId) {
            throw new SelfTransferError();
        }

        if (amount <= 0) {
            throw new ValidationError('Transfer amount must be positive.');
        }


        const existing = await prisma.transaction.findUnique({ where: { idempotencyKey } });
        if (existing) {
            log.info({ transactionId: existing.id }, 'transfer.idempotent-replay');
            return {
                fromAccountId: existing.fromAccountId,
                toAccountId: existing.toAccountId,
                transactionId: existing.id
            };
        }

        const [fromAccount, toAccount] = await Promise.all([
        request<AccountDTO>(`${config.ACCOUNTS_SERVICE_URL}/internal/accounts/${fromId}`)
            .catch(() => { throw new NotFoundError(`Account ${fromId} not found.`); }),
        request<AccountDTO>(`${config.ACCOUNTS_SERVICE_URL}/internal/accounts/${toId}`)
            .catch(() => { throw new NotFoundError(`Account ${toId} not found.`); })
            ]);

        if (fromAccount.ownerId !== callerId) {
            throw new NotFoundError(`Account ${fromId} not found.`);
        }

        let creditAmount = amount;
        let exchangeRate: number | null = null;

        if (fromAccount.currency !== toAccount.currency) {
            exchangeRate = await getExchangeRate(fromAccount.currency, toAccount.currency);
            creditAmount = Number((amount * exchangeRate).toFixed(2));
        }

        try {
            await request(`${config.ACCOUNTS_SERVICE_URL}/internal/accounts/${fromId}/debit`, {
                method: 'POST', body: { amount }
            });
        } catch (err) {
            throw toAppError(err);
        }

        try {
            await request(`${config.ACCOUNTS_SERVICE_URL}/internal/accounts/${toId}/credit`, {
                method: 'POST', body: { amount: creditAmount }
            });
        } catch (err) {
            await request(`${config.ACCOUNTS_SERVICE_URL}/internal/accounts/${fromId}/credit`, {
                method: 'POST', body: { amount } 
            });
            log.warn({ fromId, toId, amount }, 'transfer.compensated');
            throw toAppError(err);
        }

        const transaction = await prisma.transaction.create({
            data: { fromAccountId: fromId, toAccountId: toId, amount, exchangeRate, idempotencyKey }
        });

        transactionEmitter.emit('transfer.completed', {
            type: 'transfer.completed',
            fromAccountId: fromId, toAccountId: toId, amount: String(amount), transactionId: transaction.id
        });


         log.info({fromId, toId, amount, transactionId: transaction.id }, 'transfer.completed');

        return { fromAccountId: fromId, toAccountId: toId, transactionId: transaction.id };
    } catch (err) {
       const code = err instanceof AppError ? err.code : 'UNKNOWN';

        transactionEmitter.emit('transfer.failed', {
            type: 'transfer.failed',
            fromAccountId: fromId, toAccountId: toId, amount: String(amount), code,
            message: err instanceof AppError ? err.message : 'Unknown'
        });

        log.warn({ fromId, toId, amount, code }, 'transfer.failed');

        throw err;
    }
}
