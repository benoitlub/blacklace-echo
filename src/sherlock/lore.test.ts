import { describe, expect, it } from "vitest";
import { composeCharacterKnowledge, type LoreEntry } from "./lore";

describe("character lore injection", () => {
  it("injects common lore and only the character's own bio", () => {
    const natasha = composeCharacterKnowledge("natasha");
    expect(natasha.sourceIds).toContain("world.rotas");
    expect(natasha.sourceIds).toContain("natasha.role");
    expect(natasha.sourceIds).not.toContain("marty.role");
  });
  it("excludes draft secrets even from their subject", () => {
    const marty = composeCharacterKnowledge("marty");
    expect(marty.sourceIds).not.toContain("marty.cycles");
    expect(marty.warnings).toContain("Excluded non-canon: marty.cycles");
  });
  it("does not leak another character's secret", () => {
    const secret: LoreEntry = { id: "test.private", text: "private", scope: "secret", status: "canon",
      sourceUrl: "https://example.org/source", sourceTitle: "Test", subjectIds: ["marty"], visibleTo: ["marty"] };
    expect(composeCharacterKnowledge("natasha", [secret]).sourceIds).not.toContain(secret.id);
    expect(composeCharacterKnowledge("marty", [secret]).sourceIds).toContain(secret.id);
  });
  it("rejects unknown characters", () => {
    expect(() => composeCharacterKnowledge("unknown")).toThrow("Unknown character bio");
  });
});
