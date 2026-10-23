import type { D1Database } from "./persistence";
import type { DialogueProposal } from "./dialogue";
import { validateDialogue } from "./dialogue";
import { encounterMemories } from "./social-memory";
import type { WorldEvent } from "./world-core";

export type StoredDialogue = {
  encounterId: string;
  cycle: number;
  operationId: string;
  source: "octopus";
  dialogue: DialogueProposal;
  recordedAt: string;
};

type DialogueRow = {
  encounter_id: string;
  cycle: number;
  operation_id: string;
  source: "octopus";
  dialogue_json: string;
  recorded_at: string;
};

export async function loadDialogues(db: D1Database, sessionId: string): Promise<StoredDialogue[]> {
  const rows = await db.prepare(
    "SELECT encounter_id, cycle, operation_id, source, dialogue_json, recorded_at FROM sherlock_dialogues WHERE session_id = ? ORDER BY cycle ASC, encounter_id ASC"
  ).bind(sessionId).all<DialogueRow>();
  return rows.results.map(row => ({
    encounterId: row.encounter_id,
    cycle: row.cycle,
    operationId: row.operation_id,
    source: row.source,
    dialogue: JSON.parse(row.dialogue_json) as DialogueProposal,
    recordedAt: row.recorded_at,
  }));
}

/** Persist only an encounter actually present in this session's event log.
 * Primary key guarantees at most one canonical conversation per encounter. */
export async function appendDialogue(
  db: D1Database,
  sessionId: string,
  events: readonly WorldEvent[],
  proposal: DialogueProposal,
  provenance: { operationId: string; source: "octopus" },
): Promise<void> {
  if (!sessionId.trim() || !provenance.operationId.trim() || provenance.source !== "octopus")
    throw new Error("Invalid dialogue provenance");
  const encounter = encounterMemories(events).find(item => item.id === proposal.encounterId);
  if (!encounter) throw new Error("Unknown dialogue encounter");
  validateDialogue(encounter, proposal);
  await db.batch([db.prepare(
    "INSERT INTO sherlock_dialogues (session_id, encounter_id, cycle, operation_id, source, dialogue_json) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(sessionId, encounter.id, encounter.cycle, provenance.operationId, provenance.source, JSON.stringify(proposal))]);
}
