// src/scripts/compensating-debit-demo.mjs — Stretch: proves a compensating debit
// (the reverse of a completed debit) restores the balance exactly, the shape
// Phase 32's saga will reuse /credit for directly.
import { request } from '@finance-api/shared';

const BASE_URL = 'http://localhost:3002';
const accountId = process.argv[2];

if (!accountId) {
    console.error('Usage: node src/scripts/compensating-debit-demo.mjs <accountId>');
    process.exit(1);
}

const before = await request(`${BASE_URL}/internal/accounts/${accountId}`);
console.log('Before:', before.balance);

await request(`${BASE_URL}/internal/accounts/${accountId}/debit`, {
    method: 'POST',
    body: { amount: 100 }
});
console.log('After debit:', (await request(`${BASE_URL}/internal/accounts/${accountId}`)).balance);

// The compensating action: undo the debit with a credit for the same amount.
// Notice this is not a new endpoint — Phase 32's saga can reuse /credit directly
// as its own compensating action, with no new code required on accounts-service's side.
await request(`${BASE_URL}/internal/accounts/${accountId}/credit`, {
    method: 'POST',
    body: { amount: 100 }
});
const after = await request(`${BASE_URL}/internal/accounts/${accountId}`);
console.log('After compensating credit:', after.balance);
console.log('Balance restored exactly:', after.balance === before.balance);
