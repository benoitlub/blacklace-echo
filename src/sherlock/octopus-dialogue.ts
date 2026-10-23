import { validateDialogue, dialogueContext } from "./dialogue";
import type { DialogueProposal } from "./dialogue";
import type { EncounterMemory } from "./social-memory";

type Fetcher = typeof fetch;
type MissionOutput = Record<string, unknown>;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Live Octopus dialogue adapter. Never commits dialogue or claims an unverified response. */
export function createOctopusDialogueExecutor(config: { endpoint: string; fetcher?: Fetcher; authorization?: string }) {
  const url = new URL(config.endpoint);
  if (url.pathname.replace(/\/$/, "") !== "/mission" ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))))
    throw new Error("Invalid Octopus mission endpoint");
  const send = config.fetcher ?? fetch;
  return async (encounter: EncounterMemory, history: readonly EncounterMemory[]): Promise<{ proposal: DialogueProposal; operationId: string; source: "octopus" }> => {
    const context = dialogueContext(encounter, history);
    const operationId = crypto.randomUUID();
    const response = await send(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json", ...(config.authorization ? { authorization: config.authorization } : {}) },
      body: JSON.stringify({
        operationId,
        title: "Sherlock encounter dialogue",
        objective: "Generate a short, grounded French conversation for this verified encounter, without inventing memories.",
        requiredCapabilities: ["copy.generate"],
        context: { id: `sherlock:dialogue:${encounter.id}`, label: "Blacklace encounter", metadata: context },
        prompt: `${context.instruction} Context: ${JSON.stringify(context)}. Return ONLY JSON with encounterId, participants, turns (speaker, text), followUps (actor, intention). Each participant must speak. Do not add other speakers.`,
      }),
    });
    if (!response.ok) throw new Error(`Octopus dialogue HTTP ${response.status}`);
    const payload: unknown = await response.json();
    if (!isRecord(payload) || payload.status !== "completed" || payload.operationId !== operationId || !isRecord(payload.output))
      throw new Error("Unverified Octopus dialogue response");
    const output = payload.output as MissionOutput;
    let candidate: unknown = output.dialogue ?? output.proposal ?? output.action;
    if (candidate === undefined && typeof output.text === "string") {
      const cleaned = output.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      try { candidate = JSON.parse(cleaned); } catch { throw new Error("Invalid Octopus dialogue JSON"); }
    }
    if (isRecord(candidate) && isRecord(candidate.dialogue)) candidate = candidate.dialogue;
    if (!isRecord(candidate)) throw new Error("Missing dialogue proposal");
    const proposal = validateDialogue(encounter, candidate as DialogueProposal);
    return { proposal, operationId, source: "octopus" };
  };
}
