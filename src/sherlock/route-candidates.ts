import { LOCATION_IDENTITIES, type LocationIdentityId } from "./location-identities";

/**
 * Proposed navigation links, NOT canon and NOT enabled routes.
 * Evidence is source-code text or the author's location list, not verified traversal.
 * In particular, containment does not mean that a visitor can enter a subzone.
 */
export type RouteCandidate = {
  from: LocationIdentityId;
  to: LocationIdentityId;
  evidence: string;
  question: string;
  status: "proposed";
};

export const ROUTE_CANDIDATES: readonly RouteCandidate[] = [
  {
    from: "rotas",
    to: "port",
    evidence: "src/data/islandPoiScenes.ts: coast describes stairs toward Port Porsa Rotas; action disabled",
    question: "Les escaliers du centre de Rotas débouchent-ils directement sur le port ?",
    status: "proposed",
  },
  {
    from: "port",
    to: "seawall",
    evidence: "src/data/islandPoiScenes.ts: coast describes a future transition from port to coastal road; action disabled",
    question: "La route côtière / digue commence-t-elle au port ?",
    status: "proposed",
  },
  {
    from: "seawall",
    to: "mangrove",
    evidence: "src/data/islandPoiScenes.ts: coast mentions the mangrove and coastal road, without a navigable link",
    question: "La mangrove est-elle accessible directement depuis la digue ?",
    status: "proposed",
  },
  {
    from: "natasha-loft",
    to: "natasha-studio",
    evidence: "Benoît: loft de Natasha et son studio podcast/YouTube",
    question: "Le studio est-il une pièce du loft ou un bâtiment voisin ?",
    status: "proposed",
  },
  {
    from: "reboot",
    to: "belette-meadow",
    evidence: "Benoît: cascade et prairie de la Fée Belette",
    question: "La prairie est-elle attenante à la cascade ?",
    status: "proposed",
  },
  {
    from: "fournaise",
    to: "fournaise-crater",
    evidence: "Benoît: Fournaise et son cratère / scène de rave; confirmed containment only",
    question: "Quel accès mène à la scène dans le cratère ?",
    status: "proposed",
  },
  {
    from: "ludmila",
    to: "ludmila-yacht",
    evidence: "Benoît: yacht secret du Club de Ludmila; confirmed association only",
    question: "Quel est l'accès au yacht, et doit-il être visible sur la carte publique ?",
    status: "proposed",
  },
];

const ids = new Set<string>(LOCATION_IDENTITIES.map((location) => location.id));
export function validateRouteCandidates(candidates: readonly RouteCandidate[] = ROUTE_CANDIDATES): string[] {
  const errors: string[] = [];
  for (const candidate of candidates) {
    if (!ids.has(candidate.from) || !ids.has(candidate.to)) errors.push(`Unknown endpoint: ${candidate.from} → ${candidate.to}`);
    if (candidate.from === candidate.to) errors.push(`Self-link: ${candidate.from}`);
    if (!candidate.evidence.trim() || !candidate.question.trim()) errors.push(`Missing provenance or question: ${candidate.from} → ${candidate.to}`);
  }
  return errors;
}

/** No route is exposed for traversal until explicitly approved. */
export function confirmedNeighbors(_location: LocationIdentityId): readonly LocationIdentityId[] {
  return [];
}
