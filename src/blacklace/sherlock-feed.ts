/** Only verified public projections are accepted; this is not a dialogue transport. */
export type PublicWorldEntry =
  | { id: string; cycle: number; actor: string; kind: "waited"; place: string; activity?: string; intention?: string }
  | { id: string; cycle: number; actor: string; kind: "moved"; from: string; to: string; activity?: string; intention?: string }
  | { id: string; cycle: number; actors: readonly [string, string]; kind: "met"; place: string };

export type PublicWorldSignal = { place: string; observable: boolean; intensity: number; trace: string; source?: string; mood?: string };

const validPlace = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.length <= 80;

export function parsePublicFeed(payload: unknown): PublicWorldEntry[] {
  if (!payload || typeof payload !== "object" || !("entries" in payload) || !Array.isArray(payload.entries)) throw new Error("Invalid Sherlock feed");
  return payload.entries.filter((entry: unknown): entry is PublicWorldEntry => {
    if (!entry || typeof entry !== "object") return false;
    const e = entry as Record<string, unknown>;
    const parts = typeof e.id === "string" ? e.id.split(":") : [];
    const eventIdOk = (parts.length === 2 && parts[0] === String(e.cycle) && /^[1-9][0-9]*$/.test(parts[1])) ||
      (parts.length === 3 && parts[0] === "presence" && parts[1] === String(e.cycle) && typeof parts[2] === "string" && parts[2].length > 0);
    const common = Number.isSafeInteger(e.cycle) && (e.cycle as number) >= 1 && eventIdOk;
    if (!common) return false;
    if (e.kind === "met") return Array.isArray(e.actors) && e.actors.length === 2 &&
      e.actors.every(actor => typeof actor === "string" && actor.length > 0 && actor.length <= 80) &&
      e.actors[0] !== e.actors[1] && validPlace(e.place);
    if (typeof e.actor !== "string" || e.actor.length === 0 || e.actor.length > 80) return false;
    if (e.kind === "waited") return validPlace(e.place);
    if (e.kind === "moved") return validPlace(e.from) && validPlace(e.to) && e.from !== e.to;
    return false;
  }).slice(-20);
}

export function describeWorldEntry(entry: PublicWorldEntry): { name: string; text: string } {
  const names: Record<string, string> = {
    "marie-jeanne": "MARIE JEANNE", natasha: "NATASHA", marty: "MARTY", slobodane: "SLOBODANE",
    lolo: "LOLO", nikolas: "NIKOLAS", ludmila: "LUDMILA", max: "MAX",
  };
  const places: Record<string, string> = {
    port: "Port Porsa Rotas", rotas: "Rotas", max: "Max Liberty", ludmila: "Club Ludmila",
    sator: "SATOR", institute: "Feuch Institute", fournaise: "Fournaise", reboot: "Cascade Reboot",
    observatoire: "Observatoire",
  };
  if (entry.kind === "met") {
    const [a, b] = entry.actors;
    return { name: "SHERLOCK", text: `Cycle ${entry.cycle} : ${names[a] ?? a} rencontre ${names[b] ?? b} à ${places[entry.place] ?? entry.place}.` };
  }
  const name = names[entry.actor] ?? entry.actor;
  if (entry.kind === "moved") {
    return { name: names[entry.actor] ?? "SHERLOCK", text: `Cycle ${entry.cycle} : ${name} se déplace de ${places[entry.from] ?? entry.from} vers ${places[entry.to] ?? entry.to}.` };
  }
  return { name: names[entry.actor] ?? "SHERLOCK", text: `Cycle ${entry.cycle} : ${name} reste à ${places[entry.place] ?? entry.place}.` };
}


export function parsePublicSignals(payload: unknown): PublicWorldSignal[] {
  if (!payload || typeof payload !== "object" || !("signals" in payload) || !Array.isArray(payload.signals)) return [];
  return payload.signals.filter((signal: unknown): signal is PublicWorldSignal => {
    if (!signal || typeof signal !== "object") return false;
    const s = signal as Record<string, unknown>;
    return validPlace(s.place) && typeof s.observable === "boolean" &&
      Number.isSafeInteger(s.intensity) && (s.intensity as number) >= 0 && (s.intensity as number) <= 3 &&
      typeof s.trace === "string" && s.trace.length > 0 && s.trace.length <= 160 &&
      (s.source === undefined || typeof s.source === "string") &&
      (s.mood === undefined || typeof s.mood === "string");
  });
}
