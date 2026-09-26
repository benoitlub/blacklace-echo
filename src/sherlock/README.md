# SHERLOCK S-001 — World Core

A deliberately small, deterministic, model-free simulation for Blacklace Echo.

- `initialWorld` creates a snapshot from explicitly supplied characters; placeholder IDs in tests are **not** canonical Blacklace character profiles.
- `runCycle` validates proposed moves or waits against a place graph and emits ordered events.
- `replay` reconstructs a world snapshot from its initial state and event log.
- `runControl(initial, 100)` supplies a reproducible scripted comparison group.
- No browser, storage, API, model, or paid call is required.

Run: `npm test -- src/sherlock/world-core.test.ts`

**Scope boundary:** this is an in-memory foundation. It does not yet provide server persistence, an agent scheduler, autonomous behavior, Octopus integration, an observation cockpit, or changes to the existing UI. Do not label scripted events as AI-generated. The event log must be persisted by a future backend before calling it durable.
