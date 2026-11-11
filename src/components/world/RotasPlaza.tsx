import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import "@/styles/rotas-visit.css";

type RotasResident = { actor: string; name: string; color: string; activity?: string; intention?: string; lastEvent?: string };
type Props = { entering: boolean; onBack: () => void; residents?: RotasResident[] };
type SceneId = "square" | "tea" | "market" | "stairs" | "coast" | "shop";
type Stop = { id: string; label: string; x: number; y: number; destination?: SceneId; description: string };
type Scene = { title: string; subtitle: string; ratio: number; stops: Stop[] };
const SCENES: Record<SceneId, Scene> = {
  square: { title: "La place de Rotas", subtitle: "Pierre dorée, dômes turquoise et chemins en spirale", ratio: 4 / 3, stops: [
    { id: "eye", label: "Maison de l’Œil", x: 57, y: 36, description: "Le grand dôme et son œil sculpté veillent sur la place. Observez les volumes de pierre claire, le cuivre et la végétation qui gagne les toitures." },
    { id: "tea", label: "Salon de thé", x: 25, y: 43, destination: "tea", description: "Rejoindre les terrasses du salon de thé." },
    { id: "shop", label: "Boutique", x: 84, y: 48, destination: "shop", description: "Se rapprocher des vitrines et des étals." },
    { id: "fountain", label: "Fontaine centrale", x: 51, y: 61, description: "L’eau et les mosaïques marquent le cœur de Rotas. Autour du bassin, les spirales relient les chemins et les terrasses." },
    { id: "market", label: "Marché", x: 37, y: 73, destination: "market", description: "Descendre vers les échoppes du marché." },
  ] },
  tea: { title: "Les terrasses du thé", subtitle: "Auvents turquoise et petits passages fleuris", ratio: 9 / 16, stops: [
    { id: "tables", label: "Observer la terrasse", x: 61, y: 45, description: "Des tables se nichent sous les auvents. Les lanternes, les poteries et les plantes prolongent le salon jusque dans la rue." },
    { id: "stairs", label: "Vers les escaliers", x: 30, y: 39, destination: "stairs", description: "Monter entre les terrasses." },
  ] },
  market: { title: "La rue du marché", subtitle: "Échoppes, fontaine et lumière de la côte", ratio: 9 / 16, stops: [
    { id: "stalls", label: "Observer les étals", x: 18, y: 56, description: "Bois sculpté, auvents rayés, fruits et céramiques : le marché reprend les couleurs et les matières de la place." },
    { id: "square", label: "Rejoindre la place", x: 53, y: 49, destination: "square", description: "Retrouver la fontaine centrale." },
    { id: "coast", label: "Vers la côte", x: 39, y: 25, destination: "coast", description: "Poursuivre la promenade vers la mer." },
  ] },
  stairs: { title: "Les escaliers fleuris", subtitle: "Rotas se découvre aussi en hauteur", ratio: 9 / 16, stops: [
    { id: "bridge", label: "Observer la passerelle", x: 65, y: 36, description: "Escaliers, arches et passerelles relient les niveaux. Les pavés à spirales accompagnent la montée entre les façades végétales." },
    { id: "tea", label: "Vers le salon de thé", x: 23, y: 51, destination: "tea", description: "Retrouver les terrasses." },
    { id: "coast", label: "Descendre vers la mer", x: 77, y: 48, destination: "coast", description: "Prendre le passage ouvert sur la côte." },
  ] },
  coast: { title: "Le passage de la côte", subtitle: "Sous les arches, la mer apparaît", ratio: 9 / 16, stops: [
    { id: "sea", label: "Observer la mer", x: 57, y: 53, description: "Entre les façades de Rotas, le passage s’ouvre sur l’eau. La pierre chaude et les lanternes répondent au bleu de la côte." },
    { id: "stairs", label: "Remonter les escaliers", x: 28, y: 36, destination: "stairs", description: "Revenir vers les niveaux hauts." },
    { id: "market", label: "Vers le marché", x: 50, y: 74, destination: "market", description: "Retrouver les échoppes." },
  ] },
  shop: { title: "La rue des boutiques", subtitle: "Vitrines, cuivre patiné et portes turquoise", ratio: 9 / 16, stops: [
    { id: "window", label: "Observer la vitrine", x: 25, y: 48, description: "Objets, étoffes et petits ornements se mêlent au bois et au cuivre. Cette promenade permet d’observer la boutique ; aucun achat n’est déclenché." },
    { id: "market", label: "Vers le marché", x: 64, y: 62, destination: "market", description: "Suivre les pavés en spirale." },
  ] },
};
const SCENE_IDS = Object.keys(SCENES) as SceneId[];
const RESIDENT_POSITIONS = [{ x: 48, y: 66 }, { x: 62, y: 63 }, { x: 35, y: 56 }, { x: 74, y: 59 }, { x: 44, y: 78 }, { x: 64, y: 77 }];
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
type Camera = { zoom: number; x: number; y: number };

export default function RotasPlaza({ entering, onBack, residents = [] }: Props) {
  const [sceneId, setSceneId] = useState<SceneId>("square");
  const scene = SCENES[sceneId];
  const [dragging, setDragging] = useState(false);
  const [camera, setCamera] = useState<Camera>({ zoom: 1, x: .5, y: .5 });
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [selected, setSelected] = useState<Stop | null>(null);
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [showResidents, setShowResidents] = useState(false);
  const [night, setNight] = useState(false);
  const [sound, setSound] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [depth, setDepth] = useState(true);
  const [depthReady, setDepthReady] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const back = useRef<HTMLAnchorElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ camera: Camera; x: number; y: number; distance: number } | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const resident = residents.find(item => item.actor === selectedActor);
  const baseHeight = Math.max(size.height, size.width / scene.ratio);
  const baseWidth = baseHeight * scene.ratio;
  const width = baseWidth * camera.zoom;
  const height = baseHeight * camera.zoom;
  const offsetX = clamp(size.width / 2 - camera.x * width, size.width - width, 0);
  const offsetY = clamp(size.height / 2 - camera.y * height, size.height - height, 0);
  const perspective = sceneId === "square" && depth && depthReady && !imageError;

  useEffect(() => {
    const target = viewport.current;
    if (!target) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const map = document.querySelector<HTMLElement>("main.map-page");
    const previousInert = map?.inert ?? false;
    if (map) map.inert = true;
    document.body.style.overflow = "hidden";
    const hadVisitClass = document.body.classList.contains("rotas-visiting");
    document.body.classList.add("rotas-visiting");
    back.current?.focus();
    return () => {
      if (map) map.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      if (!hadVisitClass) document.body.classList.remove("rotas-visiting");
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  // Optional generated water/wind texture. Audio starts only after a button press.
  useEffect(() => {
    if (!sound || !audio.current) return;
    const context = audio.current;
    const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * .18;
    const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
    const filter = context.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = sceneId === "coast" ? 650 : 1100;
    const gain = context.createGain(); gain.gain.setValueAtTime(0, context.currentTime); gain.gain.linearRampToValueAtTime(.13, context.currentTime + .7);
    source.connect(filter).connect(gain).connect(context.destination); source.start();
    return () => { source.stop(); source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }, [sound, sceneId]);
  useEffect(() => () => { void audio.current?.close(); }, []);

  function go(id: SceneId) {
    if (id === sceneId) { reset(); return; }
    setSceneId(id); setSelected(null); setSelectedActor(null); setShowResidents(false);
    setCamera({ zoom: 1, x: .5, y: .5 }); setImageError(false); setImageLoading(true);
    setDepthReady(false);
    resetLook();
    pointers.current.clear(); gesture.current = null; setDragging(false);
    requestAnimationFrame(() => viewport.current?.focus());
  }
  function observe(stop: Stop) {
    if (stop.destination) { go(stop.destination); return; }
    setSelected(stop); setSelectedActor(null); setShowResidents(false);
    setCamera({ zoom: 1.65, x: stop.x / 100, y: stop.y / 100 });
  }
  function zoom(delta: number) { setCamera(value => ({ ...value, zoom: clamp(value.zoom + delta, 1, 2.5) })); }
  function reset() { setCamera({ zoom: 1, x: .5, y: .5 }); setSelected(null); setSelectedActor(null); setShowResidents(false); resetLook(); }
  function resetLook() {
    viewport.current?.style.removeProperty("--rv-look-x");
    viewport.current?.style.removeProperty("--rv-look-y");
  }
  function pointerMetrics() {
    const points = [...pointers.current.values()];
    if (!points.length) return null;
    return { x: points.reduce((n,p) => n + p.x, 0) / points.length, y: points.reduce((n,p) => n + p.y, 0) / points.length,
      distance: points.length > 1 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 0 };
  }
  function startGesture() { const metrics = pointerMetrics(); gesture.current = metrics ? { ...metrics, camera: cameraRef.current } : null; }
  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button") || event.button > 0) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); startGesture();
  }
  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (perspective && pointers.current.size < 2 && !(event.target as HTMLElement).closest("button")) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = clamp(2 * (event.clientX - rect.left) / rect.width - 1, -1, 1);
      const y = clamp(2 * (event.clientY - rect.top) / rect.height - 1, -1, 1);
      event.currentTarget.style.setProperty("--rv-look-x", String(x));
      event.currentTarget.style.setProperty("--rv-look-y", String(y));
    }
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const metrics = pointerMetrics()!; const initial = gesture.current;
    const nextZoom = initial.distance && metrics.distance ? clamp(initial.camera.zoom * metrics.distance / initial.distance, 1, 2.5) : initial.camera.zoom;
    const w = baseWidth * nextZoom, h = baseHeight * nextZoom;
    const startX = clamp(size.width / 2 - initial.camera.x * baseWidth * initial.camera.zoom, size.width - baseWidth * initial.camera.zoom, 0);
    const startY = clamp(size.height / 2 - initial.camera.y * baseHeight * initial.camera.zoom, size.height - baseHeight * initial.camera.zoom, 0);
    const rect = event.currentTarget.getBoundingClientRect();
    const px = initial.x - rect.left, py = initial.y - rect.top;
    const nextX = px - (px - startX) * nextZoom / initial.camera.zoom + metrics.x - initial.x;
    const nextY = py - (py - startY) * nextZoom / initial.camera.zoom + metrics.y - initial.y;
    setCamera({ zoom: nextZoom, x: (size.width / 2 - clamp(nextX, size.width - w, 0)) / w, y: (size.height / 2 - clamp(nextY, size.height - h, 0)) / h });
  }
  function pointerEnd(event: ReactPointerEvent<HTMLDivElement>) { pointers.current.delete(event.pointerId); setDragging(pointers.current.size > 0); if (!pointers.current.size) resetLook(); startGesture(); }
  async function toggleSound() {
    if (sound) { setSound(false); return; }
    try {
      if (!audio.current) audio.current = new AudioContext();
      await audio.current.resume(); setSound(true);
    } catch { setSound(false); }
  }

  return (
    <section ref={root} role="dialog" aria-modal="true" aria-labelledby="rotas-visit-title"
      className={`rotas-visit ${dragging ? "rv-is-dragging" : ""} ${night ? "rotas-visit--night" : ""} ${entering ? "rotas-visit--entering" : ""}`}
      onKeyDown={event => {
        if (event.key === "Escape") { event.stopPropagation(); if (selected || selectedActor || showResidents) reset(); else if (sceneId !== "square") go("square"); else onBack(); }
        if (event.key === "Tab") {
          const items = Array.from(root.current?.querySelectorAll<HTMLElement>('button:not([disabled]), summary, [href], [tabindex="0"]') ?? []).filter(el => el.getClientRects().length > 0);
          const first = items[0], last = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div ref={viewport} className="rv-viewport" tabIndex={0} aria-label="Décor de Rotas. Flèches pour déplacer la vue, plus et moins pour zoomer, touche Origine pour recentrer."
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd}
        onPointerLeave={() => { if (!pointers.current.size) resetLook(); }}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          const moves: Record<string, [number, number]> = { ArrowLeft: [-.06, 0], ArrowRight: [.06, 0], ArrowUp: [0, -.06], ArrowDown: [0, .06] };
          if (moves[event.key]) { event.preventDefault(); const [x,y] = moves[event.key]; setCamera(c => ({ ...c, x: clamp(c.x + x, 0, 1), y: clamp(c.y + y, 0, 1) })); }
          if (["+", "=", "-", "Home"].includes(event.key)) { event.preventDefault(); if (event.key === "Home") reset(); else zoom(event.key === "-" ? -.25 : .25); }
        }}>
        {size.width > 1 && size.height > 1 && <div className={`rv-canvas ${perspective ? "rv-canvas--perspective" : ""}`}
          style={{ width, height, "--rv-camera-x": `${offsetX}px`, "--rv-camera-y": `${offsetY}px` } as CSSProperties}>
          <img key={sceneId} src={`${import.meta.env.BASE_URL}assets/rotas/${sceneId}.webp`} alt={scene.subtitle} className="rv-scene" draggable={false}
            onLoad={() => setImageLoading(false)} onError={() => { setImageError(true); setImageLoading(false); }} />
          {sceneId === "square" && <>
            <img src={`${import.meta.env.BASE_URL}assets/rotas/square-depth.webp`} alt="" draggable={false}
              className="rv-scene rv-depth-plate" hidden={!perspective} onLoad={() => setDepthReady(true)} onError={() => setDepthReady(false)} />
            {perspective && <img src={`${import.meta.env.BASE_URL}assets/rotas/square.webp`} alt="" draggable={false} className="rv-scene rv-near" />}
          </>}
          <div className="rv-sunlight" aria-hidden="true" />
          {sceneId === "square" && <div className="rv-water" style={{ left: "51%", top: "61%" }} aria-hidden="true"><i /><i /><i /></div>}
          {scene.stops.map((stop) => <button key={stop.id} type="button" className={`rv-hotspot ${selected?.id === stop.id ? "is-selected" : ""}`}
            style={{ left: clamp(stop.x / 100 * width, -offsetX + 54, -offsetX + size.width - 54), top: clamp(stop.y / 100 * height, -offsetY + 125, -offsetY + size.height - 95) }} onClick={() => observe(stop)} aria-label={stop.label} title={stop.label}>
            <span>{stop.destination ? "→" : "+"}</span><strong>{stop.label}</strong>
          </button>)}
          {sceneId === "square" && residents.map((person, i) => {
            const pos = RESIDENT_POSITIONS[i % RESIDENT_POSITIONS.length];
            return <button key={person.actor} className="rv-resident" tabIndex={-1} type="button" aria-label={`Observer ${person.name}`} title={person.name}
              style={{ left: `${pos.x + Math.floor(i / RESIDENT_POSITIONS.length) * 2}%`, top: `${pos.y}%`, "--resident-color": person.color } as CSSProperties}
              onClick={() => { setSelectedActor(person.actor); setSelected(null); setShowResidents(true); }}><span /><strong>{person.name}</strong></button>;
          })}
        </div>}
      </div>
      <div className="rv-vignette" aria-hidden="true" />
      <header className="rv-header">
        <a ref={back} href={`${import.meta.env.BASE_URL}port/`} className="rv-back" aria-label="← Port de Porsa Rotas">← Port de Porsa Rotas</a>
        <div><span className="rv-eyebrow">BLACKLACE · PROMENADE</span><h1 id="rotas-visit-title">{scene.title}</h1></div>
        <details className="rv-tools"><summary aria-label="Réglages de la promenade">☷</summary><div className="rv-atmosphere">
          {sceneId === "square" && depthReady && <button type="button" aria-pressed={depth} onClick={() => { resetLook(); setDepth(!depth); }}>Profondeur</button>}
          <button type="button" aria-pressed={night} onClick={() => setNight(!night)}>{night ? "☀ Jour" : "☾ Soir"}</button>
          <button type="button" aria-pressed={sound} onClick={() => void toggleSound()}>{sound ? "Son activé" : "Activer le son"}</button>
        </div></details>
      </header>
      {(imageLoading || imageError) && <p className="rv-image-status" role="status">{imageError ? "Le décor n’a pas pu être chargé. Les étapes restent accessibles dans « Chemins »." : "Ouverture du passage…"}</p>}
      <div className="rv-camera" aria-label="Commandes de la vue"><button type="button" aria-label="Zoom avant" disabled={camera.zoom >= 2.5} onClick={() => zoom(.25)}>+</button><output aria-label="Niveau de zoom">{Math.round(camera.zoom * 100)} %</output><button type="button" aria-label="Zoom arrière" disabled={camera.zoom <= 1} onClick={() => zoom(-.25)}>−</button><button type="button" aria-label="Recentrer la vue" onClick={reset}>⌖</button></div>
      {(selected || showResidents) && <aside className="rv-note" aria-label={selected ? "Détail du lieu" : "Habitants de Rotas"}>
        <button className="rv-note-close" type="button" aria-label="Fermer le détail" onClick={() => { setSelected(null); setSelectedActor(null); setShowResidents(false); }}>×</button>
        {selected ? <><span className="rv-eyebrow">PRENDRE LE TEMPS D’OBSERVER</span><h2>{selected.label}</h2><p>{selected.description}</p></> : <>
          <span className="rv-eyebrow">PRÉSENCES SHERLOCK · PLACE DE ROTAS</span><h2>{resident?.name ?? "Les habitants"}</h2>
          {resident ? <><p>{resident.activity ? `Activité : ${resident.activity}` : "Aucune activité précisée dans le signal reçu."}</p>{resident.intention && <p>Intention : {resident.intention}</p>}{resident.lastEvent && <p>{resident.lastEvent}</p>}</> : <p>{residents.length ? "Choisissez un habitant pour lire son activité reçue de Sherlock." : "Aucune présence reçue pour Rotas actuellement."}</p>}
          <div className="rv-resident-list">{residents.map(person => <button key={person.actor} type="button" aria-pressed={person.actor === selectedActor} onClick={() => setSelectedActor(person.actor)}>{person.name}</button>)}</div>
        </>}
      </aside>}
      <footer className="rv-footer">
        <details className="rv-paths">
          <summary>⌁ Chemins</summary>
          <nav className="rv-stops" aria-label="Étapes de la promenade">{SCENE_IDS.map(id => <button key={id} type="button" aria-current={sceneId === id ? "location" : undefined} onClick={event => { go(id); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{id === "square" ? "La place" : id === "tea" ? "Salon de thé" : id === "market" ? "Marché" : id === "stairs" ? "Escaliers" : id === "coast" ? "La côte" : "Boutiques"}</button>)}</nav>
        </details>
        <button className="rv-people" type="button" onClick={() => { setShowResidents(!showResidents); setSelected(null); setSelectedActor(null); }}>Habitants · {residents.length}</button>
      </footer>
    </section>
  );
}
