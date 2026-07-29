import { Queue } from 'bullmq';
import { queueConnection } from './connection.ts';
import { transactionEmitter } from '../events/transactionEmitter.ts';
import { logger } from '../logger/index.ts';

export const transferReceiptQueue  = new Queue('transfer-receipts', {
    connection: queueConnection
})

transactionEmitter.on('transfer.completed',
     async ({ fromId, toId, amount, transactionId}
        :{fromId: string, toId: string, amount: number, transactionId: string}) => {
    
    await transferReceiptQueue.add('receipt', { fromId, toId, amount, transactionId });

    logger.debug({ transactionId }, 'queue.receipt-job-added');
});