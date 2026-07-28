import { AppError } from "../errors/AppError.ts";
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const isKnown = err instanceof AppError;

    if(!isKnown) {
        req.log.error({err}, 'Unhandled error');
    }

    res.status(
        isKnown ? err.statusCode : 500
    ).json({
        error: {
            code: isKnown ? err.code : 'INTERNAL_ERROR',
            message: isKnown ? err.message : 'Something went wrong.',
            ...(err.details ? { details : err.details } : {})
        }
    });
}