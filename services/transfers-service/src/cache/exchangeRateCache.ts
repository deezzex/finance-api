import { redis } from './redisClient.ts';
import { fetchExchangeRate } from '../exchange/exchangeRateClient.ts';
import { ExchangeRateUnavailableError } from '../errors/AppError.ts';
import { logger } from '../logger/index.ts';

const CACHE_TTL_SECONDS = 300;

function rateCacheKey(from: string, to: string) {
    return `rate:${from}:${to}`;
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
    const cached = await redis.get(rateCacheKey(from, to));
    if (cached) return Number(cached);

    let rate: number;
    try {
        rate = await fetchExchangeRate(from, to);
    } catch (err) {
        logger.error({ err, from, to }, 'exchange-rate.fetch-failed');
        throw new ExchangeRateUnavailableError();
    }

    await redis.set(rateCacheKey(from, to), String(rate), 'EX', CACHE_TTL_SECONDS);
    return rate;
}
