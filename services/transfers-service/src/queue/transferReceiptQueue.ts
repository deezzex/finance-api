import { Queue } from 'bullmq';
import { queueConnection } from './connection.ts';
import { transactionEmitter } from '../events/transactionEmitter.ts';
import { logger } from '../logger/index.ts';

export const transferReceiptQueue  = new Queue('transfer-receipts', {
    connection: queueConnection
})

transactionEmitter.on('transfer.completed',
     async ({ fromAccountId, toAccountId, amount, transactionId }) => {

    await transferReceiptQueue.add('receipt', { fromAccountId, toAccountId, amount, transactionId });

    logger.debug({ transactionId }, 'queue.receipt-job-added');
});