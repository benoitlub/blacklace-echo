# S-001 persistence (D1 adapter, not deployed)

This adapter stores an immutable initial snapshot and an append-only ordered event log.
It rebuilds state using the existing deterministic reducer. A cycle is committed as one
D1 transactional batch; unique keys reject duplicate cycles/positions. The database
is authoritative; browser localStorage is not.

## Deployment prerequisites
1. Provision a dedicated Cloudflare D1 database for Sherlock.
2. Apply `src/sherlock/migrations/0001_world_log.sql` with the chosen Wrangler project.
3. Bind D1 to a future authenticated Worker; do not expose D1 credentials in Vite.
4. The Worker must generate session IDs, authenticate writers, serialize writes per
   session (or handle unique-constraint conflicts), and validate requests.
5. Keep canonical Notion content separate: these events are experimental, not canon.

No database was provisioned, no migrations were applied, and no production API exists
in this change. `createSession`, `appendCycle`, and `loadSession` are server-side
building blocks, not endpoints. The API and its authentication are a later milestone.
