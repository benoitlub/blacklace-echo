import { describe, expect, it, vi } from "vitest";
import { createOctopusHttpExecutor } from "./octopus-http";
import type { DecisionRequest } from "./octopus-cycle";
import { initialWorld } from "./world-core";

const request: DecisionRequest = {
  sessionId: "session-1",
  cycle: 1,
  state: initialWorld([{ id: "marie-jeanne", place: "port" }]),
  allowedActions: [{ actor: "marie-jeanne", kind: "wait" }],
};

describe("Sherlock Octopus HTTP boundary", () => {
  it("accepts a completed matching mission with JSON text", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const operationId = JSON.parse(String(init?.body)).operationId;
      return new Response(JSON.stringify({
        status: "completed", operationId,
        output: { text: '```json\n{"action":{"actor":"marie-jeanne","kind":"wait"}}\n```' },
      }), { status: 200 });
    });
    const decide = createOctopusHttpExecutor({ endpoint: "https://octopus.example/mission", fetcher: fetcher as typeof fetch });
    const result = await decide(request);
    expect(result.action).toEqual({ actor: "marie-jeanne", kind: "wait" });
    expect(result.source).toBe("octopus");
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("rejects incomplete missions instead of inventing an action", async () => {
    const decide = createOctopusHttpExecutor({
      endpoint: "https://octopus.example/mission",
      fetcher: (async () => new Response(JSON.stringify({ status: "waiting-executor", output: {} }), { status: 202 })) as typeof fetch,
    });
    await expect(decide(request)).rejects.toThrow("not completed");
  });

  it("rejects unknown destinations and non-JSON output", async () => {
    for (const text of ['{"action":{"actor":"marie-jeanne","kind":"move","to":"secret-yacht"}}', "hello"]) {
      const decide = createOctopusHttpExecutor({
        endpoint: "https://octopus.example/mission",
        fetcher: (async (_url: string | URL | Request, init?: RequestInit) => new Response(JSON.stringify({
          status: "completed", operationId: JSON.parse(String(init?.body)).operationId, output: { text },
        }), { status: 200 })) as typeof fetch,
      });
      await expect(decide(request)).rejects.toThrow();
    }
  });
});
