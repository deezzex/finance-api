import { NotFoundError } from '../errors/AppError.ts';
import type { AccountIdParam } from '../schemas/admin.schema.ts';
import type { Request, Response } from 'express';

export async function getAnyAccountById(req: Request, res: Response) {
    const { id } = req.params as AccountIdParam;

    // accountService.ts moved to accounts-service in Phase 31 and no longer exists at
    // this import path — dynamic on purpose, so a module that's gone doesn't crash the
    // whole process at boot (Node resolves static ESM imports eagerly). This route stays
    // broken until Phase 32 wires it through accounts-service instead.
    // @ts-expect-error — accountService.ts no longer exists in finance-api; left broken on purpose until Phase 32.
    const accountService = await import('../services/accountService.ts');
    const account = await accountService.getAccountByIdForAdmin(id);

    if(!account) {
        throw new NotFoundError('Account not found.');
    }

    req.log.warn({ accountId: id, adminId: req.user!.id }, 'admin.account_accessed');

    res.status(200).json(account);
}
