import { generateKeyPairSync } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('keys', { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

writeFileSync('keys/private.pem', privateKey);
writeFileSync('keys/public.pem', publicKey);

console.log('Wrote keys/private.pem and keys/public.pem');