import { describe, expect, it } from "vitest";
import { applyEvent, initialWorld, replay, runControl, runCycle } from "./world-core";

describe("SHERLOCK S-001 world core", () => {
  const start = () => initialWorld([{ id: "observer-a", place: "port" }, { id: "observer-b", place: "rotas" }]);

  it("replays 100 control cycles exactly", () => {
    const first = runControl(start(), 100);
    const second = runControl(start(), 100);
    expect(first).toEqual(second);
    expect(first.state.cycle).toBe(100);
    expect(replay(first.log.initial, first.log.events)).toEqual(first.state);
    expect(first.log.events.filter((event) => event.type === "cycle.started")).toHaveLength(100);
    expect(new Set(first.log.events.map((event) => event.id)).size).toBe(first.log.events.length);
  });

  it("rejects illegal movement and unknown actors", () => {
    expect(() => runCycle(start(), [{ actor: "observer-a", kind: "move", to: "fournaise" }])).toThrow("Invalid movement");
    expect(() => runCycle(start(), [{ actor: "missing", kind: "wait" }])).toThrow("Unknown character");
  });

  it("rejects multiple actions per actor and malformed events", () => {
    expect(() => runCycle(start(), [{ actor: "observer-a", kind: "wait" }, { actor: "observer-a", kind: "wait" }])).toThrow("One action");
    expect(() => applyEvent(start(), { id: "bad", cycle: 2, type: "cycle.started" })).toThrow("Invalid event cycle");
  });

  it("does not mutate the starting snapshot", () => {
    const initial = start();
    const before = JSON.stringify(initial);
    runControl(initial, 10);
    expect(JSON.stringify(initial)).toBe(before);
  });

  it("rejects duplicate IDs and invalid cycle counts", () => {
    expect(() => initialWorld([{ id: "same", place: "port" }, { id: "same", place: "rotas" }])).toThrow();
    expect(() => runControl(start(), -1)).toThrow();
  });
});
