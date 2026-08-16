import { Router } from 'express';
import * as accountController from '../controllers/accounts.controller.ts';
import { validate } from '../middleware/validate.ts';
import { requireAuth } from '../middleware/auth.ts';
import { accountIdParamSchema, createAccountSchema } from '../schemas/accounts.schema.ts';

const router = Router();

router.post('/', requireAuth, validate(createAccountSchema), accountController.createAccount);
router.get('/', requireAuth, accountController.listAccounts);
router.get('/:id', requireAuth, validate(accountIdParamSchema, 'params'), accountController.getAccountById);

export default router;
