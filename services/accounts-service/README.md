
# accounts-service

## Owns
- `Account` (id, ownerId, balance, currency, createdAt) — its own Postgres database, `accounts_service`.
- A Redis cache-aside over individual `Account` reads (`accountCache.ts`), 60s TTL.
  Known gap, named honestly since Day 4 of Week 9: `debitAccount`/`creditAccount` never
  invalidate this cache, so a `GET` can read a balance up to 60s stale after a write.

## Calls
- Nothing. `accounts-service` has no outbound HTTP calls to any other service or
  3rd party — it's a leaf node, called by `transfers-service`, calling no one back.

## Doesn't own
- Anything to do with transfers, transactions, or currency conversion — `Account.currency`
  is validated and stored here, but never read here. `transfers-service` is the only
  thing that ever branches on it.

## Public surface
- `POST /accounts`, `GET /accounts`, `GET /accounts/:id` — owner-scoped, `requireAuth`.

## Internal surface (trusted callers only, no auth — Phase 31's deliberate choice)
- `GET /internal/accounts/:id`, `POST /internal/accounts/:id/debit`, `POST /internal/accounts/:id/credit`.