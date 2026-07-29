import { rateLimit } from 'express-rate-limit';

export const transferRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user!.id,
    message: {
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many transfer attempts, try again shortly.'
        }
    }
});