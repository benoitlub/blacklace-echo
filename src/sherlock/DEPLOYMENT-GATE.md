# Sherlock Worker — deployment gate (not deployed)

The GitHub Pages workflow deploys only the Vite front end. It does **not** deploy `src/sherlock/worker.ts`, create D1, or supply secrets. No public Start button until this checklist passes.

## Cloudflare setup (operator action)

1. Provision a dedicated D1 database named `blacklace-sherlock` in the intended Cloudflare account. Record its actual database ID. Do not invent one.
2. Configure a separate Worker with entrypoint `src/sherlock/worker.ts`, compatibility date, and binding `SHERLOCK_DB` referencing that actual ID. Set its migrations directory to `src/sherlock/migrations` (or apply the SQL explicitly through the Cloudflare D1 tooling). Do not reuse the front-end GitHub Pages deployment.
3. Set Worker secrets `SHERLOCK_API_TOKEN` (high-entropy, private), and optionally `OCTOPUS_AUTHORIZATION` if the Octopus service supports it. Set `OCTOPUS_MISSION_URL` to the actual HTTPS Octopus `/mission` endpoint. Do not put the Sherlock token in Vite variables or browser JavaScript.
4. Apply `0001_world_log.sql` to the actual D1 database, first in preview/staging. Deploy the Worker only after reviewing bindings and account.
5. Keep the Worker private/protected at the edge: the current token header alone does not implement per-user access control, rate limiting, or browser session authentication.

## Real acceptance sequence

- `GET /health` reports `configured` (configuration only, not a D1 or Octopus connectivity check).
- Authenticated `POST /api/sherlock/sessions` returns a new session whose persisted state contains `marie-jeanne` at `port`, cycle 0.
- Authenticated `GET /api/sherlock/sessions/:id` independently returns that state.
- Authenticated `POST /api/sherlock/sessions/:id/cycles` obtains a completed matching Octopus mission, validates its permitted action, appends the cycle to D1, and verifies it by rereading D1.
- A fresh GET after a new request returns cycle 1 and the same events. Verify after Worker restart/redeploy too.
- Deliberately break Octopus and verify that the endpoint fails without generating a new cycle. Check the actual session after any ambiguous storage error before retrying.

**Current action set:** only `wait` for Marie Jeanne. This is a real persisted decision only if Octopus actually returns it; it is not evidence of autonomous roaming or character memory. The simulated place graph is not approved island geography.

**Important gaps before production:** durable provenance of Octopus decisions (currently returned in response, not stored in D1); cross-request idempotency; strict access control and rate limiting; server-side schema validation and authorization of the actor; dedicated deployment workflow and end-to-end tests. Do not claim the simulation is live until these are addressed and tested.
