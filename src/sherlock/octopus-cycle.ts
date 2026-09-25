import { appendCycle, loadSession } from "./persistence";
import type { D1Database } from "./persistence";
import { runCycle } from "./world-core";
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
};

export function allowedActionsFor(state: WorldState, actorId: string): ProposedAction[] {
  const actor = state.characters[actorId];
  if (!actor) throw new Error("Unknown character");
  // Until geographic links are approved, no movement is exposed to a real agent.
  return [{ actor: actorId, kind: "wait" }];
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
  const decision = await decide({
    sessionId,
    cycle: session.state.cycle + 1,
    state: session.state,
    allowedActions,
  });
  if (decision.source !== "octopus" || !decision.operationId?.trim()) {
    throw new Error("Unverified Octopus decision");
  }
  if (!allowedActions.some(action => JSON.stringify(action) === JSON.stringify(decision.action))) {
    throw new Error("Decision is not an allowed action");
  }
  const result = runCycle(session.state, [decision.action]);
  await appendCycle(db, sessionId, session.state.cycle, result.events);
  const persisted = await loadSession(db, sessionId);
  if (!persisted || persisted.state.cycle !== result.state.cycle ||
      JSON.stringify(persisted.state) !== JSON.stringify(result.state)) {
    throw new Error("Persisted cycle verification failed");
  }
  return { sessionId, state: persisted.state, events: result.events, operationId: decision.operationId, source: "octopus" };
}
