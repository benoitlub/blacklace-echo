import type { DialogueProposal } from "./dialogue";
import { dialogueContext, validateDialogue } from "./dialogue";
import type { EncounterMemory } from "./social-memory";

export type DialogueExecutor = (context: ReturnType<typeof dialogueContext>) => Promise<DialogueProposal>;

/** Dialogue generation is optional and explicit: no fake speech or silent fallback. */
export async function proposeEncounterDialogue(
  encounter: EncounterMemory,
  history: readonly EncounterMemory[],
  generate: DialogueExecutor,
): Promise<DialogueProposal> {
  const context = dialogueContext(encounter, history);
  const proposal = await generate(context);
  return validateDialogue(encounter, proposal);
}
