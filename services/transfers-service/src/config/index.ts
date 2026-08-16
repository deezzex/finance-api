import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3003),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required'),
    ACCOUNTS_SERVICE_URL: z.string().url('ACCOUNTS_SERVICE_URL must be a valid URL'),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
    RABBITMQ_URL: z.string().min(1, 'RABBITMQ_URL is required'),
    EXCHANGE_RATE_API_URL: z.string().url('EXCHANGE_RATE_API_URL must be a valid URL').default('https://api.frankfurter.dev/v1'),
    EXCHANGE_RATE_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment configuration:');
    console.error(parsed.error.format());
    process.exit(1);
}

export const config = parsed.data;
export type Config = z.infer<typeof envSchema>;
