import { EventEmitter } from 'node:events';
import type { TransferCompletedEvent, TransferFailedEvent } from '@finance-api/shared';

type TransactionEvents = {
    'transfer.completed': [TransferCompletedEvent];
    'transfer.failed': [TransferFailedEvent];
};

class TransactionEmitter extends EventEmitter<TransactionEvents> {}
export const transactionEmitter = new TransactionEmitter();