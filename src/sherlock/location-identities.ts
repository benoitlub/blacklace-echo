/** Blacklace location identity registry. User-confirmed aliases, NOT a geographic route graph.
 * No secret lore, paid access, Unity scene or runtime availability is implied.
 * Kept separate from Sherlock S-001's nine-node simulation graph.
 */
export const LOCATION_IDENTITIES = [
  { id: "max", name: "Max Liberty", aliases: ["Bar de la plage"], worldCorePlaceId: "max" },
  { id: "seawall", name: "Digue et peintures de Marty", aliases: ["Route côtière"], worldCorePlaceId: null },
  { id: "sator", name: "Dolmens SATOR", aliases: ["Clairière SATOR"], worldCorePlaceId: "sator" },
  { id: "reboot", name: "Cascade de la Fée Belette", aliases: ["Cascade Reboot"], worldCorePlaceId: "reboot" },
  { id: "port", name: "Port de Porsa Rotas", aliases: [], worldCorePlaceId: "port" },
  { id: "rotas", name: "Village de Rotas", aliases: [], worldCorePlaceId: "rotas" },
  { id: "institute", name: "Feuch Institute", aliases: [], worldCorePlaceId: "institute" },
  { id: "nikolas-lab", name: "Feuch Lab — créations de Nikolas", aliases: [], worldCorePlaceId: null },
  { id: "natasha-loft", name: "Loft de Natasha", aliases: [], worldCorePlaceId: null },
  { id: "natasha-studio", name: "Studio podcast / YouTube de Natasha", aliases: [], worldCorePlaceId: null },
  { id: "slobodane-garden", name: "Jardin de Slobodane", aliases: [], worldCorePlaceId: null },
  { id: "feuch-cave", name: "Grotte du Feuch", aliases: [], worldCorePlaceId: null },
  { id: "belette-meadow", name: "Prairie de la Fée Belette", aliases: [], worldCorePlaceId: null },
  { id: "fournaise", name: "Fournaise de Feuch", aliases: [], worldCorePlaceId: "fournaise" },
  { id: "fournaise-crater", name: "Cratère / scène de rave", aliases: [], worldCorePlaceId: null },
  { id: "ludmila", name: "Club de Ludmila", aliases: [], worldCorePlaceId: "ludmila" },
  { id: "ludmila-yacht", name: "Yacht secret du Club de Ludmila", aliases: ["Yacht secret"], worldCorePlaceId: null },
  { id: "hanging-forest", name: "Forêt suspendue", aliases: [], worldCorePlaceId: null },
  { id: "mangrove", name: "Mangrove", aliases: [], worldCorePlaceId: null },
  { id: "lolo-lab", name: "Laboratoire de Lolo", aliases: [], worldCorePlaceId: null },
  { id: "marty-studio", name: "Studio de Marty — Moscomiul Break", aliases: [], worldCorePlaceId: null },
  { id: "aloisia-cave", name: "Grotte sous-marine d’Aloisia", aliases: [], worldCorePlaceId: null },
  { id: "ten-net-tattoo", name: "Salon de tatouage de Ten-Net", aliases: ["Atelier Tatoueur 10net"], worldCorePlaceId: null },
  { id: "observatoire", name: "Observatoire de la Fournaise", aliases: ["Observatoire"], worldCorePlaceId: "observatoire" },
] as const;

export type LocationIdentityId = (typeof LOCATION_IDENTITIES)[number]["id"];

/** Confirmed containment from Benoît's description; NOT walkable connections. */
export const CONFIRMED_SUBZONES = [
  { parent: "fournaise", child: "fournaise-crater" },
  { parent: "ludmila", child: "ludmila-yacht" },
] as const satisfies readonly { parent: LocationIdentityId; child: LocationIdentityId }[];

/** Deliberately empty: route adjacency requires explicit geography confirmation. */
export const CONFIRMED_ROUTES: readonly (readonly [LocationIdentityId, LocationIdentityId])[] = [];

export function findLocationIdentity(name: string) {
  const key = name.trim().normalize("NFC").toLocaleLowerCase("fr");
  return LOCATION_IDENTITIES.find((place) =>
    [place.id, place.name, ...place.aliases].some((label) =>
      label.normalize("NFC").toLocaleLowerCase("fr") === key,
    ),
  );
}
