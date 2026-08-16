
# finance-api

The original monolith. After three extraction phases (auth → `auth-service`, Week 9
Day 3; accounts → `accounts-service`, Week 9 Day 4; transfers → `transfers-service`,
Week 10 Day 1), this is what's left — worth stating plainly rather than glossing
over, since it's a genuinely unusual shape for a "service" to have.

## Owns
- **Nothing in Postgres.** `prisma/schema.prisma` holds only a `generator`/`datasource`
  block — zero models. `DATABASE_URL` is still required and a client still generates
  against `finance_api`, but nothing in the live app imports it anymore (only a stale,
  pre-extraction script, `src/scripts/seed-accounts.js`, still does — itself broken
  for the same reason `admin.controller.ts` is).
- **Two standalone worker processes**, run manually (`npm run worker` /
  `npm run audit-worker`), neither containerized, both proof of the same lesson from
  two different brokers: a consumer doesn't have to live anywhere near its producer,
  only agree with it on a queue/exchange name.
  - `transferReceiptWorker.ts` — consumes BullMQ's `transfer-receipts` queue,
    produced by `transfers-service` (Day 1, Week 10).
  - `auditLogWorker.ts` — consumes RabbitMQ's `audit-log` queue, bound to
    `transfers-service`'s `transfer-events` exchange, writes `transactions.log`
    (Week 10 Day 3) — the audit trail's third home, after starting here in Phase 8
    and passing through `transfers-service` for one day in between.

## Calls
- Nothing outbound from the HTTP app itself.
- The two workers each hold their own connection to whatever they consume from
  (Redis for the BullMQ worker, RabbitMQ for the audit worker) — infrastructure
  connections, not calls to another service.

## Doesn't own
- `User`, `Account`, `Transaction` — all three, and everything about authenticating,
  balances, or transfers, moved out across Week 9–10. Nothing here should ever be
  the source of truth for any of them again.

## Public surface
- `GET /health` — the one route that's worked, unchanged, since before any extraction began.
- `GET /admin/accounts/:id` — **still broken, on purpose.** `admin.controller.ts`
  dynamically imports `../services/accountService.ts`, a file that stopped existing
  the moment `accounts-service` was extracted. The dynamic import (rather than a
  static one) is deliberate — it's what stops a module that no longer exists from
  crashing the whole process at boot, since Node resolves static ESM imports
  eagerly. The route itself 404s/500s on every real call. Its own code comment
  says "broken on purpose until Phase 32" — read that literally as a snapshot of
  intent at the time it was written, not a current promise: Phase 32 has long since
  happened, and no later phase has scheduled fixing this route either. Naming that
  honestly here matters more than updating the comment, the same "don't quietly fix
  what a phase didn't ask for" discipline this project has held since Day 3 of Week 4.
- `requireAuth`/`requireRole('admin')` still gate `/admin` — verify-only, same
  public-key check every other service does, guarding a route that doesn't work
  once you're past the gate.

## Internal surface
- None. Nothing calls into `finance-api` — it's not reachable by any other service
  in this system anymore, only by whatever hits its two HTTP routes directly.

## Known gaps, named rather than hidden
- `GET /admin/accounts/:id` has no scheduled fix. It's not forgotten — it's
  deliberately out of scope for every phase so far, the same restraint applied to
  every other "don't fix what this phase didn't ask for" moment in this project.
- Neither worker has a supervisor, a restart policy, or a healthcheck — `npm run
  worker`/`npm run audit-worker` are meant to be run and watched by hand for this
  project's purposes; a real deployment would need both wrapped in something that
  restarts them on crash, which nothing here currently does.
- `src/scripts/seed-accounts.js` is dead code from before the `Account` extraction —
  never deleted, not currently reachable from anywhere real, the same category of
  leftover `transactionService.ts` was before Day 1 (Week 10) removed it.
