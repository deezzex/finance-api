import { Router } from 'express';
import * as transferController from '../controllers/transfers.controller.ts';
import { validate } from '../middleware/validate.ts';
import { requireAuth } from '../middleware/auth.ts';
import { createTransferSchema } from '../schemas/transfers.schema.ts';
import { transferRateLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

router.post('/', requireAuth, transferRateLimiter, validate(createTransferSchema), transferController.createTransfer);

export default router;
