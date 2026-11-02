import { describe, expect, it, vi } from "vitest";
import { appendDialogue, loadDialogues } from "./dialogue-persistence";
import { initialWorld, runCycle } from "./world-core";
import type { D1Database, D1Statement } from "./persistence";

const initial = initialWorld([{ id: "marty", place: "port" }, { id: "natasha", place: "rotas" }]);
const events = runCycle(initial, [{ actor: "marty", kind: "move", to: "rotas" }]).events;
const encounter = events.find(event => event.type === "characters.met");
if (!encounter) throw new Error("Fixture encounter missing");
const dialogue = {
  encounterId: encounter.id,
  participants: ["marty", "natasha"] as const,
  turns: [{ speaker: "marty", text: "Salut." }, { speaker: "natasha", text: "Bonjour." }],
  followUps: [],
};

describe("Sherlock dialogue persistence", () => {
  it("rejects invented encounters before touching the database", async () => {
    const batch = vi.fn(async () => []);
    const db = { batch } as unknown as D1Database;
    await expect(appendDialogue(db, "session", events, { ...dialogue, encounterId: "fake" },
      { operationId: "op", source: "octopus" })).rejects.toThrow("Unknown dialogue encounter");
    expect(batch).not.toHaveBeenCalled();
  });

  it("stores validated dialogue with operation provenance", async () => {
    const bind = vi.fn(() => statement);
    const statement = { bind } as unknown as D1Statement;
    const batch = vi.fn(async () => []);
    const db = { prepare: vi.fn(() => statement), batch } as unknown as D1Database;
    await appendDialogue(db, "session", events, dialogue, { operationId: "op", source: "octopus" });
    expect(batch).toHaveBeenCalledOnce();
    expect(bind).toHaveBeenCalledWith("session", encounter.id, encounter.cycle, "op", "octopus", JSON.stringify(dialogue));
  });

  it("reads persisted conversations in encounter order", async () => {
    const statement = { bind: () => ({ all: async () => ({ results: [{
      encounter_id: encounter.id, cycle: encounter.cycle, operation_id: "op",
      source: "octopus", dialogue_json: JSON.stringify(dialogue), recorded_at: "now",
    }] }) }) };
    const db = { prepare: () => statement } as unknown as D1Database;
    const stored = await loadDialogues(db, "session");
    expect(stored[0].dialogue.turns).toHaveLength(2);
    expect(stored[0].source).toBe("octopus");
  });
});
