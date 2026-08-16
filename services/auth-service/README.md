
# auth-service

## Owns
- `User` (id, email, passwordHash, role, createdAt) — its own Postgres database, `auth_service`.
- The RS256 private key. Phase 30's deliberate asymmetry: this is the only service
  that ever signs a token — `accounts-service` and `transfers-service` each hold
  only the public key, and can verify but never issue.

## Calls
- Nothing. `auth-service` has no outbound HTTP calls to any other service or
  3rd party — like `accounts-service`, it's a leaf node, never a caller.

## Doesn't own
- Anything about accounts, balances, or transfers — the `role` claim it signs into
  every token (`user`/`admin`) is the only fact about a user any other service
  ever gets from here; ownership/authorization on top of that role is each
  service's own problem, not this one's.

## Public surface
- `POST /auth/register` — email/password, bcrypt-hashed (12 salt rounds) before storage.
- `POST /auth/login` — verifies against a dummy hash comparison even when the email
  doesn't exist (`DUMMY_HASH`), so a nonexistent-user response and a wrong-password
  response take the same time — a real, deliberate timing-attack mitigation, not
  an incidental side effect of the code's shape.

## Internal surface
- None. Every other service verifies tokens locally against the public key
  (`JWT_PUBLIC_KEY`, `algorithms: ['RS256']`) — nothing ever calls back here to
  check a token is valid.

## Notes
- Tokens expire in 1 hour (`expiresIn: '1h'`), signed with `{ sub: user.id, role }`.
- If `JWT_PRIVATE_KEY` is ever compromised, every other service's trust in every
  token it's ever issued needs to be assumed broken — Phase 40's wrap names key
  rotation as a real, still-open gap, not something this service currently handles.
