import type { LoginInput, RegisterInput } from '../schemas/auth.schema.ts';
import * as authService from '../services/authService.ts';
import type { Request, Response } from 'express';

export async function register(req: Request, res: Response) {
    const user = await authService.registerUser(req.body as RegisterInput);
    res.status(201).json(user);
}

export async function login(req: Request, res: Response) {
    const result = await authService.loginUser(req.body as LoginInput);

    res.status(200).json(result);
}
