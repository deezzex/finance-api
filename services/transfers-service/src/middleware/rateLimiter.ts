import { rateLimit } from 'express-rate-limit';
import { RateLimitedError } from '../errors/AppError.ts';

export const transferRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user!.id,
    handler: (req, res, next) => {
        next(new RateLimitedError());
    }
});
