import { describe, expect, it } from "vitest";
import worker from "./worker";
import type { SherlockBindings } from "./worker";

const origin = "https://benoitlub.github.io";
function mockDb() {
  const row = { phase: "phase-signal", night: 0, unstable: 0, source: "initial", updated_at: "2026-11-10" };
  return {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (sql.startsWith("UPDATE")) {
                row.phase = String(args[0]);
                row.night = Number(args[1]);
                row.unstable = Number(args[2]);
                row.source = String(args[3]);
              }
            },
            async first() { return row; },
            async all() { return { results: [] }; },
          };
        },
        async first() { return row; },
        async all() { return { results: [] }; },
        async run() { return {}; },
      };
    },
    async batch() { return []; },
  };
}
const url = "https://worker.example/api/aloisia/ambience";
describe("Aloisia shared D1 ambience API", () => {
  it("reads persisted ambience cross-origin from the published site", async () => {
    const response = await worker.fetch(new Request(url, { headers: { origin } }), { SHERLOCK_DB: mockDb() } as unknown as SherlockBindings);
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(origin);
    expect((await response.json()).phase).toBe("phase-signal");
  });
  it("rejects unauthenticated mutations", async () => {
    const response = await worker.fetch(new Request(url, { method: "PUT", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ phase: "phase-sator", source: "aloisia" }) }), { SHERLOCK_DB: mockDb(), SHERLOCK_API_TOKEN: "secret" } as unknown as SherlockBindings);
    expect(response.status).toBe(401);
  });
  it("persists authenticated phases and rejects invalid ones", async () => {
    const db = mockDb();
    const env = { SHERLOCK_DB: db, SHERLOCK_API_TOKEN: "secret" };
    const send = (phase: string) => worker.fetch(new Request(url, { method: "PUT", headers: { authorization: "Bearer secret", "content-type": "application/json", origin }, body: JSON.stringify({ phase, source: "aloisia" }) }), env as unknown as SherlockBindings);
    expect((await send("phase-sator")).status).toBe(200);
    const response = await worker.fetch(new Request(url), env as unknown as SherlockBindings);
    expect(await response.json()).toMatchObject({ phase: "phase-sator", night: true, unstable: false });
    expect((await send("bogus")).status).toBe(400);
  });
});
