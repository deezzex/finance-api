export interface TransferRequestDTO {
    fromAccountId: string;
    toAccountId: string;
    amount: string;
}
export interface TransferResultDTO {
    fromAccountId: string;
    toAccountId: string;
    transactionId: string;
}
