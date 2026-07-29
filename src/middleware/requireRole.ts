import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/AppError.ts";
import type { Role } from '../types/role.ts';

export function requireRole(role: Role) {
    return (req: Request, res: Response, next: NextFunction) => {
        if(req.user?.role !== role) {
            return next(new ForbiddenError());
        }

        next();
    };
}