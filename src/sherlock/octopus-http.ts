import type { DecisionExecutor, DecisionResult } from "./octopus-cycle";
import type { ProposedAction } from "./world-core";

export type OctopusHttpConfig = {
  endpoint: string;
  fetcher?: typeof fetch;
  authorization?: string;
};

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function parseDecision(value: unknown): ProposedAction {
  if (!record(value) || typeof value.actor !== "string") throw new Error("Invalid Octopus action");
  if (value.kind === "wait" && Object.keys(value).every(k => k === "actor" || k === "kind"))
    return { actor: value.actor, kind: "wait" };
  if (value.kind === "move" && typeof value.to === "string" &&
      Object.keys(value).every(k => k === "actor" || k === "kind" || k === "to"))
    return { actor: value.actor, kind: "move", to: value.to as ProposedAction & never };
  throw new Error("Invalid Octopus action shape");
}
function decodeOutput(output: unknown): ProposedAction {
  if (!record(output)) throw new Error("Octopus output missing");
  let candidate: unknown = output.action ?? output.decision;
  if (candidate === undefined && typeof output.text === "string") {
    const stripped = output.text.trim().replace(/^\x60\x60\x60(?:json)?\s*/i, "").replace(/\s*\x60\x60\x60$/, "");
    try { candidate = JSON.parse(stripped); } catch { throw new Error("Octopus decision is not valid JSON"); }
  }
  if (record(candidate) && "action" in candidate) candidate = candidate.action;
  return parseDecision(candidate);
}

/** Calls the existing Octopus POST /mission contract; rejects incomplete or unverifiable responses. */
export function createOctopusHttpExecutor(config: OctopusHttpConfig): DecisionExecutor {
  const url = new URL(config.endpoint);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
    throw new Error("Octopus endpoint must use HTTPS");
  if (url.pathname.replace(/\/$/, "") !== "/mission") throw new Error("Expected Octopus /mission endpoint");
  const send = config.fetcher ?? fetch;
  return async request: Promise<DecisionResult> => {
    const operationId = crypto.randomUUID();
    const response = await send(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json", ...(config.authorization ? { authorization: config.authorization } : {}) },
      body: JSON.stringify({
        operationId,
        title: "Sherlock character decision",
        objective: "Choose exactly one permitted action. Return JSON with an action object; do not invent places.",
        requiredCapabilities: ["content.generate"],
        context: { id: `sherlock:${request.sessionId}:${request.cycle}`, label: "Blacklace world cycle",
          metadata: { sessionId: request.sessionId, cycle: request.cycle, state: request.state, allowedActions: request.allowedActions } },
        prompt: `Choose exactly one action from this JSON array and return ONLY JSON {"action":<chosen action>}: ${JSON.stringify(request.allowedActions)}. State: ${JSON.stringify(request.state)}`,
      }),
    });
    if (!response.ok) throw new Error(`Octopus HTTP ${response.status}`);
    const payload: unknown = await response.json();
    if (!record(payload) || payload.status !== "completed" || payload.operationId !== operationId)
      throw new Error("Octopus mission was not completed or operation ID mismatched");
    const action = decodeOutput(payload.output);
    return { action, operationId, source: "octopus" };
  };
}
