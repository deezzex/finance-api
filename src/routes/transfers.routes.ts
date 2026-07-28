import { Router } from 'express';
import * as transferController from '../controllers/transfers.controller.ts';
import { validate } from '../middleware/validate.ts';
import { createTransferSchema } from '../schemas/transfers.schema.ts';

const router = Router();

router.post('/', validate(createTransferSchema), transferController.createTransfer);

export default router;