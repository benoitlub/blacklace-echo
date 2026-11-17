// Canon cocktails of the Max Liberty. "Moscow Vium" / "Marée Quantique" are NOT canon.
export type DrinkId = "violette" | "moscomiul" | "kombuchee" | "strawberry" | "reboot";
export type GlassKind = "coupe" | "mug" | "flute" | "highball" | "prism";
export type Drink = {
  id: DrinkId; name: string; note: string; story: string; vision: string;
  glass: GlassKind; liquid: [string, string]; palette: [string, string, string]; clue: string;
};
export const DRINKS: Drink[] = [
  { id: "violette", name: "La Violette de Feuch", note: "Gin, fraise, citron, Curaçao bleu, ginger beer", story: "Le cocktail de la Fée Belette.", vision: "Fleurs et papillons UV · une Belette fugitive", glass: "coupe", liquid: ["#c08bff", "#6a2bd9"], palette: ["#c86bff", "#3ff8ff", "#ff5bd8"], clue: "Une lueur de la Belette traverse les fleurs." },
  { id: "moscomiul", name: "Le Moscomiul", note: "Vermouth blanc, fruit du dragon, citron vert, kombucha", story: "L'élixir cosmique, servi dans sa tasse de cuivre.", vision: "Méduses, étoiles et transmissions de Marty", glass: "mug", liquid: ["#ff7ad9", "#c4198f"], palette: ["#4fe7ff", "#ff4fd0", "#b6a8ff"], clue: "Une transmission brouillée de Marty : « Mes petites boules à facettes ! »" },
  { id: "kombuchee", name: "La Fée Belette Kombuchée", note: "Gin fraise, fraise, citron, kombucha citron", story: "Une création pétillante inspirée de la Belette.", vision: "Bulles de souvenirs · le temps coule à l'envers", glass: "flute", liquid: ["#ffd7a8", "#f08aa0"], palette: ["#ffd27a", "#ff9ec4", "#9ff7ff"], clue: "Des souvenirs remontent… non, ils descendent." },
  { id: "strawberry", name: "Le Strawberry Feuch", note: "Gin fraise, jus de fraise, Monster Fraise, kombucha citron", story: "Recette historiquement dégustée, proportions non documentées.", vision: "Néons et pulsations électroniques du décor", glass: "highball", liquid: ["#ff5a7a", "#c8102e"], palette: ["#ff2d6f", "#ffe14f", "#38f0ff"], clue: "Les néons composent un rythme qui n'existait pas." },
  { id: "reboot", name: "Le Reboot", note: "Recette fictionnelle du roman, sans dosage réel", story: "Une préparation mystérieuse du Max Liberty.", vision: "Dédoublement, horloge inversée, carré SATOR", glass: "prism", liquid: ["#9dfff0", "#1f8fd6"], palette: ["#3ff8e8", "#ff3b5c", "#f5f5ff"], clue: "SATOR · AREPO · TENET · OPERA · ROTAS" },
];
