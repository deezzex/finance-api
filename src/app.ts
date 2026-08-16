import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { requestLogger } from './middleware/requestLogger.ts';
import healthRouter from './routes/health.routes.ts';
import adminRouter from './routes/admin.routes.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { requireAuth } from './middleware/auth.ts';
import { requireRole } from './middleware/requireRole.ts';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(requestLogger);
app.use(express.json())
app.use('/health', healthRouter)
app.use('/admin', requireAuth, requireRole('admin'), adminRouter);
app.use(errorHandler);

export default app;