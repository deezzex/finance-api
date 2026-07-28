import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.ts';
import { registerAndLogin } from './helpers.ts';

describe('POST /accounts', () => {
    it('rejects a request with no token', async () => {
        const res = await request(app).post('/accounts').send({ balance: 100 });
        expect(res.status).toBe(401);
    });

    it('creates an account owned by the caller', async () => {
        const token = await registerAndLogin('ada@example.com');

        const res = await request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${token}`)
            .send({ balance: 100, currency: 'USD' });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ balance: '100', currency: 'USD' });
    });
});

describe('GET /accounts', () => {
    it("only returns the caller's own accounts", async () => {
        const adaToken = await registerAndLogin('ada@example.com');
        const babbageToken = await registerAndLogin('babbage@example.com');

        await request(app).post('/accounts').set('Authorization', `Bearer ${adaToken}`).send({ balance: 10 });
        await request(app).post('/accounts').set('Authorization', `Bearer ${babbageToken}`).send({ balance: 20 });
        await request(app).post('/accounts').set('Authorization', `Bearer ${babbageToken}`).send({ balance: 30 });

        const res = await request(app).get('/accounts').set('Authorization', `Bearer ${babbageToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });
});

describe('GET /accounts/:id', () => {
    it('returns 404 for an account owned by someone else', async () => {
        const adaToken = await registerAndLogin('ada@example.com');
        const babbageToken = await registerAndLogin('babbage@example.com');

        const created = await request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${adaToken}`)
            .send({ balance: 10 });

        const res = await request(app)
            .get(`/accounts/${created.body.id}`)
            .set('Authorization', `Bearer ${babbageToken}`);

        expect(res.status).toBe(404);
    });
});