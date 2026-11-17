export const TRIP_SECONDS = 60;
export type TripPhase = "emergence" | "incrustations" | "hallucinations" | "dissipation" | "fin";
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function phaseAt(t: number): TripPhase {
  if (t < 10) return "emergence"; if (t < 25) return "incrustations"; if (t < 45) return "hallucinations"; if (t < TRIP_SECONDS) return "dissipation"; return "fin";
}
/** Envelopes 0..1. emerge: tracés, inlay: incrustations, warp: géométrie, fade: dissipation globale. */
export function envelopes(t: number) {
  return { emerge: smooth(0, 10, t), inlay: smooth(10, 25, t), warp: smooth(25, 31, t) * (1 - smooth(40, 45, t)), fade: 1 - smooth(45, TRIP_SECONDS, t) };
}
