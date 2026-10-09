import { appendCycle, loadSession } from "./persistence";
import type { D1Database } from "./persistence";
import { CONNECTIONS, runCycle } from "./world-core";
import type { ProposedAction, WorldState } from "./world-core";

/** Boundary for an actual Octopus decision service. No scripted or local fallback. */
export type DecisionRequest = {
  sessionId: string;
  cycle: number;
  state: WorldState;
  allowedActions: readonly ProposedAction[];
};
export type DecisionResult = {
  action: ProposedAction;
  operationId: string;
  source: "octopus";
};
export type DecisionExecutor = (request: DecisionRequest) => Promise<DecisionResult>;

export type CommittedCycle = {
  sessionId: string;
  state: WorldState;
  events: ReturnType<typeof runCycle>["events"];
  operationId: string;
  source: "octopus";
  recordedAt: string;
};

export function allowedActionsFor(state: WorldState, actorId: string): ProposedAction[] {
  const actor = state.characters[actorId];
  if (!actor) throw new Error("Unknown character");
  return [
    { actor: actorId, kind: "wait" },
    ...CONNECTIONS[actor.place].map((to) => ({ actor: actorId, kind: "move" as const, to })),
  ];
}

/** One real decision, validated and persisted. Requires a caller-provided live executor and D1. */
export async function commitOctopusCycle(
  db: D1Database,
  sessionId: string,
  actorId: string,
  decide: DecisionExecutor,
): Promise<CommittedCycle> {
  if (!sessionId.trim()) throw new Error("Session ID required");
  const session = await loadSession(db, sessionId);
  if (!session) throw new Error("Session not found");
  const allowedActions = allowedActionsFor(session.state, actorId);
  let decision = await decide({
    sessionId,
    cycle: session.state.cycle + 1,
    state: session.state,
    allowedActions,
  });
  if (decision.source !== "octopus" || !decision.operationId?.trim()) {
    throw new Error("Unverified Octopus decision");
  }
  const permitted = (action: ProposedAction) => allowedActions.some(candidate =>
    candidate.actor === action.actor &&
    candidate.kind === action.kind &&
    (candidate.kind === "wait" || (action.kind === "move" && candidate.to === action.to))
  );
  // A model may return a plausible but forbidden move. Ask Octopus once more;
  // never substitute a scripted action or bypass the authoritative rules.
  if (!permitted(decision.action)) {
    decision = await decide({
      sessionId,
      cycle: session.state.cycle + 1,
      state: session.state,
      allowedActions,
    });
    if (decision.source !== "octopus" || !decision.operationId?.trim())
      throw new Error("Unverified Octopus decision");
  }
  if (!permitted(decision.action)) {
    throw new Error("Decision is not an allowed action");
  }
  const result = runCycle(session.state, [decision.action]);
  await appendCycle(db, sessionId, session.state.cycle, result.events, { operationId: decision.operationId, source: decision.source, actorId, action: decision.action });
  const persisted = await loadSession(db, sessionId);
  if (!persisted || persisted.state.cycle !== result.state.cycle ||
      JSON.stringify(persisted.state) !== JSON.stringify(result.state)) {
    throw new Error("Persisted cycle verification failed");
  }
  const provenance = persisted.decisions.find(item => item.cycle === result.state.cycle);
  if (!provenance || provenance.operationId !== decision.operationId || provenance.actorId !== actorId ||
      JSON.stringify(provenance.action) !== JSON.stringify(decision.action)) throw new Error("Persisted provenance verification failed");
  return { sessionId, state: persisted.state, events: result.events, operationId: provenance.operationId, source: provenance.source, recordedAt: provenance.recordedAt };
}
