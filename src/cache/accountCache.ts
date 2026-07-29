import { redis } from './redisClient.ts';
import type { prisma } from '../db/prismaClient.ts';
import { transactionEmitter } from '../events/transactionEmitter.ts';
import { logger } from '../logger/index.ts';

type Account = NonNullable<Awaited<ReturnType<typeof prisma.account.findUnique>>>;

const CACHE_TTL_SECONDS = 60;

function accountCacheKey(id: string) {
    return `account:${id}`;
}

export async function getCachedAccount(id :string) {
    const cached = await redis.get(accountCacheKey(id));

    return cached ? (JSON.parse(cached) as Account) : null;
}

export async function cacheAccount(account: Account) {
    await redis.set(accountCacheKey(account.id), JSON.stringify(account), 'EX', CACHE_TTL_SECONDS);
}

async function invalidateAccount(id: string) {
    await redis.del(accountCacheKey(id));
}

transactionEmitter.on('transfer.completed', async ({ fromId, toId }: { fromId: string; toId: string }) => {
    await Promise.all([invalidateAccount(fromId), invalidateAccount(toId)]);
    logger.debug({ fromId, toId }, 'cache.invalidate');
});