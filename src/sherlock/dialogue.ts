import type { EncounterMemory } from "./social-memory";

/** A dialogue proposal is not a canonical event until separately approved and persisted. */
export type DialogueTurn = { speaker: string; text: string };
export type DialogueProposal = {
  encounterId: string;
  participants: readonly [string, string];
  turns: readonly DialogueTurn[];
  followUps: readonly { actor: string; intention: string }[];
};

export function dialogueContext(memory: EncounterMemory, prior: readonly EncounterMemory[]) {
  return {
    encounterId: memory.id,
    cycle: memory.cycle,
    place: memory.place,
    participants: memory.participants,
    priorEncounters: prior.filter(item =>
      item.cycle < memory.cycle && item.participants.some(actor => memory.participants.includes(actor))
    ).map(item => ({ cycle: item.cycle, place: item.place, participants: item.participants })),
    instruction: "Generate a short in-character dialogue in French. Only the two participants may speak. Treat environmental anomalies as observations, never proof of hidden causes. Do not invent shared memories or assert that the dialogue has occurred.",
  };
}

export function validateDialogue(memory: EncounterMemory, proposal: DialogueProposal): DialogueProposal {
  if (proposal.encounterId !== memory.id ||
      proposal.participants.length !== 2 ||
      proposal.participants[0] !== memory.participants[0] ||
      proposal.participants[1] !== memory.participants[1]) throw new Error("Dialogue encounter mismatch");
  if (!Array.isArray(proposal.turns) || proposal.turns.length < 2 || proposal.turns.length > 12)
    throw new Error("Dialogue length invalid");
  if (!proposal.turns.every(turn => memory.participants.includes(turn.speaker) &&
      typeof turn.text === "string" && turn.text.trim().length > 0 && turn.text.length <= 600))
    throw new Error("Invalid dialogue turn");
  if (new Set(proposal.turns.map(turn => turn.speaker)).size !== 2)
    throw new Error("Both participants must speak");
  if (!Array.isArray(proposal.followUps) || proposal.followUps.length > 4 ||
      !proposal.followUps.every(item => memory.participants.includes(item.actor) &&
        typeof item.intention === "string" && item.intention.trim().length > 0 && item.intention.length <= 240))
    throw new Error("Invalid dialogue follow-up");
  return proposal;
}
