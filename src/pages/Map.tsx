import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { BackgroundLayers } from "@/blacklace/Layers";
import RotasPlaza from "@/components/world/RotasPlaza";
import "@/styles/rotas.css";

const HOTSPOTS = [
  { id: "port", label: "Port Porsa Rotas", status: "stable", x: 22, y: 72, color: "#3b82f6" },
  { id: "rotas", label: "Village de Rotas", status: "stable", x: 35, y: 52, color: "#22c55e" },
  { id: "max", label: "Max Liberty", status: "stable", x: 62, y: 82, color: "#ff003c" },
  { id: "ludmila", label: "Club Ludmila", status: "signal faible", x: 56, y: 65, color: "#ec4899" },
  { id: "sator", label: "Clairière SATOR", status: "instable", x: 73, y: 40, color: "#a855f7" },
  { id: "institute", label: "Feuch Institute", status: "instable", x: 48, y: 35, color: "#ff7a00" },
  { id: "fournaise", label: "Fournaise de Feuch", status: "fermé", x: 52, y: 22, color: "#ff7a00" },
  { id: "reboot", label: "Cascade Reboot", status: "signal faible", x: 78, y: 58, color: "#00e5ff" },
  { id: "observatoire", label: "Observatoire", status: "fermé", x: 42, y: 76, color: "#00e5ff" },
];

const HOLOWALL_LABELS = ["ROTAS", "SATOR", "FEUCH", "ALOISIA", "SIGNAL", "BRUME"];

type Weather = "clear" | "rain" | "storm" | "fog";
type Time = "dawn" | "day" | "dusk" | "night";
type MapView = "map" | "zooming-rotas" | "rotas";

const Map = () => {
  const [imgOk, setImgOk] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [view, setView] = useState<MapView>("map");
  const [weather, setWeather] = useState<Weather>("clear");
  const [time, setTime] = useState<Time>("day");
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
    const wOrder: Weather[] = ["clear", "fog", "rain", "clear"];
    const tOrder: Time[] = ["day", "dusk", "night", "dawn"];
    let wi = 0;
    let ti = 0;
    const wt = setInterval(() => {
      wi = (wi + 1) % wOrder.length;
      setWeather(wOrder[wi]);
    }, 24000);
    const tt = setInterval(() => {
      ti = (ti + 1) % tOrder.length;
      setTime(tOrder[ti]);
    }, 30000);
    return () => {
      clearInterval(wt);
      clearInterval(tt);
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

  const drops = useMemo(() => Array.from({ length: 90 }), []);
  const clouds = useMemo(() => Array.from({ length: 6 }), []);
  const birds = useMemo(() => Array.from({ length: 4 }), []);
  const boats = useMemo(() => Array.from({ length: 3 }), []);
  const tiles = useMemo(() => Array.from({ length: 24 }), []);
  const stars = useMemo(() => Array.from({ length: 60 }), []);
  const activeZone = HOTSPOTS.find(h => h.id === active);

  return (
    <>
      <BackgroundLayers />
      <main className={`map-page map-page--full ${view === "zooming-rotas" ? "map-entering-rotas" : ""}`}>
        <header className="map-topbar">
          <Link className="bl-brand" to="/">
            <span className="bl-brand-eye">◉</span>
            <span>BLACKLACE</span>
          </Link>
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
              </div>

              <div className="i3d-layer i3d-weather">
                {(weather === "rain" || weather === "storm") && drops.map((_, i) => (
                  <span key={i} className="i3d-drop" style={{
                    left: `${(i * 37) % 100}%`,
                    animationDuration: `${0.5 + Math.random() * 0.6}s`,
                    animationDelay: `${-Math.random() * 2}s`,
                  }} />
                ))}
                {weather === "storm" && <span className="i3d-lightning" />}
                {weather === "fog" && <span className="i3d-fog" />}
              </div>

              <div className="i3d-shadow" />
            </div>

            <div className="i3d-tint" aria-hidden />
          </div>

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
        <RotasPlaza entering={view === "zooming-rotas"} onBack={backToMap} />
      )}
    </>
  );
};

export default Map;
