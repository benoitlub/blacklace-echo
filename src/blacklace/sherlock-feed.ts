/** Only verified public projections are accepted; this is not a dialogue transport. */
export type PublicWorldEntry = { id: string; cycle: number; actor: string; kind: "waited"; place: string };
export function parsePublicFeed(payload: unknown): PublicWorldEntry[] {
  if (!payload || typeof payload !== "object" || !("entries" in payload) || !Array.isArray(payload.entries)) throw new Error("Invalid Sherlock feed");
  return payload.entries.filter((entry: unknown): entry is PublicWorldEntry => {
    if (!entry || typeof entry !== "object") return false;
    const e = entry as Record<string, unknown>;
    const parts = typeof e.id === "string" ? e.id.split(":") : [];
    return Number.isSafeInteger(e.cycle) && (e.cycle as number) >= 1 &&
      parts.length === 2 && parts[0] === String(e.cycle) && /^[1-9][0-9]*$/.test(parts[1]) &&
      typeof e.actor === "string" && e.actor.length > 0 && e.actor.length <= 80 &&
      e.kind === "waited" && typeof e.place === "string" && e.place.length <= 80;
  }).slice(-20);
}
export function describeWorldEntry(entry: PublicWorldEntry): { name: string; text: string } {
  const names: Record<string, string> = { "marie-jeanne": "MARIE JEANNE" };
  const places: Record<string, string> = { port: "au port de Porsa Rotas" };
  return { name: names[entry.actor] ?? "SHERLOCK", text: `Cycle ${entry.cycle} : ${names[entry.actor] ?? "Un personnage"} reste ${places[entry.place] ?? "sur place"}.` };
}
