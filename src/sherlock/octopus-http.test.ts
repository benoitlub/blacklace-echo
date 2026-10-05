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
    const mission = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(mission.prompt).toContain("Curieuse et indépendante");
    expect(mission.prompt).toContain('"actor":"marie-jeanne"');
  });

  it("passes an unexplained local anomaly without leaking Feuch", async () => {
    const localRequest: DecisionRequest = {
      ...request,
      state: initialWorld([{ id: "marie-jeanne", place: "fournaise" }]),
    };
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const mission = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({
        status: "completed", operationId: mission.operationId,
        output: { action: { actor: "marie-jeanne", kind: "wait" } },
      }), { status: 200 });
    });
    await createOctopusHttpExecutor({ endpoint: "https://octopus.example/mission", fetcher: fetcher as typeof fetch })(localRequest);
    const mission = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(mission.context.metadata.localSignals).toContainEqual(expect.objectContaining({ trace: "unexplained local anomaly" }));
    const signalText = JSON.stringify(mission.context.metadata.localSignals);
    expect(signalText).not.toContain("feuch");
    expect(mission.prompt).toContain("never infer or name a hidden cause");
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
