import { describe, expect, it } from "vitest";
import { encounterMemories, memoriesForActor } from "./social-memory";
import { initialWorld, runCycle } from "./world-core";

describe("Sherlock encounter memory projection", () => {
  it("records real encounters without inventing dialogue", () => {
    const initial = initialWorld([{ id: "marty", place: "port" }, { id: "natasha", place: "rotas" }]);
    const result = runCycle(initial, [{ actor: "marty", kind: "move", to: "rotas" }]);
    const memories = encounterMemories(result.events);
    expect(memories).toHaveLength(1);
    expect(memories[0]).toMatchObject({ cycle: 1, place: "rotas", participants: ["marty", "natasha"] });
    expect(memoriesForActor(memories, "marty")).toHaveLength(1);
    expect(memoriesForActor(memories, "lolo")).toHaveLength(0);
    expect(encounterMemories([...result.events, ...result.events])).toEqual(memories);
  });

  it("does not mistake staying together for a new meeting", () => {
    const initial = initialWorld([{ id: "marty", place: "port" }, { id: "natasha", place: "rotas" }]);
    const first = runCycle(initial, [{ actor: "marty", kind: "move", to: "rotas" }]);
    const second = runCycle(first.state, [{ actor: "marty", kind: "wait" }]);
    expect(encounterMemories(second.events)).toEqual([]);
  });
});
