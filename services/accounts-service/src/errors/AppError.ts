export type AppErrorCode = 
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'INSUFFICIENT_FUNDS'
    | 'SELF_TRANSFER'
    | 'UNAUTHORIZED'
    | 'CONFLICT'
    | 'INTERNAL_ERROR'
    | 'FORBIDDEN'
    | 'RATE_LIMITED';

export class AppError extends Error {
    statusCode: number;
    code: AppErrorCode;
    details?: unknown;

    constructor(statusCode: number, code: AppErrorCode, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found.') {
        super(404, 'NOT_FOUND', message);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed.', details?: unknown) {
        super(400, 'VALIDATION_ERROR', message);
        this.details = details;
    }
}

export class InsufficientFundsError extends AppError {
    constructor(message = 'Insufficient funds.') {
        super(422, 'INSUFFICIENT_FUNDS', message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized.') {
        super(401, 'UNAUTHORIZED', message);
    }
}