export function assertNever(value) {
    throw new Error(`Unhandled event type: ${JSON.stringify(value)}`);
}
