import { createSession, loadSession } from "./persistence";
import type { D1Database } from "./persistence";
import { initialWorld } from "./world-core";
import { commitOctopusCycle } from "./octopus-cycle";
import { createOctopusHttpExecutor } from "./octopus-http";

export interface SherlockBindings {
  SHERLOCK_DB?: D1Database;
  SHERLOCK_API_TOKEN?: string;
  OCTOPUS_MISSION_URL?: string;
  OCTOPUS_AUTHORIZATION?: string;
  SHERLOCK_PUBLIC_SESSION_ID?: string;
  SHERLOCK_PUBLIC_ORIGIN?: string;
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function errorMessage(error: unknown): string { return error instanceof Error ? error.message : "Unexpected error"; }
function validId(id: string): boolean { return /^[a-f0-9-]{36}$/i.test(id); }

/** Dedicated Worker entrypoint; no public mutation without configured token. */
export default {
  async fetch(request: Request, env: SherlockBindings): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ service: "sherlock", status: env.SHERLOCK_DB && env.SHERLOCK_API_TOKEN && env.OCTOPUS_MISSION_URL ? "configured" : "unavailable" },
        env.SHERLOCK_DB && env.SHERLOCK_API_TOKEN && env.OCTOPUS_MISSION_URL ? 200 : 503);
    }
    // Opt-in, read-only projection: never expose session snapshots, IDs, operation IDs or secrets.
    if (request.method === "GET" && url.pathname === "/api/sherlock/public-feed") {
      const origin = env.SHERLOCK_PUBLIC_ORIGIN;
      if (!origin || !env.SHERLOCK_DB || !env.SHERLOCK_PUBLIC_SESSION_ID || !validId(env.SHERLOCK_PUBLIC_SESSION_ID)) return json({ error: "Public feed unavailable" }, 503);
      try {
        const session = await loadSession(env.SHERLOCK_DB, env.SHERLOCK_PUBLIC_SESSION_ID);
        if (!session) return json({ error: "Public feed unavailable" }, 503);
        const entries = session.events.filter(event => event.type === "character.waited").slice(-20).map(event => ({
          id: event.id, cycle: event.cycle, actor: event.actor, kind: "waited" as const, place: event.at,
        }));
        return new Response(JSON.stringify({ entries }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": origin, "vary": "Origin" } });
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
        await createSession(db, sessionId, initialWorld([{ id: "marie-jeanne", place: "port" }]));
        const session = await loadSession(db, sessionId);
        if (!session) throw new Error("Session verification failed");
        return json({ sessionId, ...session }, 201);
      } catch (error) { return json({ error: errorMessage(error) }, 503); }
    }
    const match = url.pathname.match(/^\/api\/sherlock\/sessions\/([^/]+)(?:\/(cycles))?$/);
    if (!match || !validId(match[1])) return json({ error: "Not found" }, 404);
    const sessionId = match[1];
    if (request.method === "GET" && !match[2]) {
      try {
        const session = await loadSession(db, sessionId);
        return session ? json({ sessionId, ...session }) : json({ error: "Session not found" }, 404);
      } catch (error) { return json({ error: errorMessage(error) }, 503); }
    }
    if (request.method === "POST" && match[2] === "cycles") {
      if (!env.OCTOPUS_MISSION_URL) return json({ error: "Octopus endpoint unavailable" }, 503);
      try {
        const executor = createOctopusHttpExecutor({ endpoint: env.OCTOPUS_MISSION_URL, authorization: env.OCTOPUS_AUTHORIZATION });
        const result = await commitOctopusCycle(db, sessionId, "marie-jeanne", executor);
        return json(result);
      } catch (error) {
        const message = errorMessage(error);
        const status = message === "Session not found" ? 404 : /Stale cycle|UNIQUE constraint/i.test(message) ? 409 : 502;
        return json({ error: message, committed: "unknown", instruction: "Read the session before retrying." }, status);
      }
    }
    return json({ error: "Method not allowed" }, 405);
  },
};
