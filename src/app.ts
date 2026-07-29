import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger.ts';
import healthRouter from './routes/health.routes.ts';
import accountsRouter from './routes/accounts.routes.ts'
import transfersRouter from './routes/transfers.routes.ts';
import authRouter from './routes/auth.routes.ts';
import adminRouter from './routes/admin.routes.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { requireAuth } from './middleware/auth.ts';
import { requireRole } from './middleware/requireRole.ts';
import './audit/auditLogger.ts'
import './cache/accountCache.ts'
import './queue/transferReceiptQueue.ts'

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestLogger);
app.use(express.json())
app.use('/health', healthRouter)
app.use('/accounts', requireAuth, accountsRouter);
app.use('/transfers', requireAuth, transfersRouter);
app.use('/auth', authRouter);
app.use('/admin', requireAuth, requireRole('admin'), adminRouter);
app.use(errorHandler);

export default app;