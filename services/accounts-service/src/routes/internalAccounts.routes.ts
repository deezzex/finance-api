import { Router } from 'express';
import * as internalAccountsController from '../controllers/internalAccounts.controller.ts';
import { validate } from '../middleware/validate.ts';
import { accountIdParamSchema, adjustBalanceSchema } from '../schemas/internalAccounts.schema.ts';

const router = Router();

router.get('/:id', validate(accountIdParamSchema, 'params'), internalAccountsController.getAccount);
router.post('/:id/debit', validate(accountIdParamSchema, 'params'), validate(adjustBalanceSchema), internalAccountsController.debit);
router.post('/:id/credit', validate(accountIdParamSchema, 'params'), validate(adjustBalanceSchema), internalAccountsController.credit);

export default router;
