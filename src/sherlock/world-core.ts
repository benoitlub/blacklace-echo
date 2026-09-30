/** SHERLOCK S-001: deterministic, model-free world simulation. No lore is canonized here. */
export type PlaceId = "port" | "rotas" | "max" | "ludmila" | "sator" | "institute" | "fournaise" | "reboot" | "observatoire";
export type CharacterId = string;
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
export type WorldState = { cycle: number; characters: Record<CharacterId, CharacterState> };
export type WorldLog = { initial: WorldState; events: WorldEvent[] };
export type ProposedAction = { actor: CharacterId; kind: "move"; to: PlaceId } | { actor: CharacterId; kind: "wait" };

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
  return { cycle: 0, characters: byId };
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
