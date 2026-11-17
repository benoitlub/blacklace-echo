import { describe, expect, it } from "vitest";
import { envelopes, phaseAt, TRIP_SECONDS } from "./timeline";
import { DRINKS } from "./drinks";
describe("Max Liberty timeline", () => {
  it("lasts 60 seconds", () => { expect(TRIP_SECONDS).toBe(60); expect(phaseAt(60)).toBe("fin"); });
  it("follows 0-10 / 10-25 / 25-45 / 45-60", () => {
    expect(phaseAt(5)).toBe("emergence"); expect(phaseAt(12)).toBe("incrustations");
    expect(phaseAt(30)).toBe("hallucinations"); expect(phaseAt(50)).toBe("dissipation");
  });
  it("deforms geometry only during hallucinations", () => {
    expect(envelopes(20).warp).toBe(0); expect(envelopes(35).warp).toBe(1); expect(envelopes(50).warp).toBe(0);
  });
  it("is fully dissipated at 60s", () => { expect(envelopes(60).fade).toBe(0); });
});
describe("Max Liberty cocktails", () => {
  it("serves the five canon cocktails only", () => {
    expect(DRINKS.map(d => d.name)).toEqual(["La Violette de Feuch", "Le Moscomiul", "La Fée Belette Kombuchée", "Le Strawberry Feuch", "Le Reboot"]);
    expect(DRINKS.some(d => /Moscow Vium|Marée Quantique/.test(d.name))).toBe(false);
  });
});
