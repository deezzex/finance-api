import express from 'express';
import accountsRouter from './routes/accounts.routes.ts';
import internalAccountsRouter from './routes/internalAccounts.routes.ts';
import { errorHandler } from './middleware/errorHandler.ts';

const app = express();

app.use(express.json());
app.use('/accounts', accountsRouter);
app.use('/internal/accounts', internalAccountsRouter);
app.use(errorHandler);

export default app;
