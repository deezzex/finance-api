import amqp from 'amqplib';

const RABBITMQ_URL = process.argv[2] ?? 'amqp://guest:guest@localhost:5672';
const EXCHANGE = 'transfer-events';

const connection = await amqp.connect(RABBITMQ_URL);
const channel = await connection.createChannel();

await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
const { queue } = await channel.assertQueue('', { exclusive: true });
await channel.bindQueue(queue, EXCHANGE, 'transfer.*');

console.log(`Bound to "${EXCHANGE}" with pattern "transfer.*". Trigger a real transfer now...`);

channel.consume(queue, (msg) => {
    if (!msg) return;

    console.log('routingKey:', msg.fields.routingKey);
    console.log('payload:', JSON.parse(msg.content.toString()));

    channel.ack(msg);
    connection.close();
    process.exit(0);
}, { noAck: false });
