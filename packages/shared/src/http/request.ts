export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
}

export class RequestError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export async function request<TResponse>(url: string, options: RequestOptions = {}): Promise<TResponse> {
    const res = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
            'content-type': 'application/json',
            ...options.headers
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: options.timeoutMs !== undefined ? AbortSignal.timeout(options.timeoutMs) : undefined
    });

    if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: { code?: string; message?: string } } | null;

        throw new RequestError(
            body?.error?.message ?? `Request to ${url} failed with status ${res.status}`,
            res.status,
            body?.error?.code
        );
    }

    return res.json() as Promise<TResponse>;
}