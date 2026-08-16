import { redis } from './redisClient.ts';
import type { prisma } from '../db/prismaClient.ts';
import { Decimal } from '@prisma/client/runtime/client';

type Account = NonNullable<Awaited<ReturnType<typeof prisma.account.findUnique>>>;
type SerializedAccount = Omit<Account, 'balance'> & { balance: string };

const CACHE_TTL_SECONDS = 60;

function accountCacheKey(id: string) {
    return `account:${id}`;
}

export async function getCachedAccount(id: string): Promise<Account | null> {
    const cached = await redis.get(accountCacheKey(id));

    if (!cached) return null;

    const parsed = JSON.parse(cached) as SerializedAccount;

    return { ...parsed, balance: new Decimal(parsed.balance) };
}

export async function cacheAccount(account: Account) {
    await redis.set(accountCacheKey(account.id), JSON.stringify(account), 'EX', CACHE_TTL_SECONDS);
}

// No invalidateAccount + transactionEmitter listener here: that listener depended on
// an in-process EventEmitter whose only emitter (transferService.ts) stayed behind in
// finance-api and can't cross the process boundary. A cached account balance can now be
// up to CACHE_TTL_SECONDS stale after a transfer completes — a real, named regression,
// fixed for real only once Phase 34 replaces transactionEmitter with a broker.
