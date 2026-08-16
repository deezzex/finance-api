import z from "zod";

export const createTransferSchema = z.object({
    fromAccountId: z.string().uuid('fromAccountId must be valid UUID'),
    toAccountId: z.string().uuid('toAccountId must be valid UUID'),
    amount: z.number().positive('amount must be positive')
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
