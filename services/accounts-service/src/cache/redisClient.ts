import { Redis } from 'ioredis';
import { config } from '../config/index.ts';
import { logger } from '../logger/index.ts';

export const redis = new Redis(config.REDIS_URL);

redis.on('error', (err) => logger.error({ err }, 'redis.error'));
