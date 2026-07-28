import jwt from 'jsonwebtoken';

const secret = 'demo-secret';

const token = jwt.sign({
    sub: 'user-123',
    role: 'owner'
}, secret, { expiresIn: '15m' });

console.log('Token: ', token);

const [headerB64, payloadB64] = token.split('.');
console.log('Header (no secret needed)', JSON.parse(Buffer.from(headerB64, 'base64url').toString()));
console.log('Payload (no secret needed)', JSON.parse(Buffer.from(payloadB64, 'base64url').toString()));

console.log('Verified: ', jwt.verify(token, secret));

const [h, , s] = token.split('.');
const forgedPayload = Buffer.from(JSON.stringify({ sub: 'user-999', role: 'admin' })).toString('base64url');
const tamperedToken = `${h}.${forgedPayload}.${s}`;

try {
    jwt.verify(tamperedToken, secret);
    console.log('Tampering succeeded — this would be a real bug.');
} catch (err) {
    console.log('Tampering correctly rejected:', err.name, '-', err.message);
}

// Watch a token actually expire
const shortLived = jwt.sign({ sub: 'user-123' }, secret, { expiresIn: '1s' });
console.log('Issued a 1-second token, waiting 1.1s...');
await new Promise((resolve) => setTimeout(resolve, 1100));
try {
    jwt.verify(shortLived, secret);
    console.log('Expiry check failed to fire — this would be a real bug.');
} catch (err) {
    console.log('Expired token correctly rejected:', err.name, '-', err.message);
}