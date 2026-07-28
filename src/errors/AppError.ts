export type AppErrorCode = 
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'INSUFFICIENT_FUNDS'
    | 'SELF_TRANSFER'
    | 'UNAUTHORIZED'
    | 'CONFLICT'
    | 'INTERNAL_ERROR';

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

export class SelfTransferError extends AppError {
    constructor(message = 'Cannot transfer to the same account.') {
        super(422, 'SELF_TRANSFER', message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(409, 'CONFLICT', message);
    }
}