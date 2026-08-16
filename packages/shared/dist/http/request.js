export class RequestError extends Error {
    status;
    code;
    constructor(message, status, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
export async function request(url, options = {}) {
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
        const body = await res.json().catch(() => null);
        throw new RequestError(body?.error?.message ?? `Request to ${url} failed with status ${res.status}`, res.status, body?.error?.code);
    }
    return res.json();
}
