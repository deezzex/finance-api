import { prisma } from '../db/prismaClient.ts'
import type { CreateAccountInput } from '../schemas/accounts.schema.ts';

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
    return prisma.account.findUnique({ 
        where: {
            id, ownerId
        }
     });
}
