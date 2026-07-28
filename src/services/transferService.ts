import { AppError, InsufficientFundsError, NotFoundError, SelfTransferError, ValidationError } from "../errors/AppError.ts";
import { transactionEmitter } from "../events/transactionEmitter.ts";
import { prisma } from '../db/prismaClient.ts'
import { logger as baseLogger } from '../logger/index.ts';
import type { Logger } from 'pino';

export async function transferMoney(fromId: string, toId: string, amount: number, callerId: string, log: Logger = baseLogger) {
    log.info({ fromId, toId, amount }, 'transfer.attempt');
    
    try {
        if (fromId === toId) {
            throw new SelfTransferError();
        }

        if (amount <= 0) {
            throw new ValidationError('Transfer amount must be positive.');
        }

        const transaction = await prisma.$transaction(async (tx) => {
            const [fromAccount, toAccount] = await Promise.all([
                tx.account.findUnique({where: { id: fromId}}),
                tx.account.findUnique({where: { id: toId}})
            ]);

            if(!fromAccount) throw new NotFoundError(`Account ${fromId} not found.`);
            if(!toAccount) throw new NotFoundError(`Account ${toId} not found.`);

            if (fromAccount.ownerId !== callerId) {
                throw new NotFoundError(`Account ${fromId} not found.`);
            }

            if (fromAccount.balance.lessThan(amount)) {
                throw new InsufficientFundsError();
            }

            await tx.account.update({
                where: { id: fromId },
                data: { balance: { decrement: amount }}
            });

             await tx.account.update({
                where: { id: toId },
                data: { balance: { increment: amount }}
            });

            return tx.transaction.create({
                data: {
                    fromAccountId: fromId,
                    toAccountId: toId,
                    amount
                }
            });
        });

        transactionEmitter.emit('transfer.completed', {
            fromId, toId, amount, transactionId: transaction.id
         });

         log.info({fromId, toId, amount, transactionId: transaction.id }, 'transfer.completed');

        return { fromAccountId: fromId, toAccountId: toId, transactionId: transaction.id };
    } catch (err) {
       const code = err instanceof AppError ? err.code : 'UNKNOWN';

        transactionEmitter.emit('transfer.failed', {
            fromId, toId, amount, code,
            message: err instanceof AppError ? err.message : 'Unknown'
        });
        
        log.warn({ fromId, toId, amount, code }, 'transfer.failed');

        throw err;
    }
}
