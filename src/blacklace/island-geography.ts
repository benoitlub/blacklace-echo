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


export type RoutePoint = { x: number; y: number };
export type IslandRoute = { from: PlaceId; to: PlaceId; points: readonly RoutePoint[] };

/**
 * Visual travel corridors. Sherlock still authorises only place-to-place moves;
 * these waypoints describe how a verified move is rendered across the island.
 */
const route = (from: PlaceId, to: PlaceId, points: readonly RoutePoint[]): IslandRoute => ({ from, to, points });
export const ISLAND_ROUTES: readonly IslandRoute[] = [
  route("port","rotas",[{x:27,y:69},{x:28,y:64},{x:31,y:60},{x:30,y:57},{x:34,y:54}]),
  route("rotas","max",[{x:34,y:54},{x:39,y:57},{x:44,y:56},{x:49,y:61},{x:55,y:63},{x:61,y:68}]),
  route("rotas","ludmila",[{x:34,y:54},{x:40,y:55},{x:45,y:59},{x:51,y:60},{x:56,y:65}]),
  route("max","ludmila",[{x:61,y:68},{x:59,y:66},{x:57,y:67},{x:56,y:65}]),
  route("rotas","sator",[{x:34,y:54},{x:41,y:51},{x:47,y:53},{x:54,y:48},{x:62,y:47},{x:67,y:42},{x:73,y:40}]),
  route("rotas","institute",[{x:34,y:54},{x:37,y:49},{x:41,y:47},{x:42,y:42},{x:46,y:39},{x:48,y:35}]),
  route("institute","fournaise",[{x:48,y:35},{x:46,y:31},{x:49,y:28},{x:48,y:25},{x:52,y:22}]),
  route("sator","reboot",[{x:73,y:40},{x:76,y:44},{x:74,y:49},{x:79,y:53},{x:78,y:58}]),
  route("rotas","observatoire",[{x:34,y:54},{x:36,y:57},{x:35,y:61},{x:40,y:65}]),
];

export function islandRoute(from: PlaceId, to: PlaceId): readonly RoutePoint[] {
  const direct = ISLAND_ROUTES.find(r => r.from === from && r.to === to);
  if (direct) return direct.points;
  const reverse = ISLAND_ROUTES.find(r => r.from === to && r.to === from);
  return reverse ? [...reverse.points].reverse() : [ISLAND_LOCATION_BY_ID[from], ISLAND_LOCATION_BY_ID[to]];
}
