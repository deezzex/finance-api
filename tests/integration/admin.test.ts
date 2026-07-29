import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.ts';
import { prisma } from '../../src/db/prismaClient.ts';
import { registerAndLogin } from './helpers.ts';

async function registerAdminAndLogin(email: string, password = 'password123') {
    await registerAndLogin(email, password);

    await prisma.user.update({
        where: { email },
        data: {
            role: 'admin'
        }
    });

    const res = await request(app).post('/auth/login').send({ email, password });
    return res.body.token as string;
}

describe('GET /admin/accounts/:id', () => {
    it('rejects a non-admin caller with 403', async() => {
        const userToken = await registerAndLogin('ada@example.com');
        const adminToken = await registerAdminAndLogin('grace@example.com');

        const created = await request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ balance: 100 });
        
        const res = await request(app)
            .get(`/admin/accounts/${created.body.id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('lets an admin read an account they do not own', async () => {
        const userToken = await registerAndLogin('ada@example.com');
        const adminToken = await registerAdminAndLogin('grace@example.com');

        const created = await request(app)
            .post('/accounts')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ balance: 250 });

        const res = await request(app)
            .get(`/admin/accounts/${created.body.id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ balance: '250' });
    });
});