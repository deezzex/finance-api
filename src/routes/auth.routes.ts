import { Router } from 'express';
import * as authController from '../controllers/auth.controller.ts';
import { validate } from '../middleware/validate.ts';
import { loginSchema, registerSchema } from '../schemas/auth.schema.ts';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;