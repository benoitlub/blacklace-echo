import { describe, expect, it } from "vitest";
import { describeWorldEntry, parsePublicFeed } from "./sherlock-feed";

describe("Sherlock public chat projection", () => {
  it("accepts a validated wait event and describes it as an event, not dialogue", () => {
    const entries = parsePublicFeed({ entries: [{ id: "1:1", cycle: 1, actor: "marie-jeanne", kind: "waited", place: "port" }] });
    expect(entries).toHaveLength(1);
    expect(describeWorldEntry(entries[0])).toEqual({
      name: "MARIE JEANNE", text: "Cycle 1 : MARIE JEANNE reste au port de Porsa Rotas.",
    });
  });
  it("rejects malformed envelopes and filters unsupported or malformed events", () => {
    expect(() => parsePublicFeed({ entries: null })).toThrow("Invalid Sherlock feed");
    expect(parsePublicFeed({ entries: [
      { id: "1:0", cycle: 1, actor: "marie-jeanne", kind: "started", place: "port" },
      { id: "1:1", cycle: 1, actor: "marie-jeanne", kind: "waited", place: "port" },
      { id: "1:2", cycle: -1, actor: "marie-jeanne", kind: "waited", place: "port" },
      { id: "2:1", cycle: 1, actor: "marie-jeanne", kind: "waited", place: "port" },
      { id: "1:0", cycle: 1, actor: "marie-jeanne", kind: "waited", place: "port" },
    ] })).toHaveLength(1);
  });
});
