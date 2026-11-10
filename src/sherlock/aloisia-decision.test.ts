import { describe, expect, it } from "vitest";
import { decideAloisiaAmbience } from "./aloisia-decision";
import { initialWorld } from "./world-core";

describe("Aloisia's persisted-world ambience policy", () => {
  it("uses world state, not browser controls", () => {
    const state = initialWorld([{ id: "marty", place: "port" }]);
    const decision = decideAloisiaAmbience(state);
    expect(["phase-signal","phase-feuch","phase-reboot","phase-sator"]).toContain(decision.phase);
    expect(decision.cycle).toBe(state.cycle);
    expect(decision.source).toBe("aloisia-world-signals");
  });
  it("is deterministic for identical world state", () => {
    const state = initialWorld([{ id: "marty", place: "port" }]);
    expect(decideAloisiaAmbience(state)).toEqual(decideAloisiaAmbience(state));
  });
});
