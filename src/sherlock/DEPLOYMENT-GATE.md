# Sherlock Worker — deployment gate (not deployed)

The GitHub Pages workflow deploys only the Vite front end. It does **not** deploy `src/sherlock/worker.ts`, create D1, or supply secrets. No public Start button until this checklist passes.

## Cloudflare setup (operator action)

1. Provision a dedicated D1 database named `blacklace-sherlock` in the intended Cloudflare account. Record its actual database ID. Do not invent one.
2. Configure a separate Worker with entrypoint `src/sherlock/worker.ts`, compatibility date, and binding `SHERLOCK_DB` referencing that actual ID. Set its migrations directory to `src/sherlock/migrations` (or apply the SQL explicitly through the Cloudflare D1 tooling). Do not reuse the front-end GitHub Pages deployment.
3. Set Worker secrets `SHERLOCK_API_TOKEN` (high-entropy, private), and optionally `OCTOPUS_AUTHORIZATION` if the Octopus service supports it. Set `OCTOPUS_MISSION_URL` to the actual HTTPS Octopus `/mission` endpoint. Do not put the Sherlock token in Vite variables or browser JavaScript.
4. Apply both `0001_world_log.sql` and `0002_cycle_decisions.sql` to the actual D1 database, first in preview/staging. Deploy the Worker only after reviewing bindings and account.
5. Keep the Worker private/protected at the edge: the current token header alone does not implement per-user access control, rate limiting, or browser session authentication.

## Real acceptance sequence

- `GET /health` reports `configured` (configuration only, not a D1 or Octopus connectivity check).
- Authenticated `POST /api/sherlock/sessions` returns a new session whose persisted state contains `marie-jeanne` at `port`, cycle 0.
- Authenticated `GET /api/sherlock/sessions/:id` independently returns that state.
- Authenticated `POST /api/sherlock/sessions/:id/cycles` obtains a completed matching Octopus mission, validates its permitted action, appends the cycle to D1, and verifies it by rereading D1.
- A fresh GET after a new request returns cycle 1 and the same events. Verify after Worker restart/redeploy too.
- Deliberately break Octopus and verify that the endpoint fails without generating a new cycle. Check the actual session after any ambiguous storage error before retrying.

**Current action set:** only `wait` for Marie Jeanne. This is a real persisted decision only if Octopus actually returns it; it is not evidence of autonomous roaming or character memory. The simulated place graph is not approved island geography.

**Important gaps before production:** durable provenance is implemented in the D1 schema and write path but has not been deployed or verified against a real D1 instance; cross-request idempotency; strict access control and rate limiting; server-side schema validation and authorization of the actor; dedicated deployment workflow and end-to-end tests. Do not claim the simulation is live until these are addressed and tested.

## Public chat projection (opt-in; not yet deployed)

- Set `SHERLOCK_PUBLIC_SESSION_ID` to a real, deliberately published session ID and `SHERLOCK_PUBLIC_ORIGIN` to the exact approved website origin (for browser CORS). Do not publish a private session. The endpoint is publicly readable once enabled; CORS is not access control.
- Set the Vite build variable `VITE_SHERLOCK_PUBLIC_FEED_URL` to the actual HTTPS Worker `/api/sherlock/public-feed` URL. This URL is public; never use `SHERLOCK_API_TOKEN` in the front end.
- The feed exposes only validated `character.waited` events with a matching persisted Octopus decision. It is an event projection, not generated character speech, live chat, or a proof of a deployed autonomous system.
- Test disabled/missing binding behavior, D1 migrations, authorized session lifecycle, Octopus failure, and the actual browser origin before enabling the public feed.
