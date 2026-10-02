/** SHERLOCK S-001: deterministic, model-free world simulation. No lore is canonized here. */
export type PlaceId = "port" | "rotas" | "max" | "ludmila" | "sator" | "institute" | "fournaise" | "reboot" | "observatoire";
export type CharacterId = string;
export type HiddenEntityKind = "incarnate" | "presence" | "artifact" | "resource";
export type HiddenEntityId = "aloisia" | "lili" | "feuch" | "fee-belette" | "sator-network" | "moscovium";
export type HiddenEntityState = {
  id: HiddenEntityId;
  kind: HiddenEntityKind;
  /** Canonical existence is distinct from public observability. */
  observable: boolean;
  place?: PlaceId;
  depth?: "surface" | "shallow" | "deep";
  state: "dormant" | "present" | "active" | "unknown";
  mood?: "quiet" | "curious" | "playful" | "restless" | "watchful" | "charged" | "unknown";
  influence?: readonly PlaceId[];
  description: string;
};
export type WorldEvent =
  | { id: string; cycle: number; type: "cycle.started" }
  | { id: string; cycle: number; type: "character.moved"; actor: CharacterId; from: PlaceId; to: PlaceId }
  | { id: string; cycle: number; type: "character.waited"; actor: CharacterId; at: PlaceId }
  | { id: string; cycle: number; type: "characters.met"; actors: readonly [CharacterId, CharacterId]; at: PlaceId };

export type CharacterActivity = "idle" | "exploring" | "observing" | "socializing" | "working";
export type CharacterState = {
  id: CharacterId;
  place: PlaceId;
  activity?: CharacterActivity;
  intention?: string;
  lastAction?: "wait" | "move";
};
export type WorldState = { cycle: number; characters: Record<CharacterId, CharacterState>; hidden: Record<HiddenEntityId, HiddenEntityState> };
export type WorldLog = { initial: WorldState; events: WorldEvent[] };
export type ProposedAction = { actor: CharacterId; kind: "move"; to: PlaceId } | { actor: CharacterId; kind: "wait" };

export const BLACKLACE_HIDDEN: readonly HiddenEntityState[] = [
  { id: "aloisia", kind: "incarnate", observable: true, place: "observatoire", state: "present", mood: "curious", influence: ["observatoire", "rotas"], description: "Version incarnée d'Aloisia sur l'île." },
  { id: "lili", kind: "incarnate", observable: true, place: "rotas", state: "present", mood: "quiet", influence: ["rotas"], description: "Présence incarnée de Lili sur Blacklace." },
  { id: "feuch", kind: "presence", observable: false, place: "fournaise", state: "unknown", mood: "unknown", influence: ["fournaise", "institute"], description: "Présence Feuch; ses manifestations doivent être observées avant d'être affirmées." },
  { id: "fee-belette", kind: "presence", observable: false, place: "reboot", state: "unknown", mood: "unknown", influence: ["reboot", "sator"], description: "Présence de la Fée Belette associée au Reboot." },
  { id: "sator-network", kind: "artifact", observable: true, place: "sator", state: "dormant", mood: "watchful", influence: ["sator", "reboot"], description: "Réseau persistant de carrés SATOR répartis dans l'île." },
  { id: "moscovium", kind: "resource", observable: false, depth: "deep", state: "present", mood: "quiet", description: "Moscovium présent dans les profondeurs de l'île; non observable directement depuis la surface." },
];

export const PLACES: readonly PlaceId[] = ["port", "rotas", "max", "ludmila", "sator", "institute", "fournaise", "reboot", "observatoire"];
export const CONNECTIONS: Readonly<Record<PlaceId, readonly PlaceId[]>> = {
  port: ["rotas"], rotas: ["port", "max", "ludmila", "sator", "institute", "observatoire"],
  max: ["rotas", "ludmila"], ludmila: ["rotas", "max"], sator: ["rotas", "reboot"],
  institute: ["rotas", "fournaise"], fournaise: ["institute"], reboot: ["sator"],
  observatoire: ["rotas"],
};

export function initialWorld(characters: readonly CharacterState[]): WorldState {
  const byId: WorldState["characters"] = Object.create(null);
  for (const character of characters) {
    if (!character.id || Object.prototype.hasOwnProperty.call(byId, character.id)) throw new Error("Invalid or duplicate character ID");
    if (!PLACES.includes(character.place)) throw new Error("Unknown place");
    byId[character.id] = { ...character };
  }
  const hidden = Object.create(null) as WorldState["hidden"];
  for (const entity of BLACKLACE_HIDDEN) hidden[entity.id] = { ...entity };
  return { cycle: 0, characters: byId, hidden };
}

export function applyEvent(state: WorldState, event: WorldEvent): WorldState {
  if (event.cycle !== state.cycle + (event.type === "cycle.started" ? 1 : 0)) throw new Error("Invalid event cycle");
  if (event.type === "cycle.started") return { ...state, cycle: event.cycle };
  if (event.type === "characters.met") {
    const [a, b] = event.actors;
    if (!a || !b || a === b) throw new Error("Invalid encounter");
    const first = state.characters[a];
    const second = state.characters[b];
    if (!first || !second || first.place !== event.at || second.place !== event.at) throw new Error("Invalid encounter location");
    return { ...state, characters: {
      ...state.characters,
      [a]: { ...first, activity: "socializing", intention: `Rencontrer ${b}` },
      [b]: { ...second, activity: "socializing", intention: `Rencontrer ${a}` },
    } };
  }
  const actor = state.characters[event.actor];
  if (!actor) throw new Error("Unknown character");
  if (event.type === "character.waited") {
    if (actor.place !== event.at) throw new Error("Invalid wait location");
    return { ...state, characters: { ...state.characters, [actor.id]: { ...actor, activity: "observing", intention: `Observer ${event.at}`, lastAction: "wait" } } };
  }
  if (actor.place !== event.from || !CONNECTIONS[event.from].includes(event.to)) throw new Error("Invalid movement");
  return { ...state, characters: { ...state.characters, [actor.id]: { ...actor, place: event.to, activity: "exploring", intention: `Explorer ${event.to}`, lastAction: "move" } } };
}

export function replay(initial: WorldState, events: readonly WorldEvent[]): WorldState {
  return events.reduce(applyEvent, initial);
}

/** Caller supplies actions: this core never claims an agent chose them autonomously. */
export function runCycle(state: WorldState, actions: readonly ProposedAction[]): { state: WorldState; events: WorldEvent[] } {
  const cycle = state.cycle + 1;
  const events: WorldEvent[] = [{ id: `${cycle}:0`, cycle, type: "cycle.started" }];
  let next = applyEvent(state, events[0]);
  const seen = new Set<string>();
  for (const action of actions) {
    if (seen.has(action.actor)) throw new Error("One action per character per cycle");
    seen.add(action.actor);
    const actor = next.characters[action.actor];
    if (!actor) throw new Error("Unknown character");
    const event: WorldEvent = action.kind === "wait"
      ? { id: `${cycle}:${events.length}`, cycle, type: "character.waited", actor: action.actor, at: actor.place }
      : { id: `${cycle}:${events.length}`, cycle, type: "character.moved", actor: action.actor, from: actor.place, to: action.to };
    next = applyEvent(next, event);
    events.push(event);
  }
  const actors = Object.values(next.characters).sort((a, b) => a.id.localeCompare(b.id));
  for (let i = 0; i < actors.length; i++) {
    for (let j = i + 1; j < actors.length; j++) {
      if (actors[i].place !== actors[j].place) continue;
      // A meeting is an arrival event, not a heartbeat: residents who were
      // already together before this cycle do not "meet" again every cycle.
      const beforeA = state.characters[actors[i].id];
      const beforeB = state.characters[actors[j].id];
      if (beforeA?.place === beforeB?.place) continue;
      const encounter: WorldEvent = {
        id: `${cycle}:${events.length}`,
        cycle,
        type: "characters.met",
        actors: [actors[i].id, actors[j].id],
        at: actors[i].place,
      };
      next = applyEvent(next, encounter);
      events.push(encounter);
    }
  }
  return { state: next, events };
}

/** Scripted control group, not an LLM or an autonomous agent. */
export function scriptedControlActions(state: WorldState): ProposedAction[] {
  return Object.keys(state.characters).sort().map((actor) => {
    const place = state.characters[actor].place;
    const neighbors = CONNECTIONS[place];
    return state.cycle % 2 === 0 && neighbors.length
      ? { actor, kind: "move" as const, to: neighbors[0] }
      : { actor, kind: "wait" as const };
  });
}

export function runControl(initial: WorldState, cycles: number): { state: WorldState; log: WorldLog } {
  if (!Number.isSafeInteger(cycles) || cycles < 0) throw new Error("Invalid cycle count");
  let state = initial;
  const events: WorldEvent[] = [];
  for (let i = 0; i < cycles; i++) {
    const result = runCycle(state, scriptedControlActions(state));
    state = result.state;
    events.push(...result.events);
  }
  return { state, log: { initial, events } };
}


export type WorldSignal = {
  source: HiddenEntityId;
  place: PlaceId;
  observable: boolean;
  mood: NonNullable<HiddenEntityState["mood"]>;
  intensity: number;
  trace: string;
};

/** Deterministic projection of environmental influence. It describes traces,
 * never a hidden entity's unobserved intention or cause. */
export function worldSignals(state: WorldState): WorldSignal[] {
  const signals: WorldSignal[] = [];
  for (const entity of Object.values(state.hidden ?? {})) {
    if (!entity.place || !entity.influence?.length) continue;
    const residents = Object.values(state.characters).filter(character => entity.influence?.includes(character.place)).length;
    const intensity = Math.min(3, (entity.state === "active" ? 2 : entity.state === "present" ? 1 : 0) + (residents > 0 ? 1 : 0));
    if (intensity === 0 && !entity.observable) continue;
    const trace = entity.observable
      ? `${entity.id} · ${entity.mood ?? "unknown"}`
      : `anomalie locale · niveau ${intensity}`;
    signals.push({ source: entity.id, place: entity.place, observable: entity.observable, mood: entity.mood ?? "unknown", intensity, trace });
  }
  return signals;
}
