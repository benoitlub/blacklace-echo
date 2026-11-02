import { describe, expect, it } from "vitest";
import { createOctopusDialogueExecutor } from "./octopus-dialogue";
import type { EncounterMemory } from "./social-memory";

const encounter: EncounterMemory = {
  id: "31:2", cycle: 31, place: "rotas", participants: ["marty", "natasha"],
  summary: "Rencontre à Rotas",
};

describe("Octopus dialogue mission adapter", () => {
  it("accepts a verified dialogue from Octopus", async () => {
    const generate = createOctopusDialogueExecutor({
      endpoint: "https://octopus.example/mission",
      fetcher: (async (_url: string | URL | Request, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body));
        expect(request.context.metadata.place).toBe("rotas");
        expect(request.context.metadata).not.toHaveProperty("hidden");
        return new Response(JSON.stringify({
          status: "completed", operationId: request.operationId,
          output: { dialogue: {
            encounterId: encounter.id, participants: encounter.participants,
            turns: [{ speaker: "marty", text: "Salut !" }, { speaker: "natasha", text: "Bonjour." }],
            followUps: [],
          } },
        }), { status: 200 });
      }) as typeof fetch,
    });
    const result = await generate(encounter, []);
    expect(result.source).toBe("octopus");
    expect(result.proposal.turns).toHaveLength(2);
  });

  it("rejects mismatched operation IDs", async () => {
    const generate = createOctopusDialogueExecutor({
      endpoint: "https://octopus.example/mission",
      fetcher: (async () => new Response(JSON.stringify({
        status: "completed", operationId: "not-matching", output: {},
      }), { status: 200 })) as typeof fetch,
    });
    await expect(generate(encounter, [])).rejects.toThrow("Unverified");
  });
});
