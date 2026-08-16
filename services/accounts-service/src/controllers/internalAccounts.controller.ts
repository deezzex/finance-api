import { NotFoundError } from '../errors/AppError.ts';
import type { AdjustBalanceInput, AccountIdParam } from '../schemas/internalAccounts.schema.ts';
import * as accountService from '../services/accountService.ts';

import type { Request, Response } from 'express';

export async function getAccount(req: Request, res: Response) {
    const { id } = req.params as AccountIdParam;
    const account = await accountService.getAccountByIdForAdmin(id);

    if (!account) throw new NotFoundError(`Account ${id} not found.`);

    res.status(200).json(account);
}

export async function debit(req: Request, res: Response) {
    const { id } = req.params as AccountIdParam;
    const { amount } = req.body as AdjustBalanceInput;

    res.status(200).json(await accountService.debitAccount(id, amount));
}

export async function credit(req: Request, res: Response) {
    const { id } = req.params as AccountIdParam;
    const { amount } = req.body as AdjustBalanceInput;

    res.status(200).json(await accountService.creditAccount(id, amount));
}
