export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
}
export declare class RequestError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status: number, code?: string);
}
export declare function request<TResponse>(url: string, options?: RequestOptions): Promise<TResponse>;
