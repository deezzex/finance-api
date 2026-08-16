import { transactionEmitter } from '../events/transactionEmitter.ts';
import { channel, TRANSFER_EVENTS_EXCHANGE } from './rabbitmq.ts';
import { logger } from '../logger/index.ts';
import type { TransferEvent } from '@finance-api/shared';

function publish(event: TransferEvent) {
    try {
        const routingKey = event.type;
        const body = Buffer.from(JSON.stringify(event));

        const bufferOk = channel.publish(TRANSFER_EVENTS_EXCHANGE, routingKey, body, {
            persistent: true,
            contentType: 'application/json'
        });

        if (!bufferOk) {
            logger.warn({ routingKey }, 'rabbitmq.publish-backpressure');
        }
    } catch(err) {
        logger.error({ err, eventType: event.type }, 'rabbitmq.publish-failed');
    }
}

transactionEmitter.on('transfer.completed', publish);
transactionEmitter.on('transfer.failed', publish);
