import express from 'express';
import transfersRouter from './routes/transfers.routes.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { requestLogger } from './middleware/requestLogger.ts';
import './queue/transferReceiptQueue.ts';
import './messaging/transferEventsPublisher.ts';

const app = express();

app.use(requestLogger);
app.use(express.json());
app.use('/transfers', transfersRouter);
app.use(errorHandler);

export default app;
