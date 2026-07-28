import express from 'express';
import { requestLogger } from './middleware/requestLogger.ts';
import healthRouter from './routes/health.routes.ts';
import accountsRouter from './routes/accounts.routes.ts'
import transfersRouter from './routes/transfers.routes.ts';
import authRouter from './routes/auth.routes.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { requireAuth } from './middleware/auth.ts';
import './audit/auditLogger.ts'

const app = express();


app.use(requestLogger);
app.use(express.json())
app.use('/health', healthRouter)
app.use('/accounts', requireAuth, accountsRouter);
app.use('/transfers', requireAuth, transfersRouter);
app.use('/auth', authRouter);
app.use(errorHandler);

export default app;