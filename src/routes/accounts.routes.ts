import { Router } from "express";
import * as accountController from '../controllers/accounts.controller.ts';
import { validate } from "../middleware/validate.ts";
import { accountIdParamSchema, createAccountSchema } from "../schemas/accounts.schema.ts";

const router = Router();

router.post('/', validate(createAccountSchema), accountController.createAccount);
router.get('/', accountController.listAccounts);
router.get('/:id', validate(accountIdParamSchema, 'params'), accountController.getAccountById);
router.get('/:id/transactions', validate(accountIdParamSchema, 'params'), accountController.getAccountTransactions);

export default router;