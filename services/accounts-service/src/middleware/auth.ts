import jwt from 'jsonwebtoken';
import { config } from '../config/index.ts';
import { UnauthorizedError } from '../errors/AppError.ts';
import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../types/role.ts';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Missing or malformed Authorization header'));
    }

    const token = header.slice('Bearer '.length);

    try {
        const payload = jwt.verify(token, config.JWT_PUBLIC_KEY, {
            algorithms: ['RS256']
        });

        if (typeof payload === 'string' || !payload.sub) {
            throw new UnauthorizedError('Invalid or expired token.');
        }

        const role: Role = payload.role === 'admin' ? 'admin' : 'user';

        req.user = { id: payload.sub, role };
        next();
    } catch (err) {
        next(new UnauthorizedError('Invalid or expired token.'));
    }
}
