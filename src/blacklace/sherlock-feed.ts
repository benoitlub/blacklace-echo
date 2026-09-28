/** Only verified public projections are accepted; this is not a dialogue transport. */
export type PublicWorldEntry =
  | { id: string; cycle: number; actor: string; kind: "waited"; place: string }
  | { id: string; cycle: number; actor: string; kind: "moved"; from: string; to: string };

const validPlace = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.length <= 80;

export function parsePublicFeed(payload: unknown): PublicWorldEntry[] {
  if (!payload || typeof payload !== "object" || !("entries" in payload) || !Array.isArray(payload.entries)) throw new Error("Invalid Sherlock feed");
  return payload.entries.filter((entry: unknown): entry is PublicWorldEntry => {
    if (!entry || typeof entry !== "object") return false;
    const e = entry as Record<string, unknown>;
    const parts = typeof e.id === "string" ? e.id.split(":") : [];
    const common = Number.isSafeInteger(e.cycle) && (e.cycle as number) >= 1 &&
      parts.length === 2 && parts[0] === String(e.cycle) && /^[1-9][0-9]*$/.test(parts[1]) &&
      typeof e.actor === "string" && e.actor.length > 0 && e.actor.length <= 80;
    if (!common) return false;
    if (e.kind === "waited") return validPlace(e.place);
    if (e.kind === "moved") return validPlace(e.from) && validPlace(e.to) && e.from !== e.to;
    return false;
  }).slice(-20);
}

export function describeWorldEntry(entry: PublicWorldEntry): { name: string; text: string } {
  const names: Record<string, string> = { "marie-jeanne": "MARIE JEANNE" };
  const places: Record<string, string> = {
    port: "Port Porsa Rotas", rotas: "Rotas", max: "Max Liberty", ludmila: "Club Ludmila",
    sator: "SATOR", institute: "Feuch Institute", fournaise: "Fournaise", reboot: "Cascade Reboot",
    observatoire: "Observatoire",
  };
  const name = names[entry.actor] ?? "Un personnage";
  if (entry.kind === "moved") {
    return { name: names[entry.actor] ?? "SHERLOCK", text: `Cycle ${entry.cycle} : ${name} se déplace de ${places[entry.from] ?? entry.from} vers ${places[entry.to] ?? entry.to}.` };
  }
  return { name: names[entry.actor] ?? "SHERLOCK", text: `Cycle ${entry.cycle} : ${name} reste à ${places[entry.place] ?? entry.place}.` };
}
