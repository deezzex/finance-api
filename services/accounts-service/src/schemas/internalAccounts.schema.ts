import { z } from 'zod';

export const accountIdParamSchema = z.object({
    id: z.string().uuid('id must be a valid UUID')
});
export type AccountIdParam = z.infer<typeof accountIdParamSchema>;

export const adjustBalanceSchema = z.object({
    amount: z.number().positive('amount must be a positive number')
});
export type AdjustBalanceInput = z.infer<typeof adjustBalanceSchema>;
