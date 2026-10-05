import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { BackgroundLayers } from "@/blacklace/Layers";
import RotasPlaza from "@/components/world/RotasPlaza";
import "@/styles/rotas.css";
import { ISLAND_LOCATIONS, ISLAND_LOCATION_BY_ID, islandRoute, type RoutePoint } from "@/blacklace/island-geography";
import { parsePublicFeed, parsePublicSignals, type PublicWorldEntry } from "@/blacklace/sherlock-feed";
import type { PlaceId } from "@/sherlock/world-core";

const HOTSPOTS = ISLAND_LOCATIONS;

const HOLOWALL_LABELS = ["ROTAS", "SATOR", "FEUCH", "ALOISIA", "SIGNAL", "BRUME"];

type Weather = "clear" | "rain" | "storm" | "fog";
type Time = "dawn" | "day" | "dusk" | "night";
type MapView = "map" | "zooming-rotas" | "rotas";
type SherlockPresence = { actor: string; place: PlaceId; cycle: number; moving: boolean; travelPoint?: RoutePoint; activity?: string; intention?: string; lastEvent?: string };
const PLACE_IDS = new Set(ISLAND_LOCATIONS.map(location => location.id));
const isPlaceId = (value: string): value is PlaceId => PLACE_IDS.has(value as PlaceId);
const ACTOR_NAMES: Record<string, string> = {
  "marie-jeanne": "MARIE JEANNE",
  natasha: "NATASHA",
  marty: "MARTY",
  slobodane: "SLOBODANE",
  lolo: "LOLO",
  nikolas: "NIKOLAS",
  ludmila: "LUDMILA",
  max: "MAX",
};
const ACTOR_COLORS: Record<string, string> = {
  "marie-jeanne": "#fff2a8",
  natasha: "#00e5ff",
  marty: "#60a5fa",
  slobodane: "#22c55e",
  lolo: "#ff7a00",
  nikolas: "#a855f7",
  ludmila: "#ec4899",
  max: "#ff003c",
};
const BlacklaceMap = () => {
  const [imgOk, setImgOk] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [view, setView] = useState<MapView>("map");
  const [weather, setWeather] = useState<Weather>("clear");
  const [time, setTime] = useState<Time>("day");
  const [worldSignals, setWorldSignals] = useState<ReturnType<typeof parsePublicSignals>>([]);
  const [sherlockStatus, setSherlockStatus] = useState<"off" | "connecting" | "live" | "unavailable">("off");
  const [presences, setPresences] = useState<Record<string, SherlockPresence>>({});
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const seenSherlockEvents = useRef(new Set<string>());
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;
    let rx = -16;
    let ry = 0;
    let trx = -16;
    let try_ = 0;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (view !== "map") return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      try_ = px * 20;
      trx = -16 + py * -10;
    };
    const onLeave = () => {
      trx = -16;
      try_ = 0;
    };
    const loop = () => {
      rx += (trx - rx) * 0.08;
      ry += (try_ - ry) * 0.08;
      scene.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(loop);
    };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    loop();
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [view]);

  useEffect(() => {
    const endpoint = import.meta.env.VITE_SHERLOCK_PUBLIC_FEED_URL;
    if (!endpoint) return;
    let active = true;
    const controller = new AbortController();
    const movementTimers = new Set<number>();
    setSherlockStatus("connecting");

    async function refresh() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal, credentials: "omit", cache: "no-store" });
        if (!response.ok) throw new Error("Feed unavailable");
        const entries = parsePublicFeed(await response.json());
        if (!active) return;
        for (const entry of entries) {
          const key = `${entry.cycle}:${entry.id}`;
          if (seenSherlockEvents.current.has(key)) continue;
          seenSherlockEvents.current.add(key);
          if (entry.kind === "waited" && isPlaceId(entry.place)) {
            const place = entry.place;
            setPresences(current => ({ ...current, [entry.actor]: { actor: entry.actor, place, cycle: entry.cycle, moving: false, activity: entry.activity, intention: entry.intention, lastEvent: entry.id.startsWith("presence:") ? current[entry.actor]?.lastEvent : `Reste à ${ISLAND_LOCATION_BY_ID[place].label}` } }));
          } else if (entry.kind === "moved" && isPlaceId(entry.from) && isPlaceId(entry.to)) {
            const from = entry.from;
            const to = entry.to;
            const points = islandRoute(from, to);
            setPresences(current => ({ ...current, [entry.actor]: { actor: entry.actor, place: from, cycle: entry.cycle, moving: true, travelPoint: points[0], activity: entry.activity, intention: entry.intention, lastEvent: `Se déplace vers ${ISLAND_LOCATION_BY_ID[to].label}` } }));
            const legMs = Math.max(420, Math.floor(4200 / Math.max(1, points.length - 1)));
            points.slice(1).forEach((point, index) => {
              const timer = window.setTimeout(() => {
                if (!active) return;
                const finalLeg = index === points.length - 2;
                setPresences(current => ({
                  ...current,
                  [entry.actor]: {
                    actor: entry.actor,
                    place: finalLeg ? to : from,
                    cycle: entry.cycle,
                    moving: !finalLeg,
                    travelPoint: finalLeg ? undefined : point,
                    activity: entry.activity,
                    intention: entry.intention,
                    lastEvent: `S'est déplacé vers ${ISLAND_LOCATION_BY_ID[to].label}`,
                  },
                }));
              }, 80 + legMs * (index + 1));
              movementTimers.add(timer);
            });
          } else if (entry.kind === "met" && isPlaceId(entry.place)) {
            for (const actor of entry.actors) {
              const other = entry.actors.find(candidate => candidate !== actor) ?? "";
              setPresences(current => current[actor] ? ({
                ...current,
                [actor]: { ...current[actor], cycle: entry.cycle, lastEvent: `A rencontré ${ACTOR_NAMES[other] ?? other} à ${ISLAND_LOCATION_BY_ID[entry.place as PlaceId].label}` },
              }) : current);
            }
          }
        }
        setSherlockStatus("live");
      } catch {
        if (active) setSherlockStatus("unavailable");
      }
    }

    void refresh();
    const poll = window.setInterval(() => void refresh(), 15000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(poll);
      movementTimers.forEach(timer => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    // Blacklace ambience follows a slow island clock instead of cycling like a demo.
    const updateTime = () => {
      const hour = new Date().getHours();
      setTime(hour >= 6 && hour < 9 ? "dawn" : hour >= 9 && hour < 18 ? "day" : hour >= 18 && hour < 21 ? "dusk" : "night");
    };
    updateTime();
    const clock = window.setInterval(updateTime, 60_000);

    // Weather changes rarely and keeps continuity between transitions.
    const weatherOrder: Weather[] = ["clear", "clear", "fog", "clear", "rain", "clear"];
    let weatherIndex = 0;
    const weatherCycle = window.setInterval(() => {
      weatherIndex = (weatherIndex + 1) % weatherOrder.length;
      setWeather(weatherOrder[weatherIndex]);
    }, 240_000);

    return () => {
      window.clearInterval(clock);
      window.clearInterval(weatherCycle);
    };
  }, []);

  function enterZone(id: string) {
    if (id === "rotas") {
      setActive(null);
      setView("zooming-rotas");
      window.setTimeout(() => setView("rotas"), 1200);
      return;
    }
    setActive(active === id ? null : id);
  }

  function backToMap() {
    setView("map");
    setActive(null);
  }

  const drops = useMemo(() => Array.from({ length: 54 }, (_, i) => ({
    left: (i * 37 + 11) % 100,
    duration: 0.62 + (i % 9) * 0.055,
    delay: -((i * 0.173) % 2.4),
  })), []);
  const clouds = useMemo(() => Array.from({ length: 4 }), []);
  const birds = useMemo(() => Array.from({ length: 3 }), []);
  const boats = useMemo(() => Array.from({ length: 2 }), []);
  const tiles = useMemo(() => Array.from({ length: 18 }), []);
  const stars = useMemo(() => Array.from({ length: 42 }), []);
  const activeZone = HOTSPOTS.find(h => h.id === active);
  const selectedPresence = selectedActor ? presences[selectedActor] : undefined;
  const currentCycle = Object.values(presences).reduce((max, presence) => Math.max(max, presence.cycle), 0);
  const latestPresence = Object.values(presences).sort((a, b) => b.cycle - a.cycle).find(presence => presence.lastEvent);
  const presenceLayout = useMemo(() => {
    const groups = new Map<PlaceId, SherlockPresence[]>();
    Object.values(presences).forEach(p => groups.set(p.place, [...(groups.get(p.place) ?? []), p]));
    return Array.from(groups.values()).flatMap(group => {
      group.sort((a, b) => a.actor.localeCompare(b.actor));
      const radius = group.length > 1 ? Math.min(6, 2.8 + group.length * 0.55) : 0;
      return group.map((presence, index) => {
        const angle = group.length > 1 ? -Math.PI / 2 + index * (Math.PI * 2 / group.length) : 0;
        return {
          presence,
          offsetX: Math.cos(angle) * radius,
          offsetY: Math.sin(angle) * radius * 0.72,
          labelLeft: group.length > 1 && Math.cos(angle) < -0.15,
          labelDy: group.length > 2 ? ((index % 3) - 1) * 12 : 0,
        };
      });
    });
  }, [presences]);

  return (
    <>
      <BackgroundLayers />
      <main className={`map-page map-page--full ${view === "zooming-rotas" ? "map-entering-rotas" : ""}`}>
        <header className="map-topbar">
          <Link className="bl-brand" to="/">
            <span className="bl-brand-eye">◉</span>
            <span>BLACKLACE</span>
          </Link>
          <Link className="bl-pill" to="/atlas">LIEUX & HABITANTS</Link>
          <Link className="bl-pill" to="/">RETOUR LIVE</Link>
        </header>

        <section className="holo-map-stage holo-map-stage--bare">
          <div className={`island3d-stage time-${time} weather-${weather}`} ref={stageRef}>
            <div className="holowall" aria-hidden>
              {tiles.map((_, i) => (
                <div key={i} className={`holowall-tile tile-${i % 6}`} style={{ animationDelay: `${(i * 0.37) % 4}s` }}>
                  <span className="hw-name">{HOLOWALL_LABELS[i % HOLOWALL_LABELS.length]}</span>
                  <span className="hw-scan" />
                  <span className="hw-glitch" />
                </div>
              ))}
              <div className="holowall-vignette" />
            </div>

            <div className="i3d-stars" aria-hidden>
              {stars.map((_, i) => (
                <span key={i} style={{ left: `${(i * 17) % 100}%`, top: `${(i * 29) % 70}%`, animationDelay: `${(i % 9) * 0.4}s` }} />
              ))}
            </div>

            <div className="island3d-scene" ref={sceneRef}>
              <div className="i3d-layer i3d-sky">
                {clouds.map((_, i) => (
                  <span key={i} className="i3d-cloud" style={{
                    top: `${5 + (i * 11) % 35}%`,
                    animationDuration: `${40 + i * 7}s`,
                    animationDelay: `${-i * 6}s`,
                    transform: `translateZ(${60 + i * 8}px) scale(${0.6 + (i % 3) * 0.25})`,
                    opacity: 0.35 + (i % 3) * 0.15,
                  }} />
                ))}
                {birds.map((_, i) => (
                  <span key={i} className="i3d-bird" style={{
                    top: `${15 + i * 8}%`,
                    animationDuration: `${22 + i * 4}s`,
                    animationDelay: `${-i * 5}s`,
                    transform: `translateZ(${90 + i * 10}px)`,
                  }} />
                ))}
              </div>

              <div className="i3d-layer i3d-island" ref={islandRef}>
                {imgOk ? (
                  <img
                    src={`${import.meta.env.BASE_URL}assets/img/island-cutout.png`}
                    alt="Blacklace Island"
                    onError={() => setImgOk(false)}
                    draggable={false}
                  />
                ) : (
                  <div className="i3d-placeholder">CARTE EN ATTENTE</div>
                )}

                <div className="i3d-volcano">
                  <span className="i3d-smoke" />
                  <span className="i3d-smoke s2" />
                  <span className="i3d-smoke s3" />
                  <span className="i3d-ember" />
                  <span className="i3d-ember e2" />
                  <span className="i3d-ember e3" />
                </div>

                {boats.map((_, i) => (
                  <span key={i} className="i3d-boat" style={{
                    top: `${60 + i * 9}%`,
                    animationDuration: `${50 + i * 12}s`,
                    animationDelay: `${-i * 14}s`,
                  }}>⛵</span>
                ))}

                {worldSignals.map((signal, index) => {
                  const location = ISLAND_LOCATION_BY_ID[signal.place as PlaceId];
                  if (!location || signal.intensity <= 0) return null;
                  return <span
                    key={`${signal.place}:${index}`}
                    className={`i3d-world-signal i3d-world-signal--${signal.intensity}`}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                    title={signal.trace}
                    aria-label={`Signal à ${location.label}: ${signal.trace}`}
                  ><i/><b>{signal.observable ? signal.trace : `ANOMALIE · ${signal.intensity}`}</b></span>;
                })}

                {HOTSPOTS.map(h => (
                  <button
                    key={h.id}
                    className={`i3d-hotspot ${active === h.id ? "is-on" : ""}`}
                    style={{ left: `${h.x}%`, top: `${h.y}%`, ["--c" as any]: h.color }}
                    onClick={() => enterZone(h.id)}
                    title={`${h.label} — ${h.status}`}
                  >
                    <span className="i3d-pulse" />
                    <span className="i3d-pin" />
                    <span className="i3d-label">{h.label}</span>
                  </button>
                ))}

                {presenceLayout.map(({ presence, offsetX, offsetY, labelLeft, labelDy }) => {
                  const location = ISLAND_LOCATION_BY_ID[presence.place];
                  const position = presence.travelPoint ?? location;
                  const color = ACTOR_COLORS[presence.actor] ?? "#ffffff";
                  return (
                    <div
                      key={presence.actor}
                      className={`i3d-char i3d-char--sherlock ${presence.moving ? "is-moving" : ""} ${selectedActor === presence.actor ? "is-selected" : ""} ${labelLeft ? "label-left" : "label-right"}`}
                      style={{ left: `${position.x + offsetX}%`, top: `${position.y + offsetY}%`, ["--c" as any]: color, ["--label-dy" as any]: `${labelDy}px` }}
                      title={`${ACTOR_NAMES[presence.actor] ?? presence.actor} · ${location.label} · cycle ${presence.cycle}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${ACTOR_NAMES[presence.actor] ?? presence.actor}, ${location.label}, cycle ${presence.cycle}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => { event.stopPropagation(); setSelectedActor(current => current === presence.actor ? null : presence.actor); }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedActor(current => current === presence.actor ? null : presence.actor);
                        }
                      }}
                    >
                      <span className="i3d-char-trail" />
                      <span className="i3d-char-dot" />
                      <span className="i3d-char-name">{ACTOR_NAMES[presence.actor] ?? presence.actor}</span>
                    </div>
                  );
                })}
              </div>

              <div className="i3d-layer i3d-weather">
                {(weather === "rain" || weather === "storm") && drops.map((drop, i) => (
                  <span key={i} className="i3d-drop" style={{
                    left: `${drop.left}%`,
                    animationDuration: `${drop.duration}s`,
                    animationDelay: `${drop.delay}s`,
                  }} />
                ))}
                {weather === "storm" && <span className="i3d-lightning" />}
                {weather === "fog" && <span className="i3d-fog" />}
              </div>

              <div className="i3d-shadow" />
            </div>

            <div className="i3d-tint" aria-hidden />
          </div>

          {view === "map" && (
            <>
              <div className={`sherlock-map-status is-${sherlockStatus}`}>
                <span className="sherlock-map-dot" />
                {sherlockStatus === "live" ? `CYCLE ${currentCycle} · ${Object.keys(presences).length} HABITANTS · SHERLOCK LIVE` : sherlockStatus === "connecting" ? "SHERLOCK · CONNEXION…" : sherlockStatus === "unavailable" ? "SHERLOCK · HORS SIGNAL" : "SHERLOCK · OFF"}
              </div>
              {latestPresence?.lastEvent && <div className="sherlock-world-ticker"><span>DERNIER ÉVÉNEMENT</span>{ACTOR_NAMES[latestPresence.actor] ?? latestPresence.actor} · {latestPresence.lastEvent}</div>}
            </>
          )}

          {selectedPresence && view === "map" && (
            <aside className="sherlock-resident-card" style={{ ["--c" as any]: ACTOR_COLORS[selectedPresence.actor] ?? "#fff" }}>
              <button className="sherlock-resident-close" onClick={() => setSelectedActor(null)} aria-label="Fermer">×</button>
              <span className="section-kicker">RÉSIDENT · CYCLE {selectedPresence.cycle}</span>
              <h3>{ACTOR_NAMES[selectedPresence.actor] ?? selectedPresence.actor}</h3>
              <strong>{ISLAND_LOCATION_BY_ID[selectedPresence.place].label}</strong>
              {selectedPresence.moving && <p>EN DÉPLACEMENT</p>}
              {selectedPresence.activity && <p>Activité · {selectedPresence.activity}</p>}
              {selectedPresence.intention && <p>Intention · {selectedPresence.intention}</p>}
              {selectedPresence.lastEvent && <p className="sherlock-resident-event">{selectedPresence.lastEvent}</p>}
            </aside>
          )}

          {activeZone && view === "map" && (
            <div className="i3d-info">
              <span className="section-kicker">ZONE</span>
              <h3>{activeZone.label}</h3>
              <span className={`bl-zone-status bl-zone-status--${activeZone.status.replace(/\s+/g, "-")}`}>{activeZone.status}</span>
              <button className="bl-pill" onClick={() => setActive(null)}>FERMER</button>
            </div>
          )}
        </section>
      </main>

      {(view === "zooming-rotas" || view === "rotas") && (
        <RotasPlaza
          entering={view === "zooming-rotas"}
          onBack={backToMap}
          residents={Object.values(presences).filter(presence => presence.place === "rotas").map(presence => ({
            actor: presence.actor,
            name: ACTOR_NAMES[presence.actor] ?? presence.actor.toUpperCase(),
            color: ACTOR_COLORS[presence.actor] ?? "#00e5ff",
            activity: presence.activity,
            intention: presence.intention,
            lastEvent: presence.lastEvent,
          }))}
        />
      )}
    </>
  );
};

export default BlacklaceMap;
