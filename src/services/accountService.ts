import { prisma } from '../db/prismaClient.ts'
import type { CreateAccountInput } from '../schemas/accounts.schema.ts';
import { getCachedAccount, cacheAccount } from '../cache/accountCache.ts';

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