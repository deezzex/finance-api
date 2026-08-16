import { request } from '@finance-api/shared';
import { config } from '../config/index.ts';

// frankfurter.dev's own response shape — kept local to this one file, translated
// into a plain, validated number before anything else in this service ever sees it.
interface FrankfurterResponse {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
}

export async function fetchExchangeRate(from: string, to: string): Promise<number> {
    const url = `${config.EXCHANGE_RATE_API_URL}/latest?from=${from}&to=${to}`;

    const data = await request<FrankfurterResponse>(url, {
        timeoutMs: config.EXCHANGE_RATE_TIMEOUT_MS
    });

    const rate = data.rates?.[to];

    // The provider can return HTTP 200 with a body that doesn't actually carry a
    // usable rate (an unsupported currency code, a malformed/changed response
    // shape). Trusting `data.rates[to]` without checking it here is exactly what
    // let a bad API response silently become `NaN`, then `null` on the wire, then
    // a confusing validation error two services away — checked directly, not
    // assumed, the same standard this project holds every other boundary to.
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
        throw new Error(`Exchange rate API returned no usable rate for ${from}->${to}: ${JSON.stringify(data)}`);
    }

    return rate;
}
