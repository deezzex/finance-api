import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const stream = createReadStream('transactions.log', {
    encoding: 'utf8'
});

const rl = createInterface({ input: stream });

let count = 0;

for await (const line of rl) {
    count++;
    const entry = JSON.parse(line);
    console.log(`${count}. [${entry.event}] ${entry.fromId} -> ${entry.toId} (${entry.amount})`);

}

console.log(`\nRead ${count} audit log entries.`);