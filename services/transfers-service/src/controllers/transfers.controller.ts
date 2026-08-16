import { ValidationError } from '../errors/AppError.ts';
import type { CreateTransferInput } from '../schemas/transfers.schema.ts';
import * as transferService from '../services/transferService.ts';
import type { Request, Response } from 'express';

export async function createTransfer(req: Request, res: Response) {
    const {fromAccountId, toAccountId, amount} = req.body as CreateTransferInput;
    const idempotencyKey = req.headers['idempotency-key'];

    if (typeof idempotencyKey !== 'string' || idempotencyKey.length === 0) {
        throw new ValidationError('Idempotency-Key header is required.');
    }

    const result = await transferService.transferMoney(fromAccountId, toAccountId, amount, req.user!.id, idempotencyKey, req.log);

    res.status(201).json(result);
}
