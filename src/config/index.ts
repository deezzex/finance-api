import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_PUBLIC_KEY: z.string().min(32, 'JWT_PUBLIC_KEY must be at least 32 chars'),
    RABBITMQ_URL: z.string().min(1, 'RABBITMQ_URL is required'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required')
});

const parsed = envSchema.safeParse(process.env);

if(!parsed.success) {
    console.error('Invalid environment configuration:');
    console.error(parsed.error.format());
    process.exit(1); 
}

export const config = parsed.data
export type Config = z.infer<typeof envSchema>;