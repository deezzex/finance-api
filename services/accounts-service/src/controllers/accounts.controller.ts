import { NotFoundError } from '../errors/AppError.ts';
import * as accountService from '../services/accountService.ts';
import type { CreateAccountInput, AccountIdParam } from '../schemas/accounts.schema.ts';
import type { Request, Response } from 'express';

export async function createAccount(req: Request, res: Response) {
    const body = req.body as CreateAccountInput;
    const account = await accountService
                            .createAccount({ ...body, ownerId: req.user!.id });
    res.status(201).json(account);
}

export async function listAccounts(req: Request, res: Response) {
    const accounts = await accountService.listAccounts(req.user!.id);

    res.status(200).json(accounts);
}

export async function getAccountById(req: Request, res: Response) {
    const { id } = req.params as AccountIdParam;

    const account = await accountService.getAccountById(id, req.user!.id);

    if(!account) {
        throw new NotFoundError('Account not found.');
    }

    res.status(200).json(account);
}
