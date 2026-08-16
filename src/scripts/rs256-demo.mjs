// scripts/rs256-demo.mjs — throwaway, not part of any service, deleted once verified
import jwt from 'jsonwebtoken';
import { generateKeyPairSync } from 'node:crypto';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const token = jwt.sign({ sub: 'user-123', role: 'user' }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m'
});
console.log('Token:', token);

console.log('Verified with the public key:', jwt.verify(token, publicKey, { algorithms: ['RS256'] }));

// The asymmetric property, proven directly rather than assumed from the docs:
// the public key cannot sign, only verify.
try {
    jwt.sign({ sub: 'attacker' }, publicKey, { algorithm: 'RS256' });
    console.log('Signing with the public key succeeded — this would be a real bug.');
} catch (err) {
    console.log('Signing with the public key correctly rejected:', err.message);
}
