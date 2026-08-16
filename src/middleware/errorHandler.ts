import { AppError } from "../errors/AppError.ts";
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                ...(err.details ? { details: err.details } : {})
            }
        });
        return;
    }

    req.log.error({ err }, 'Unhandled error');

    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong.'
        }
    });
}