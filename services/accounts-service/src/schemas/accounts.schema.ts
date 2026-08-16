import { z } from 'zod';

export const createAccountSchema = z.object({
    balance: z.number().nonnegative().default(0),
    currency: z.string().length(3).default('USD')
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const accountIdParamSchema = z.object({
    id: z.string().uuid('id must be a valid UUID')
});

export type AccountIdParam = z.infer<typeof accountIdParamSchema>;
