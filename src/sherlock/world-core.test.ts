import { describe, expect, it } from "vitest";
import {applyEvent, initialWorld, replay, runControl, runCycle, worldSignals } from "./world-core";

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

  it("keeps the hidden layer canonical but distinct from observability", () => {
    const world = start();
    expect(world.hidden.aloisia).toMatchObject({ kind: "incarnate", observable: true, place: "observatoire" });
    expect(world.hidden.feuch).toMatchObject({ kind: "presence", observable: false, state: "unknown" });
    expect(world.hidden["fee-belette"]).toMatchObject({ kind: "presence", observable: false, place: "reboot" });
    expect(world.hidden["sator-network"]).toMatchObject({ kind: "artifact", observable: true, place: "sator" });
    expect(world.hidden.moscovium).toMatchObject({ kind: "resource", observable: false, depth: "deep", state: "present" });
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

  it("emits an encounter only when residents newly converge", () => {
    const initial = initialWorld([{ id: "a", place: "port" }, { id: "b", place: "rotas" }]);
    const first = runCycle(initial, [{ actor: "a", kind: "move", to: "rotas" }]);
    expect(first.events.filter(event => event.type === "characters.met")).toHaveLength(1);
    const second = runCycle(first.state, [{ actor: "a", kind: "wait" }]);
    expect(second.events.filter(event => event.type === "characters.met")).toHaveLength(0);
  });

  it("rejects duplicate IDs and invalid cycle counts", () => {
    expect(() => initialWorld([{ id: "same", place: "port" }, { id: "same", place: "rotas" }])).toThrow();
    expect(() => runControl(start(), -1)).toThrow();
  });
});


describe("world signals", () => {
  it("projects cult-place influence without revealing hidden causes", () => {
    const state = initialWorld([{ id: "visitor", place: "fournaise" }]);
    const signals = worldSignals(state);
    const feuch = signals.find(signal => signal.source === "feuch");
    expect(feuch?.observable).toBe(false);
    expect(feuch?.intensity).toBeGreaterThan(0);
    expect(feuch?.trace).toContain("anomalie locale");
    expect(feuch?.trace).not.toContain("feuch");
  });
});
