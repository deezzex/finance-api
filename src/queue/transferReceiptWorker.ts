import { Worker } from 'bullmq';
import { queueConnection } from './connection.ts';
import { logger } from '../logger/index.ts';

const worker = new Worker('transfer-receipts', async (job) => {
    const { fromId, toId, amount, transactionId } = job.data;

    logger.info({ transactionId, fromId, toId, amount }, 'receipt.sending');

    await new Promise((resolve) => setTimeout(resolve, 50));

    logger.info({ transactionId }, 'receipt.sent');
}, { 
    connection: queueConnection 
});

worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'receipt.job-completed');
});

worker.on('failed', (job, err) => {
    logger.info({ jobId: job?.id, err }, 'receipt.job-failed');
});