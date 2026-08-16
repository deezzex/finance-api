import { Redis } from 'ioredis';
import { config } from '../config/index.ts';

export const queueConnection = new Redis(config.REDIS_URL, {
   maxRetriesPerRequest: null
});
