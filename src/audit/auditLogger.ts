import { createWriteStream } from 'node:fs';
import { transactionEmitter } from '../events/transactionEmitter.ts';

const auditLogStream = createWriteStream('transactions.log', {
    flags: 'a'
});

function writeAuditLine(event: string, payload: Record<string, unknown>) {
    const line = JSON.stringify({
        event, ...payload, loggedAt: new Date().toISOString()
    }) + '\n';

    const canContinue = auditLogStream.write(line);

    if(!canContinue) {
        console.warn('Audit log write buffer is full');
    }
}

transactionEmitter.on('transfer.completed',
     (payload) => writeAuditLine('transfer.completed', payload));
transactionEmitter.on('transfer.failed',
     (payload) => writeAuditLine('transfer.failed', payload));