import jwt from 'jsonwebtoken';
import { config } from '../config/index.ts';
import { UnauthorizedError } from '../errors/AppError.ts';
import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if(!header?.startsWith('Bearer ')) {
        return next( new UnauthorizedError('Missing or malformed Authorization header') );
    }

    const token = header.slice('Bearer '.length);

    try{
        const payload = jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256']
        });

         if (typeof payload === 'string' || !payload.sub) {
            throw new UnauthorizedError('Invalid or expired token.');
        }

        req.user = { id: payload.sub };
        next();
    } catch (err) {
        next (new UnauthorizedError('Invalid or expired token.'));
    }
}