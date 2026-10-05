import type { DecisionExecutor, DecisionResult } from "./octopus-cycle";
import { PLACES, worldSignals } from "./world-core";
import type { PlaceId, ProposedAction } from "./world-core";

const CHARACTER_DRIVES: Record<string, string> = {
  "marie-jeanne": "Curieuse et indépendante; observe les changements de l'île et préfère vérifier par elle-même.",
  natasha: "Analytique et attentive aux signaux; cherche les anomalies, les informations et les systèmes à comprendre.",
  marty: "Sociable et mobile; aime rejoindre les lieux animés et voir ce que fabriquent les autres.",
  slobodane: "Terrien et contemplatif; privilégie les lieux calmes, naturels et les observations patientes.",
  lolo: "Expérimentateur; attiré par l'Institut, les phénomènes techniques et les choses à tester.",
  nikolas: "Attiré par les symboles et les traces; explore volontiers SATOR et les lieux énigmatiques.",
  ludmila: "Hôte du Club; attentive aux rencontres, à l'ambiance et aux mouvements autour de Ludmila.",
  max: "Indépendant et pragmatique; surveille son territoire mais se déplace lorsqu'une curiosité ou une rencontre l'appelle.",
};

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
  if (value.kind === "move" && typeof value.to === "string" && PLACES.includes(value.to as PlaceId) &&
      Object.keys(value).every(k => k === "actor" || k === "kind" || k === "to"))
    return { actor: value.actor, kind: "move", to: value.to as PlaceId };
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
  return async (request): Promise<DecisionResult> => {
    const operationId = crypto.randomUUID();
    const actorId = request.allowedActions[0]?.actor;
    const actorPlace = actorId ? request.state.characters[actorId]?.place : undefined;
    const localSignals = worldSignals(request.state)
      .filter(signal => actorPlace && (signal.place === actorPlace || request.state.hidden[signal.source]?.influence?.includes(actorPlace)))
      .map(signal => signal.observable
        ? { place: signal.place, intensity: signal.intensity, trace: signal.trace }
        : { place: signal.place, intensity: signal.intensity, trace: "unexplained local anomaly" });
    const response = await send(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json", ...(config.authorization ? { authorization: config.authorization } : {}) },
      body: JSON.stringify({
        operationId,
        title: "Sherlock character decision",
        objective: "Choose exactly one permitted action. Return JSON with an action object; do not invent places.",
        requiredCapabilities: ["copy.generate"],
        context: { id: `sherlock:${request.sessionId}:${request.cycle}`, label: "Blacklace world cycle",
          metadata: { sessionId: request.sessionId, cycle: request.cycle, state: request.state, allowedActions: request.allowedActions, localSignals } },
        prompt: `You are deciding only for ${request.allowedActions[0]?.actor}. Character drive: ${CHARACTER_DRIVES[request.allowedActions[0]?.actor] ?? "Explore Blacklace according to the current situation."} Choose exactly one action from this JSON array. The drive influences the choice but never overrides allowedActions. Return ONLY JSON {"action":<chosen action>}: ${JSON.stringify(request.allowedActions)}. Locally observable signals: ${JSON.stringify(localSignals)}. You may react to these observations, but never infer or name a hidden cause that is not present in the signal trace. Current world state: ${JSON.stringify(request.state)}`,
      }),
    });
    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).trim().replace(/\s+/g, " ").slice(0, 500);
      throw new Error(`Octopus HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
    }
    const payload: unknown = await response.json();
    if (!record(payload) || payload.status !== "completed" || payload.operationId !== operationId)
      throw new Error("Octopus mission was not completed or operation ID mismatched");
    const action = decodeOutput(payload.output);
    return { action, operationId, source: "octopus" };
  };
}
