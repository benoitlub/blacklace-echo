# SHERLOCK S-002 — Character lore ingestion

Source of truth: Notion Blacklace Island / Habitants, Grimoire and Constitution.
This module contains a **curated, attributed seed**, not a full Notion sync.
The full biography stays in Notion; the model receives only relevant, approved facts.

## Injection pipeline
1. A server-side importer reads Notion through authenticated credentials (future step).
2. Extract atomic facts with source URL, scope, subjects, visibility and canon status.
3. Human review resolves aliases (Martin/Marty; Oksana/Ludmila), contradictions and draft story ideas.
4. Store approved versioned snapshots; never place Notion credentials in the public Vite bundle.
5. On each character action, compose world facts + own bio + known relationships + personally observed events + private memory.
6. Feed the composed context to the future Aloisia/Octopus adapter. No raw global Grimoire dump.
7. Log source IDs, snapshot version and generated action; never automatically promote generated lore to canon.

## Seed sources
- Grimoire: https://app.notion.com/p/362391197253812db60bf777a6467d51
- Constitution: https://app.notion.com/p/3b339119725381d3bc8de77f8d2917ac
- Natasha: https://app.notion.com/p/2d1391197253809eb0ccff665d0ff528
- Marty: https://app.notion.com/p/35b391197253804d9c4df7fee6497b03
- Nikolas: https://app.notion.com/p/2d139119725380efa346f979d200e17a
- Ludmila: https://app.notion.com/p/2d139119725380fbb4dee5bb97703985

Not implemented: automated sync, server-only deployment, full cast, private memory store,
agent execution and conflict-review UI. This file is a design and seed registry only.
