import { describe, expect, it, vi } from "vitest";
import { proposeEncounterDialogue } from "./dialogue-cycle";
import type { EncounterMemory } from "./social-memory";

const encounter: EncounterMemory = {
  id: "5:3", cycle: 5, place: "rotas",
  participants: ["marty", "natasha"], summary: "Rencontre à Rotas",
};

describe("Sherlock dialogue generation boundary", () => {
  it("passes verified encounter context and accepts a two-way dialogue", async () => {
    const generate = vi.fn(async () => ({
      encounterId: "5:3",
      participants: ["marty", "natasha"] as const,
      turns: [{ speaker: "marty", text: "Bonjour !" }, { speaker: "natasha", text: "Bonjour Marty." }],
      followUps: [],
    }));
    const result = await proposeEncounterDialogue(encounter, [], generate);
    expect(result.turns).toHaveLength(2);
    expect(generate).toHaveBeenCalledOnce();
    expect(generate).toHaveBeenCalledWith(expect.objectContaining({ place: "rotas" }));
  });

  it("rejects invented speakers without committing a dialogue", async () => {
    await expect(proposeEncounterDialogue(encounter, [], async () => ({
      encounterId: "5:3",
      participants: ["marty", "natasha"],
      turns: [{ speaker: "marty", text: "Salut" }, { speaker: "aloisia", text: "Bonjour" }],
      followUps: [],
    }))).rejects.toThrow("Invalid dialogue turn");
  });
});
