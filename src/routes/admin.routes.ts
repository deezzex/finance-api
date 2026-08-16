import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.ts';
import { validate } from '../middleware/validate.ts';
import { accountIdParamSchema } from '../schemas/admin.schema.ts';

const router = Router();

router.get('/accounts/:id', validate(accountIdParamSchema, 'params'), adminController.getAnyAccountById);

export default router;