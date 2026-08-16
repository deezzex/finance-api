export interface TransferCompletedEvent {
    type: 'transfer.completed';
    transactionId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: string;
}

export interface TransferFailedEvent {
    type: 'transfer.failed';
    fromAccountId: string;
    toAccountId: string;
    amount: string;
    code: string;
    message: string;
}

export type TransferEvent = TransferCompletedEvent | TransferFailedEvent;

export function assertNever(value: never): never {
    throw new Error(`Unhandled event type: ${JSON.stringify(value)}`);
}