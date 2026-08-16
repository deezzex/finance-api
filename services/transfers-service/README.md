
# transfers-service

## Owns
- `Transaction` (id, fromAccountId, toAccountId, amount, exchangeRate, idempotencyKey,
  createdAt) — its own Postgres database, `transfers_service`. `idempotencyKey` is
  `@unique` at the database level (Day 1) — the actual guarantee against a
  double-apply, not the upfront lookup that runs before it. `exchangeRate` is
  nullable (Day 4 of Week 10) — `NULL` for a same-currency transfer, a real rate
  for a cross-currency one.

## Calls
- **`accounts-service`**, over HTTP, via Phase 29's generic `request<TResponse>` client:
  `GET /internal/accounts/:id` (ownership check and, since Week 10 Day 4, the
  destination account's currency too — fetched in parallel, both before any money moves),
  `POST /internal/accounts/:id/debit`, `POST /internal/accounts/:id/credit` (both the
  real credit and the compensating reverse-credit on failure).
- **RabbitMQ** — publishes `transfer.completed`/`transfer.failed` to the `transfer-events`
  topic exchange once each saga finishes (Week 10 Day 2), routing key = the event's own
  `type`. Fire-and-forget from the saga's perspective — a publish failure is caught and
  logged inside the listener itself, never allowed to turn an already-successful
  transfer into a client-visible error (Week 10 Day 2, Block 7).
- **Redis, two separate, unrelated uses** — worth keeping distinct rather than treating
  as one "uses Redis" fact: (1) BullMQ's `transfer-receipts` queue, produced here and
  consumed by a worker that lives in `finance-api` instead (Day 1's "coupled to the
  broker, not the process" lesson); (2) a cache-aside over exchange rates
  (`exchangeRateCache.ts`), a short 5-minute TTL that's the entire staleness bound on
  a value this system doesn't own, not a performance optimization the way
  `accounts-service`'s own account cache is.
- **A real 3rd-party exchange-rate API** (`frankfurter.dev`, no key required) — the
  first dependency in this system that isn't started or stopped by this project's
  own `docker-compose.yml`. Called with an explicit timeout
  (`EXCHANGE_RATE_TIMEOUT_MS`); any failure — timeout, network error, or a response
  that doesn't actually carry a usable rate — becomes a `503`/`EXCHANGE_RATE_UNAVAILABLE`,
  never a silently wrong or stale rate.

## Doesn't own
- `Account`, balances, or currency validation — `accounts-service` is the only
  source of truth for all three. This service reads an account's `currency` to
  decide *whether* to convert; it never writes to `Account` directly, only through
  `accounts-service`'s own debit/credit endpoints.

## Public surface
- `POST /transfers` — `requireAuth`, then a per-user rate limit (10/min), then
  `Idempotency-Key` header required, then the saga.

## Internal surface
- None exposed. Nothing calls into `transfers-service` except real clients hitting
  `POST /transfers` directly — it's the end of the chain on the inbound side, even
  though it has the widest outbound footprint of any service in this system.

## Known gaps, named rather than hidden
- The saga is not a distributed transaction — a crash in this process between the
  debit call succeeding and the credit call being attempted leaves a real,
  un-reversed debit with nothing that automatically notices (Day 1, Block 9).
- No reconnect loop for the RabbitMQ connection — a broker outage at startup fails
  the whole process (relies on container `restart: unless-stopped`, a cruder
  substitute for a real retry); a connection that drops *after* startup is caught
  per-publish, not reconnected automatically (Week 10 Day 2, Block 4).
- No correlation ID is currently forwarded on outbound calls to `accounts-service`
  or attached to published RabbitMQ events — a single transfer's journey can't yet
  be reconstructed by grepping one ID across services' logs (Week 11 Day 1, closed
  by Phase 37).
