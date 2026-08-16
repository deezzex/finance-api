import { createWriteStream } from 'node:fs';
import { channel, TRANSFER_EVENTS_EXCHANGE } from '../messaging/rabbitmq.ts';
import { logger } from '../logger/index.ts';
import type { TransferEvent } from '@finance-api/shared';

const QUEUE_NAME = 'audit-log';

await channel.assertQueue(QUEUE_NAME, { durable: true });
await channel.bindQueue(QUEUE_NAME, TRANSFER_EVENTS_EXCHANGE, 'transfer.*');
await channel.prefetch(1);

const auditLogStream = createWriteStream('transactions.log', { flags: 'a' });

function writeAuditLine(eventName: string, payload: TransferEvent) {
    const line = JSON.stringify({
        event: eventName, ...payload, loggedAt: new Date().toISOString()
    }) + '\n';

    const canContinue = auditLogStream.write(line);
    if (!canContinue) {
        logger.warn('Audit log write buffer is full');
    }
}

channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString()) as TransferEvent;
    writeAuditLine(event.type, event);
    channel.ack(msg);

    logger.info({ routingKey: msg.fields.routingKey }, 'audit.line-written');
}, { noAck: false });

logger.info({ queue: QUEUE_NAME }, 'audit-log-worker.listening');
