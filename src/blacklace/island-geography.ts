import type { PlaceId } from "@/sherlock/world-core";

export type IslandLocation = {
  id: PlaceId;
  label: string;
  status: "stable" | "signal faible" | "instable" | "fermé";
  x: number;
  y: number;
  color: string;
};

/**
 * HoloMap geography in percentages of island-cutout.png.
 * This is the single source of truth for Sherlock place rendering.
 * Coordinates describe map anchors, not simulated continuous GPS positions.
 */
export const ISLAND_LOCATIONS: readonly IslandLocation[] = [
  { id: "port", label: "Port Porsa Rotas", status: "stable", x: 27, y: 69, color: "#3b82f6" },
  { id: "rotas", label: "Village de Rotas", status: "stable", x: 34, y: 54, color: "#22c55e" },
  { id: "max", label: "Max Liberty", status: "stable", x: 61, y: 68, color: "#ff003c" },
  { id: "ludmila", label: "Club Ludmila", status: "signal faible", x: 56, y: 65, color: "#ec4899" },
  { id: "sator", label: "Clairière SATOR", status: "instable", x: 73, y: 40, color: "#a855f7" },
  { id: "institute", label: "Feuch Institute", status: "instable", x: 48, y: 35, color: "#ff7a00" },
  { id: "fournaise", label: "Fournaise de Feuch", status: "fermé", x: 52, y: 22, color: "#ff7a00" },
  { id: "reboot", label: "Cascade Reboot", status: "signal faible", x: 78, y: 58, color: "#00e5ff" },
  { id: "observatoire", label: "Observatoire", status: "fermé", x: 40, y: 65, color: "#00e5ff" },
];

export const ISLAND_LOCATION_BY_ID: Readonly<Record<PlaceId, IslandLocation>> =
  Object.fromEntries(ISLAND_LOCATIONS.map(location => [location.id, location])) as Record<PlaceId, IslandLocation>;
