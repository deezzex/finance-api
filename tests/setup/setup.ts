import { config as loadEnv } from 'dotenv';
import { beforeEach } from 'vitest';

loadEnv({ path: '.env.test' });

const { prisma } = await import('../../src/db/prismaClient.ts');

beforeEach(async() => {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
});