import { EventEmitter } from 'node:events';

class TransactionEmitter extends EventEmitter {}

export const transactionEmitter = new TransactionEmitter();