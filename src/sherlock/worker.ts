import { createSession, ensureSessionCharacters, loadSession } from "./persistence";
import type { D1Database } from "./persistence";
import { initialWorld, worldSignals } from "./world-core";
import type { CharacterState, PlaceId } from "./world-core";
import { commitOctopusCycle } from "./octopus-cycle";
import { createOctopusHttpExecutor } from "./octopus-http";
import { loadDialogues, appendDialogue } from "./dialogue-persistence";
import { encounterMemories } from "./social-memory";
import { createOctopusDialogueExecutor } from "./octopus-dialogue";

export interface SherlockBindings {
  SHERLOCK_DB?: D1Database;
  SHERLOCK_API_TOKEN?: string;
  OCTOPUS?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
  SHERLOCK_PUBLIC_SESSION_ID?: string;
  SHERLOCK_PUBLIC_ORIGIN?: string;
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function errorMessage(error: unknown): string { return error instanceof Error ? error.message : "Unexpected error"; }
function validId(id: string): boolean { return /^[a-f0-9-]{36}$/i.test(id); }

const BLACKLACE_CAST: readonly CharacterState[] = [
  { id: "marie-jeanne", place: "port" },
  { id: "natasha", place: "rotas" },
  { id: "marty", place: "port" },
  { id: "slobodane", place: "rotas" },
  { id: "lolo", place: "institute" },
  { id: "nikolas", place: "sator" },
  { id: "ludmila", place: "ludmila" },
  { id: "max", place: "max" },
];

/** Dedicated Worker entrypoint; no public mutation without configured token. */
export default {
  async fetch(request: Request, env: SherlockBindings): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ service: "sherlock", status: env.SHERLOCK_DB && env.SHERLOCK_API_TOKEN && env.OCTOPUS ? "configured" : "unavailable" },
        env.SHERLOCK_DB && env.SHERLOCK_API_TOKEN && env.OCTOPUS ? 200 : 503);
    }
    // Public, shared ambience state; D1 is the sole source of truth.
    if (url.pathname === "/api/aloisia/ambience") {
      const allowedOrigin = env.SHERLOCK_PUBLIC_ORIGIN;
      const origin = request.headers.get("origin");
      const cors = allowedOrigin && origin === allowedOrigin
        ? { "access-control-allow-origin": allowedOrigin, "vary": "Origin" }
        : {};
      if (request.method === "OPTIONS") {
        return new Response(null, { status: origin === allowedOrigin ? 204 : 403,
          headers: { ...cors, "access-control-allow-methods": "GET, PUT, OPTIONS",
            "access-control-allow-headers": "authorization, content-type" } });
      }
      if (!env.SHERLOCK_DB) return new Response(JSON.stringify({ error: "Ambience unavailable" }), { status: 503, headers: { "content-type": "application/json", ...cors } });
      if (request.method === "GET") {
        try {
          const record = await env.SHERLOCK_DB.prepare("SELECT phase,night,unstable,source,updated_at FROM aloisia_ambience WHERE singleton=1").first();
          if (!record) return new Response(JSON.stringify({ error: "Ambience uninitialized" }), { status: 503, headers: { "content-type": "application/json", ...cors } });
          return new Response(JSON.stringify({ phase: record.phase, night: Boolean(record.night), unstable: Boolean(record.unstable), source: record.source, updatedAt: record.updated_at }), { headers: { "content-type": "application/json", "cache-control": "no-store", ...cors } });
        } catch { return new Response(JSON.stringify({ error: "Ambience unavailable" }), { status: 503, headers: { "content-type": "application/json", ...cors } }); }
      }
      if (request.method === "PUT") {
        if (!env.SHERLOCK_API_TOKEN || request.headers.get("authorization") !== `Bearer ${env.SHERLOCK_API_TOKEN}`) return json({ error: "Unauthorized" }, 401);
        try {
          const input = await request.json() as { phase?: unknown; source?: unknown };
          const presets: Record<string, { night: number; unstable: number }> = {
            "phase-signal": { night: 0, unstable: 0 },
            "phase-feuch": { night: 0, unstable: 1 },
            "phase-reboot": { night: 1, unstable: 1 },
            "phase-sator": { night: 1, unstable: 0 },
          };
          if (typeof input.phase !== "string" || !Object.prototype.hasOwnProperty.call(presets, input.phase) ||
              typeof input.source !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(input.source)) return json({ error: "Invalid ambience command" }, 400);
          const preset = presets[input.phase];
          await env.SHERLOCK_DB.prepare("UPDATE aloisia_ambience SET phase=?,night=?,unstable=?,source=?,updated_at=CURRENT_TIMESTAMP WHERE singleton=1")
            .bind(input.phase,preset.night,preset.unstable,input.source).run();
          return new Response(JSON.stringify({ phase: input.phase, ...{ night: Boolean(preset.night), unstable: Boolean(preset.unstable) } }), { headers: { "content-type": "application/json", ...cors } });
        } catch { return json({ error: "Ambience update failed" }, 503); }
      }
      return json({ error: "Method not allowed" }, 405);
    }
    // Opt-in, read-only projection: never expose session snapshots, IDs, operation IDs or secrets.
    if (request.method === "GET" && url.pathname === "/api/sherlock/public-feed") {
      const origin = env.SHERLOCK_PUBLIC_ORIGIN;
      if (!origin || !env.SHERLOCK_DB || !env.SHERLOCK_PUBLIC_SESSION_ID || !validId(env.SHERLOCK_PUBLIC_SESSION_ID)) return json({ error: "Public feed unavailable" }, 503);
      try {
        const session = await loadSession(env.SHERLOCK_DB, env.SHERLOCK_PUBLIC_SESSION_ID);
        if (!session) return json({ error: "Public feed unavailable" }, 503);
        const verified = new Map(session.decisions
          .filter(decision => decision.source === "octopus" && decision.action.actor === decision.actorId)
          .map(decision => [`${decision.cycle}:${decision.actorId}`, decision.action]));
        type PublicEntry =
          | { id: string; cycle: number; actor: string; kind: "waited"; place: PlaceId; activity?: string; intention?: string }
          | { id: string; cycle: number; actor: string; kind: "moved"; from: PlaceId; to: PlaceId; activity?: string; intention?: string }
          | { id: string; cycle: number; actors: readonly [string, string]; kind: "met"; place: PlaceId };
        const entries: PublicEntry[] = [];
        for (const event of session.events) {
          if (event.type === "character.waited") {
            const action = verified.get(`${event.cycle}:${event.actor}`);
            if (action?.kind === "wait") entries.push({
              id: event.id, cycle: event.cycle, actor: event.actor, kind: "waited", place: event.at,
              activity: session.state.characters[event.actor]?.activity,
              intention: session.state.characters[event.actor]?.intention,
            });
            continue;
          }
          if (event.type === "characters.met") {
            entries.push({ id: event.id, cycle: event.cycle, actors: event.actors, kind: "met", place: event.at });
            continue;
          }
          if (event.type === "character.moved") {
            const action = verified.get(`${event.cycle}:${event.actor}`);
            if (action?.kind === "move" && action.to === event.to) entries.push({
              id: event.id, cycle: event.cycle, actor: event.actor, kind: "moved", from: event.from, to: event.to,
              activity: session.state.characters[event.actor]?.activity,
              intention: session.state.characters[event.actor]?.intention,
            });
            continue;
          }
        }
        // Presence is state, not only activity: publish a verified snapshot for every
        // resident so newly-added or currently-idle characters are visible immediately.
        const latestByActor = new Map<string, PublicEntry>();
        for (const entry of entries) {
          if (entry.kind === "met") {
            for (const actor of entry.actors) latestByActor.set(actor, entry);
          } else {
            latestByActor.set(entry.actor, entry);
          }
        }
        for (const character of Object.values(session.state.characters)) {
          if (!latestByActor.has(character.id)) entries.push({
            id: `presence:${session.state.cycle}:${character.id}`,
            cycle: session.state.cycle,
            actor: character.id,
            kind: "waited",
            place: character.place,
            activity: character.activity ?? "idle",
            intention: character.intention ?? `Présent à ${character.place}`,
          });
        }
        const publicEntries = entries.slice(-20);
        const signals = worldSignals(session.state).map(signal => signal.observable
          ? signal
          : { place: signal.place, observable: false, intensity: signal.intensity, trace: signal.trace });
        // Public projection of persisted, Octopus-verified dialogue only. Never expose session or operation IDs.
        const stored = await loadDialogues(env.SHERLOCK_DB, env.SHERLOCK_PUBLIC_SESSION_ID);
        const encounters = new Map(encounterMemories(session.events).map(e => [e.id, e]));
        const dialogues = stored.flatMap(item => {
          const encounter = encounters.get(item.encounterId);
          if (!encounter || item.source !== "octopus" || item.dialogue.encounterId !== encounter.id ||
              item.dialogue.participants.some((p, i) => p !== encounter.participants[i])) return [];
          return item.dialogue.turns.filter(turn => encounter.participants.includes(turn.speaker) &&
            typeof turn.text === "string" && turn.text.length > 0 && turn.text.length <= 600)
            .map((turn, i) => ({ id: item.encounterId + ":" + i, cycle: item.cycle,
              place: encounter.place, speaker: turn.speaker, text: turn.text }));
        }).slice(-24);
        return new Response(JSON.stringify({ entries: publicEntries, signals, dialogues }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": origin, "vary": "Origin" } });
      } catch { return json({ error: "Public feed unavailable" }, 503); }
    }
    if (!url.pathname.startsWith("/api/sherlock/")) return json({ error: "Not found" }, 404);
    if (!env.SHERLOCK_API_TOKEN || request.headers.get("authorization") !== `Bearer ${env.SHERLOCK_API_TOKEN}`)
      return json({ error: "Unauthorized" }, 401);
    if (!env.SHERLOCK_DB) return json({ error: "D1 binding unavailable" }, 503);
    const db = env.SHERLOCK_DB;
    if (request.method === "POST" && url.pathname === "/api/sherlock/sessions") {
      try {
        const sessionId = crypto.randomUUID();
        await createSession(db, sessionId, initialWorld(BLACKLACE_CAST));
        const session = await loadSession(db, sessionId);
        if (!session) throw new Error("Session verification failed");
        return json({ sessionId, ...session }, 201);
      } catch (error) { return json({ error: errorMessage(error) }, 503); }
    }
    const match = url.pathname.match(/^\/api\/sherlock\/sessions\/([^/]+)(?:\/(cycles))?$/);
    if (!match || !validId(match[1])) return json({ error: "Not found" }, 404);
    const sessionId = match[1];
    if (request.method === "GET" && !match[2] && url.searchParams.get("view") === "dialogues") {
      try {
        const session = await loadSession(db, sessionId);
        if (!session) return json({ error: "Session not found" }, 404);
        const dialogues = await loadDialogues(db, sessionId);
        return json({ sessionId, dialogues });
      } catch (error) { return json({ error: errorMessage(error) }, 503); }
    }
    if (request.method === "GET" && !match[2]) {
      try {
        const session = await loadSession(db, sessionId);
        return session ? json({ sessionId, ...session }) : json({ error: "Session not found" }, 404);
      } catch (error) { return json({ error: errorMessage(error) }, 503); }
    }
    if (request.method === "POST" && match[2] === "cycles") {
      if (!env.OCTOPUS) return json({ error: "Octopus service binding unavailable" }, 503);
      try {
        const executor = createOctopusHttpExecutor({
          endpoint: "https://octopus.internal/mission",
          fetcher: env.OCTOPUS.fetch.bind(env.OCTOPUS) as typeof fetch,
        });
        await ensureSessionCharacters(db, sessionId, BLACKLACE_CAST);
        const session = await loadSession(db, sessionId);
        if (!session) throw new Error("Session not found");
        const actors = Object.keys(session.state.characters).sort();
        const actorId = actors[session.state.cycle % actors.length];
        const result = await commitOctopusCycle(db, sessionId, actorId, executor);
        // A completed world cycle is never rolled back because dialogue generation failed.
        // Generate at most one canonical dialogue per verified encounter; D1 primary key
        // also prevents duplicate commits under concurrent requests.
        let dialogueStatus: "none" | "saved" | "unavailable" = "none";
        try {
          const updated = await loadSession(db, sessionId);
          if (updated) {
            const existing = new Set((await loadDialogues(db, sessionId)).map(d => d.encounterId));
            const pending = encounterMemories(updated.events).filter(e => !existing.has(e.id));
            if (pending.length) {
              const generate = createOctopusDialogueExecutor({
                endpoint: "https://octopus.internal/mission",
                fetcher: env.OCTOPUS.fetch.bind(env.OCTOPUS) as typeof fetch,
              });
              const encounter = pending[0];
              const generated = await generate(encounter, encounterMemories(updated.events));
              await appendDialogue(db, sessionId, updated.events, generated.proposal, generated);
              dialogueStatus = "saved";
            }
          }
        } catch { dialogueStatus = "unavailable"; }
        return json({ ...result, dialogueStatus });
      } catch (error) {
        const message = errorMessage(error);
        const status = message === "Session not found" ? 404 : /Stale cycle|UNIQUE constraint/i.test(message) ? 409 : 502;
        return json({ error: message, committed: "unknown", instruction: "Read the session before retrying." }, status);
      }
    }
    return json({ error: "Method not allowed" }, 405);
  },
};
