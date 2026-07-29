import { NotFoundError } from '../errors/AppError.ts';
import * as accountService from '../services/accountService.ts';
import * as transactionService from '../services/transactionService.ts';
import type { CreateAccountInput, AccountIdParam } from '../schemas/accounts.schema.ts';
import type { Request, Response } from 'express';

export async function getAnyAccountById(req: Request, res: Response) {
    const { id } = req.params as AccountIdParam;

    const account = await accountService.getAccountByIdForAdmin(id);

    if(!account) {
        throw new NotFoundError('Account not found.');
    }

    req.log.warn({ accountId: id, adminId: req.user!.id }, 'admin.account_accessed');

    res.status(200).json(account);
}
