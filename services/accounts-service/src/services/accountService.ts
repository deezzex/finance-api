import { prisma } from '../db/prismaClient.ts'
import { getCachedAccount, cacheAccount } from '../cache/accountCache.ts';
import type { CreateAccountInput } from '../schemas/accounts.schema.ts';
import { InsufficientFundsError, NotFoundError } from '../errors/AppError.ts';

export async function createAccount({ ownerId, balance = 0, currency = 'USD' }:
     CreateAccountInput & { ownerId: string}) {

    return prisma.account.create({
        data: { ownerId, balance, currency }
    });
}

export async function listAccounts(ownerId: string) {
    return prisma.account.findMany({ where: { ownerId }});
}

export async function getAccountById(id: string, ownerId: string) {
    const cached = await getCachedAccount(id);

    if(cached) {
        return cached.ownerId === ownerId ? cached : null;
    }

    const account = await prisma.account.findUnique({
        where: { id }
    });

    if(account) {
        await cacheAccount(account);
    }

    return account && account.ownerId === ownerId ? account : null;
}

export async function getAccountByIdForAdmin(id: string) {
    const cached = await getCachedAccount(id);
    if (cached) return cached;

    const account = await prisma.account.findUnique({ where: { id } });
    if (account) await cacheAccount(account);

    return account;
}

export async function debitAccount(id: string, amount: number) {
    const account = await prisma.account.findUnique({
        where: { id }
    });

    if(!account) {
        throw new NotFoundError(`Account ${id} not found.`);
    }

    if(account.balance.lessThan(amount)) {
        throw new InsufficientFundsError();
    }

    return prisma.account.update({
        where: { id },
        data: { balance: { decrement: amount} }
    });
}

export async function creditAccount(id: string, amount: number) {
    const account = await prisma.account.findUnique({ where: { id } });

    if (!account) {
        throw new NotFoundError(`Account ${id} not found.`);
    }

    return prisma.account.update({
        where: { id },
        data: { balance: { increment: amount } }
    });
}