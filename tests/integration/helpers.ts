import request from 'supertest';
import app from '../../src/app.ts';

export async function registerAndLogin(email: string, password = 'password123') {
    await request(app).post('/auth/register').send({
        email, password
    });
    
    const res = await request(app).post('/auth/login').send({
        email, password
    });
    
    return res.body.token as string;
}