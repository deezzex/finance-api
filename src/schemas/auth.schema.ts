import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('email must be a valid email address'),
    password: z.string().min(8, 'password must be at least 8 chards')
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email('email must be a valid email address'),
    password: z.string().min(8, 'password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;