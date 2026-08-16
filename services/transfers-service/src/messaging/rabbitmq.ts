import amqp from 'amqplib';
import { config } from '../config/index.ts';
import { logger } from '../logger/index.ts';

export const TRANSFER_EVENTS_EXCHANGE = 'transfer-events';

const connection = await amqp.connect(config.RABBITMQ_URL);
export const channel = await connection.createChannel();

await channel.assertExchange(TRANSFER_EVENTS_EXCHANGE, 'topic', { durable: true });

connection.on('error', (err) => logger.error({ err }, 'rabbitmq.connection-error'));
connection.on('close', () => logger.warn('rabbitmq.connection-closed'));

logger.info({ exchange: TRANSFER_EVENTS_EXCHANGE }, 'rabbitmq.connected');
