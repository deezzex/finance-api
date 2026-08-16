// src/scripts/accounts-demo.mjs — throwaway, not part of any service, run against a running accounts-service
import { request } from '@finance-api/shared';

const BASE_URL = 'http://localhost:3002';

// Requires a real account id from your own dev database — create one first via
// POST /accounts (through finance-api's requireAuth, same as any other day)
const accountId = process.argv[2];

if (!accountId) {
    console.error('Usage: node src/scripts/accounts-demo.mjs <accountId>');
    process.exit(1);
}

const before = await request(`${BASE_URL}/internal/accounts/${accountId}`);
console.log('Before:', before);

const credited = await request(`${BASE_URL}/internal/accounts/${accountId}/credit`, {
    method: 'POST',
    body: { amount: 50 }
});
console.log('After +50 credit:', credited);

const debited = await request(`${BASE_URL}/internal/accounts/${accountId}/debit`, {
    method: 'POST',
    body: { amount: 200 }
});
console.log('After -200 debit:', debited);

// Prove the InsufficientFundsError path too, the same "prove the failure mode, not
// just the happy path" standard every prior day's demo script has held.
try {
    await request(`${BASE_URL}/internal/accounts/${accountId}/debit`, {
        method: 'POST',
        body: { amount: 999999 }
    });
    console.log('Overdraft debit succeeded — this would be a real bug.');
} catch (err) {
    console.log('Overdraft debit correctly rejected:', err.message);
}
