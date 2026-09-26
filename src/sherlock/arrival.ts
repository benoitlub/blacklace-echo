import type { LocationIdentityId } from "./location-identities";

/** Author-confirmed narrative entry point; not yet connected to the public UI. */
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

/** No dialogue, quest, travel route or access permission is inferred from the entry point. */
