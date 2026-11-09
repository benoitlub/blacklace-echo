import type { LocationIdentityId } from "./location-identities";

/** Narrative entry point: arrival at Porsa Rotas, before free exploration. */
export const BLACKLACE_ARRIVAL = {
  startingLocationId: "port",
  greeter: { id: "marie-jeanne", displayName: "Marie Jeanne" },
  phase: "arrival",
  description: "Le visiteur commence au port de Porsa Rotas avec Marie Jeanne.",
} as const satisfies {
  startingLocationId: LocationIdentityId;
  greeter: { id: string; displayName: string };
  phase: string;
  description: string;
};

/** Authored copy only; presentation and transitions belong to the arrival UI. */
export const MARIE_JEANNE_WELCOME = [
  "Ah ! Enfin quelqu’un ! Bienvenue sur Blacklace Island. Ne vous inquiétez pas pour le volcan… Il fait ça depuis des années.",
  "Moi, c’est Marie Jeanne. Si vous cherchez quelque chose de normal, vous vous êtes probablement trompé de bateau.",
  "Vous pouvez commencer par Rotas, prendre un verre chez Max Liberty ou monter jusqu’au Feuch Institute. Et si vous croisez quelqu’un qui parle à une pierre… laissez-le finir.",
] as const;

/** Presentation contract for the title-crossing sequence; no real-time NPC state is implied. */
export const ARRIVAL_SEQUENCE = {
  phases: ["quay", "title-crossing", "reveal", "welcome", "explore"],
  welcomeAfter: "title-crossing",
  allowSkip: true,
  reducedMotionFallback: true,
  requiresCamera: false,
  requiresSound: false,
} as const;
