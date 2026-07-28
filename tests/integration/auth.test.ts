import { describe, it, expect } from "vitest";
import request from 'supertest';
import app from '../../src/app.ts';

describe('POST /auth/register', () => {
    it('creates a user and returns it without a password hash', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'ada@example.com', password: 'password123' });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ email: 'ada@example.com'});
        expect(res.body.passwordHash).toBeUndefined();
    });

     it('rejects a duplicate email', async () => {
        await request(app).post('/auth/register').send({ email: 'ada@example.com', password: 'password123' });

        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'ada@example.com', password: 'password123' });

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects a request body Zod would reject', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'not-an-email', password: 'short' });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
});