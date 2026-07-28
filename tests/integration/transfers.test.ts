import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../../src/db/prismaClient.ts';
import { registerAndLogin } from './helpers.ts';

async function openAccount(token: string, balance: number) {
    const res = await request(app)
        .post('/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({ balance });
    return res.body.id as string;
}

describe('POST /transfers', () => {
    it('moves money between two accounts and persists the new balances', async () => {
        const adaToken = await registerAndLogin('ada@example.com');
        const babbageToken = await registerAndLogin('babbage@example.com');

        const fromId = await openAccount(adaToken, 100);
        const toId = await openAccount(babbageToken, 0);

        const res = await request(app)
            .post('/transfers')
            .set('Authorization', `Bearer ${adaToken}`)
            .send({ fromAccountId: fromId, toAccountId: toId, amount: 40 });

        expect(res.status).toBe(201);

        const fromAccount = await prisma.account.findUnique({ where: { id: fromId } });
        const toAccount = await prisma.account.findUnique({ where: { id: toId } });

        expect(fromAccount?.balance.toString()).toBe('60');
        expect(toAccount?.balance.toString()).toBe('40');
    });

    it('rejects a transfer from an account the caller does not own', async () => {
        const adaToken = await registerAndLogin('ada@example.com');
        const babbageToken = await registerAndLogin('babbage@example.com');

        const fromId = await openAccount(adaToken, 100);
        const toId = await openAccount(babbageToken, 0);

        const res = await request(app)
            .post('/transfers')
            .set('Authorization', `Bearer ${babbageToken}`)
            .send({ fromAccountId: fromId, toAccountId: toId, amount: 40 });

        expect(res.status).toBe(404);
    });

    it('rejects insufficient funds', async () => {
        const adaToken = await registerAndLogin('ada@example.com');
        const babbageToken = await registerAndLogin('babbage@example.com');

        const fromId = await openAccount(adaToken, 10);
        const toId = await openAccount(babbageToken, 0);

        const res = await request(app)
            .post('/transfers')
            .set('Authorization', `Bearer ${adaToken}`)
            .send({ fromAccountId: fromId, toAccountId: toId, amount: 40 });

        expect(res.status).toBe(422);
        expect(res.body.error.code).toBe('INSUFFICIENT_FUNDS');
    });

    it('rejects a non-positive amount at the validation layer, before transferService ever runs', async () => {
        const adaToken = await registerAndLogin('ada@example.com');
        const fromId = await openAccount(adaToken, 100);
        const toId = await openAccount(adaToken, 0);

        const res = await request(app)
            .post('/transfers')
            .set('Authorization', `Bearer ${adaToken}`)
            .send({ fromAccountId: fromId, toAccountId: toId, amount: -10 });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
});