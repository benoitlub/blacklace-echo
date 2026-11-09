import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { ISLAND_LOCATIONS, ISLAND_LOCATION_BY_ID, type RoutePoint } from "@/blacklace/island-geography";
import type { PlaceId } from "@/sherlock/world-core";
import { usePortHeadTracking } from "./usePortHeadTracking";
import "@/styles/port-arrival.css";

const ANCHORS: Record<PlaceId, RoutePoint> = {
  port: { x: 49, y: 83 },
  rotas: { x: 32, y: 43 },
  max: { x: 83, y: 58 },
  ludmila: { x: 73, y: 67 },
  sator: { x: 79, y: 34 },
  institute: { x: 65, y: 48 },
  fournaise: { x: 57, y: 22 },
  reboot: { x: 18, y: 35 },
  observatoire: { x: 92, y: 43 },
};

type Visitor = {
  id: string; name: string; color: string; place: PlaceId; travelPoint?: RoutePoint; moving: boolean;
  offsetX: number; offsetY: number;
};

type Props = {
  entered: boolean;
  onEnter: () => void;
  active: string | null;
  selectedActor: string | null;
  visitors: Visitor[];
  signals: { place: PlaceId; trace: string }[];
  night: boolean;
  onNight: () => void;
  onPlace: (id: PlaceId) => void;
  onActor: (id: string) => void;
};

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

function project(point: RoutePoint) {
  // Warp the existing route points toward the landmarks in this perspective.
  let total = 0;
  let x = 0;
  let y = 0;
  for (const place of ISLAND_LOCATIONS) {
    const anchor = ANCHORS[place.id];
    const distance = (place.x - point.x) ** 2 + (place.y - point.y) ** 2;
    if (!distance) return anchor;
    const weight = 1 / distance;
    total += weight;
    x += (anchor.x - place.x) * weight;
    y += (anchor.y - place.y) * weight;
  }
  return { x: point.x + x / total, y: point.y + y / total };
}

export default function PortArrival({ entered, onEnter, active, selectedActor, visitors, signals, night, onNight, onPlace, onActor }: Props) {
  const root = useRef<HTMLElement>(null);
  const view = useRef({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number } | null>(null);
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [crossing, setCrossing] = useState(false);
  const media = usePortHeadTracking(look, reduced);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  function look(x: number, y: number) {
    view.current = { x: clamp(x), y: clamp(y) };
    root.current?.style.setProperty("--port-look-x", String(view.current.x));
    root.current?.style.setProperty("--port-look-y", String(view.current.y));
  }

  function finishCrossing() {
    setCrossing(false);
    onEnter();
    root.current?.focus({ preventScroll: true });
  }

  function advance() {
    if (crossing || entered) return;
    if (reduced) finishCrossing();
    else setCrossing(true);
  }

  useEffect(() => {
    if (!crossing || !reduced) return;
    setCrossing(false);
    onEnter();
    root.current?.focus({ preventScroll: true });
  }, [crossing, reduced, onEnter]);

  function pointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (media.enabled || event.pointerType === "mouse" || !event.isPrimary || (event.target as HTMLElement).closest("button")) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: view.current.x, startY: view.current.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (media.enabled) return;
    if (event.pointerType === "mouse") {
      const rect = event.currentTarget.getBoundingClientRect();
      look(1 - 2 * (event.clientX - rect.left) / rect.width, 1 - 2 * (event.clientY - rect.top) / rect.height);
    } else if (drag.current?.id === event.pointerId) {
      const { x, y, startX, startY } = drag.current;
      look(startX + (event.clientX - x) / 150, startY + (event.clientY - y) / 150);
    }
  }

  return (
    <section id="holomap-port" ref={root} className={`port-arrival ${night ? "port-arrival--night" : ""}`}
      data-phase={entered ? "explore" : crossing ? "crossing" : "intro"} tabIndex={0}
      aria-label={entered ? "Arrivée au port. Glisse ou utilise les flèches pour regarder autour de toi." : "Arrivée au port. Appuie sur la flèche haute pour avancer."}
      onPointerDown={pointerDown} onPointerMove={pointerMove}
      onLostPointerCapture={() => { drag.current = null; }}
      onPointerLeave={event => { if (event.pointerType === "mouse" && !media.enabled) look(0, 0); }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (!entered && event.key === "ArrowUp") { event.preventDefault(); advance(); return; }
        if (media.enabled) return;
        const directions: Record<string, [number, number]> = { ArrowLeft: [.25, 0], ArrowRight: [-.25, 0], ArrowUp: [0, .25], ArrowDown: [0, -.25], Home: [-view.current.x, -view.current.y] };
        const offset = directions[event.key];
        if (!offset) return;
        event.preventDefault();
        look(view.current.x + offset[0], view.current.y + offset[1]);
      }}>
      <div className="port-world">
        <img className="port-landscape" src={`${import.meta.env.BASE_URL}assets/port/arrival.webp`} alt="Vue depuis les quais de Porsa Rotas vers les dômes du village et la Fournaise de Feuch" draggable={false} />
        {night && <img className="port-landscape" src={`${import.meta.env.BASE_URL}assets/port/arrival-night.webp`} alt="" draggable={false} />}
        {entered && ISLAND_LOCATIONS.map(place => {
          const anchor = ANCHORS[place.id];
          return <button key={place.id} className="port-place" type="button" onClick={() => onPlace(place.id)}
            aria-pressed={active === place.id} title={place.status}
            style={{ left: `${anchor.x}%`, top: `${anchor.y}%`, "--port-pin-color": place.color, "--port-pin-depth": anchor.y / 100 } as CSSProperties}>
            {place.label}<i aria-hidden="true" />
          </button>;
        })}
        {entered && signals.map((signal, index) => {
          const anchor = ANCHORS[signal.place];
          return <span key={`${signal.place}:${index}`} className="port-signal" title={signal.trace}
            style={{ left: `${anchor.x}%`, top: `${anchor.y + 2}%` }} />;
        })}
        {entered && visitors.map(visitor => {
          const anchor = visitor.travelPoint ? project(visitor.travelPoint) : ANCHORS[visitor.place];
          return <button key={visitor.id} className={`port-resident ${visitor.moving ? "is-moving" : ""}`} type="button" onClick={() => onActor(visitor.id)}
            aria-label={`${visitor.name}, ${ISLAND_LOCATION_BY_ID[visitor.place].label}`}
            aria-pressed={selectedActor === visitor.id}
            style={{ left: `${anchor.x + visitor.offsetX * .6}%`, top: `${anchor.y + 3 + visitor.offsetY * .6}%`, "--port-resident-color": visitor.color } as CSSProperties}>
            <i aria-hidden="true" /><span>{visitor.name}</span>
          </button>;
        })}
      </div>
      {!entered && <h2 className="port-welcome" aria-label="Welcome to Blacklace Island">
        <span className="port-welcome-copy" aria-hidden="true" onAnimationEnd={event => {
          if (event.animationName === "port-cross-title") finishCrossing();
        }}>
          <span className="port-welcome-kicker">Welcome to</span>
          <strong>Blacklace Island</strong>
        </span>
      </h2>}
      <img className="port-foreground" src={`${import.meta.env.BASE_URL}assets/port/mooring.webp`} alt="" draggable={false} />
      <div className="port-haze" aria-hidden="true" />
      {!entered && !crossing && <button className="port-advance" type="button" onClick={advance}>Avancer sur le quai <span aria-hidden="true">↑</span></button>}
      <div className="port-view-controls">
        <button type="button" aria-pressed={night} onClick={onNight}>{night ? "☀ Jour" : "☾ Nuit"}</button>
        <button type="button" aria-pressed={media.enabled} disabled={reduced} onClick={media.toggle}>Suivi de tête</button>
        <button type="button" onClick={media.recenter}>Recentrer</button>
        {media.message && <p role="status">{media.message}</p>}
      </div>
    </section>
  );
}
