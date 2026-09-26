/** Character knowledge is explicitly scoped; a source reference is not permission to know everything. */
export type LoreScope = "world" | "character" | "relationship" | "location" | "secret";
export type LoreStatus = "canon" | "draft" | "disputed";
export type LoreEntry = {
  id: string; text: string; scope: LoreScope; status: LoreStatus;
  sourceUrl: string; sourceTitle: string; subjectIds: readonly string[];
  visibleTo: readonly string[]; // empty for public lore; explicit IDs for restricted lore
};
export type CharacterBio = {
  id: string; name: string; sourceUrl: string; facts: readonly LoreEntry[];
};
export type KnowledgeContext = { characterId: string; facts: LoreEntry[]; sourceIds: string[]; warnings: string[] };

const notion = (id: string) => `https://app.notion.com/p/${id}`;
const source = {
  grimoire: notion("362391197253812db60bf777a6467d51"),
  natasha: notion("2d1391197253809eb0ccff665d0ff528"),
  marty: notion("35b391197253804d9c4df7fee6497b03"),
  nikolas: notion("2d139119725380efa346f979d200e17a"),
  ludmila: notion("2d139119725380fbb4dee5bb97703985"),
};
const fact = (id: string, text: string, subjectIds: string[], sourceUrl: string, sourceTitle: string,
  scope: LoreScope = "character", status: LoreStatus = "canon", visibleTo: string[] = []): LoreEntry =>
  ({ id, text, subjectIds, sourceUrl, sourceTitle, scope, status, visibleTo });

/** Curated seed, NOT a full import of Notion. Drafts stay explicitly marked. */
export const CHARACTER_BIOS: Readonly<Record<string, CharacterBio>> = {
  natasha: { id: "natasha", name: "Natasha", sourceUrl: source.natasha, facts: [
    fact("natasha.role", "Influenceuse, streameuse et passerelle entre visiteurs et zones de l'île.", ["natasha"], source.natasha, "Natasha"),
    fact("natasha.signals", "Diffuse depuis Rotas des streams nocturnes, podcasts et alertes de glitches.", ["natasha"], source.natasha, "Natasha"),
    fact("natasha.anomalies", "S'intéresse aux anomalies temporelles, médias perdus et souvenirs réapparus.", ["natasha"], source.natasha, "Natasha"),
  ] },
  marty: { id: "marty", name: "Marty", sourceUrl: source.marty, facts: [
    fact("marty.role", "Livreur, observateur des anomalies et animateur de Moscomiul Break.", ["marty"], source.marty, "Marty"),
    fact("marty.tone", "Garder son humour, son débit et ses théories excentriques, même face à l'inquiétant.", ["marty"], source.marty, "Marty"),
    fact("marty.cycles", "Il pourrait conserver des fragments de mémoire après les reboots.", ["marty"], source.marty, "Marty", "secret", "draft", ["marty"]),
  ] },
  nikolas: { id: "nikolas", name: "Nikolas", sourceUrl: source.nikolas, facts: [
    fact("nikolas.family", "Frère de Natasha.", ["nikolas", "natasha"], source.nikolas, "Nikolas", "relationship"),
    fact("nikolas.music", "DJ associé au son et à la Fournaise.", ["nikolas"], source.grimoire, "Grimoire"),
  ] },
  ludmila: { id: "ludmila", name: "Ludmila", sourceUrl: source.ludmila, facts: [
    fact("ludmila.club", "Gardienne du Club Rouge, DJ et curatrice d'expériences perceptives.", ["ludmila"], source.ludmila, "Ludmila"),
  ] },
};
export const WORLD_LORE: readonly LoreEntry[] = [
  fact("world.rotas", "Rotas est le village de l'île, avec marché, salon de thé et boutiques.", [], source.grimoire, "Grimoire", "world"),
  fact("world.sator", "La forêt SATOR abrite des dolmens et des accès instables.", [], source.grimoire, "Grimoire", "world"),
];

/** Deliberately fail closed: no implicit access to another character's private memory. */
export function composeCharacterKnowledge(characterId: string, additional: readonly LoreEntry[] = []): KnowledgeContext {
  const bio = CHARACTER_BIOS[characterId];
  if (!bio) throw new Error("Unknown character bio");
  const warnings: string[] = [];
  const facts: LoreEntry[] = [];
  const seen = new Set<string>();
  for (const entry of [...WORLD_LORE, ...bio.facts, ...additional]) {
    if (seen.has(entry.id)) continue;
    if (entry.status !== "canon") { warnings.push(`Excluded non-canon: ${entry.id}`); continue; }
    if (entry.visibleTo.length && !entry.visibleTo.includes(characterId)) continue;
    if (entry.scope === "character" && !entry.subjectIds.includes(characterId)) continue;
    if (entry.scope === "relationship" && !entry.subjectIds.includes(characterId)) continue;
    if (entry.scope === "secret" && !entry.visibleTo.includes(characterId)) continue;
    seen.add(entry.id);
    facts.push(entry);
  }
  return { characterId, facts, sourceIds: facts.map(f => f.id), warnings };
}
