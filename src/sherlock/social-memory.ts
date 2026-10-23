import type { WorldEvent, PlaceId } from "./world-core";

/** Public, replayable social memories derived only from validated encounters.
 * No invented dialogue or hidden-world attribution. */
export type EncounterMemory = {
  id: string;
  cycle: number;
  place: PlaceId;
  participants: readonly [string, string];
  summary: string;
};

export function encounterMemories(events: readonly WorldEvent[]): EncounterMemory[] {
  const seen = new Set<string>();
  const memories: EncounterMemory[] = [];
  for (const event of events) {
    if (event.type !== "characters.met") continue;
    const participants = [...event.actors].sort() as [string, string];
    const key = `${event.cycle}:${event.at}:${participants.join(":")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    memories.push({
      id: event.id,
      cycle: event.cycle,
      place: event.at,
      participants,
      summary: `${participants[0]} et ${participants[1]} se sont rencontrés à ${event.at}.`,
    });
  }
  return memories;
}

export function memoriesForActor(memories: readonly EncounterMemory[], actor: string): EncounterMemory[] {
  return memories.filter(memory => memory.participants.includes(actor));
}
