import { prisma } from '../db/prismaClient.ts';

export async function listTransactionsForAccount(accountId: string) {
    return prisma.transaction.findMany({
        where: {
            OR: [
                { fromAccountId: accountId },
                { toAccountId: accountId }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}