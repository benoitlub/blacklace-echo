import { worldSignals, type WorldState } from "./world-core";

export type AmbiencePhase = "phase-signal" | "phase-feuch" | "phase-reboot" | "phase-sator";
export type AloisiaDecision = { phase: AmbiencePhase; source: "aloisia-world-signals"; reason: string; cycle: number };

/** Server-side decision based exclusively on persisted world state, not UI or random mock data.
 * This is a deterministic policy, not a claim of LLM autonomy. */
export function decideAloisiaAmbience(state: WorldState): AloisiaDecision {
  const signals = worldSignals(state).filter(signal => signal.intensity > 0);
  const strongest = [...signals].sort((a,b) => b.intensity - a.intensity || a.place.localeCompare(b.place))[0];
  const phase: AmbiencePhase = !strongest ? "phase-signal"
    : strongest.intensity >= 3 ? "phase-reboot"
    : strongest.place === "sator" || strongest.place === "reboot" ? "phase-sator"
    : strongest.intensity >= 2 ? "phase-feuch" : "phase-signal";
  return { phase, source: "aloisia-world-signals",
    reason: strongest ? `World signal at ${strongest.place} (intensity ${strongest.intensity})` : "No observable world signal",
    cycle: state.cycle };
}
