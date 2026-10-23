import { describe, expect, it } from "vitest";
import { dialogueContext, validateDialogue } from "./dialogue";
import type { EncounterMemory } from "./social-memory";

const encounter: EncounterMemory = {
  id: "29:3", cycle: 29, place: "rotas",
  participants: ["marty", "natasha"], summary: "marty et natasha se sont rencontrés à rotas.",
};

describe("Sherlock dialogue contract", () => {
  it("uses only prior recorded encounters as memory", () => {
    const context = dialogueContext(encounter, [
      { ...encounter, id: "12:2", cycle: 12 },
      { ...encounter, id: "30:1", cycle: 30 },
    ]);
    expect(context.priorEncounters).toHaveLength(1);
    expect(context.priorEncounters[0].cycle).toBe(12);
    expect(JSON.stringify(context)).not.toContain("hidden");
  });

  it("validates a two-way exchange and proposed intentions", () => {
    expect(validateDialogue(encounter, {
      encounterId: "29:3", participants: ["marty", "natasha"],
      turns: [{ speaker: "marty", text: "Tu as vu la fontaine ?" }, { speaker: "natasha", text: "Je vais vérifier." }],
      followUps: [{ actor: "natasha", intention: "Examiner la fontaine" }],
    }).turns).toHaveLength(2);
  });

  it("rejects unverified participants and one-sided dialogue", () => {
    expect(() => validateDialogue(encounter, {
      encounterId: "29:3", participants: ["marty", "natasha"],
      turns: [{ speaker: "marty", text: "Bonjour" }, { speaker: "feuch", text: "Surprise" }],
      followUps: [],
    })).toThrow("Invalid dialogue turn");
    expect(() => validateDialogue(encounter, {
      encounterId: "29:3", participants: ["marty", "natasha"],
      turns: [{ speaker: "marty", text: "Bonjour" }, { speaker: "marty", text: "Allô ?" }],
      followUps: [],
    })).toThrow("Both participants");
  });
});
