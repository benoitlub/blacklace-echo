import { describe, expect, it } from "vitest";
import { replyAsNatasha } from "./natasha-conversation";

describe("Natasha's local conversation", () => {
  it.each([
    ["Tu connais le salon de THÉ ?", "devant le salon de thé"],
    ["Tu fais des podcasts ?", "streams de nuit"],
    ["Tu as vu des anomalies temporelles ?", "souvenirs qui refont surface"],
  ])("recognizes the topic in %s", (question, phrase) => {
    expect(replyAsNatasha(question)).toContain(phrase);
  });

  it("says when the demo cannot answer", () => {
    expect(replyAsNatasha("Combien coûte un billet ?")).toContain("Je n’ai pas de réponse");
  });
});
