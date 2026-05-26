import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { BackgroundLayers } from "@/blacklace/Layers";

const HOTSPOTS = [
  { id: "volcano", label: "Fournaise de Feuch", x: 52, y: 22, color: "#ff7a00" },
  { id: "sator", label: "Clairière SATOR", x: 73, y: 40, color: "#a855f7" },
  { id: "obs", label: "Observatoire", x: 84, y: 52, color: "#00e5ff" },
  { id: "rotas", label: "Village de Rotas", x: 35, y: 52, color: "#ec4899" },
  { id: "port", label: "Porsa Rotas", x: 22, y: 72, color: "#3b82f6" },
  { id: "aloisia", label: "Cœur d'Aloisia", x: 46, y: 78, color: "#7a00ff" },
  { id: "max", label: "Max Liberty", x: 62, y: 82, color: "#ff003c" },
];

// Walking characters along waypoints (% coords of the island)
const CHARS = [
  { name: "NATASHA", color: "#ec4899", path: [[35,52],[42,58],[46,70],[46,78],[55,75],[62,82]] },
  { name: "MAX",     color: "#ff003c", path: [[62,82],[55,75],[50,68],[52,55],[58,40],[52,28]] },
  { name: "SATO",    color: "#a855f7", path: [[73,40],[68,46],[60,50],[55,55],[48,58],[42,55]] },
  { name: "OBS-7",   color: "#00e5ff", path: [[84,52],[78,55],[72,58],[68,62],[60,66]] },
  { name: "ALOISIA", color: "#7a00ff", path: [[46,78],[40,72],[34,66],[28,72],[22,72]] },
  { name: "FEUCH",   color: "#ff7a00", path: [[52,22],[48,30],[44,38],[40,46],[36,52]] },
];

type Weather = "clear" | "rain" | "storm" | "fog";
type Time = "dawn" | "day" | "dusk" | "night";

const Map = () => {
  const [imgOk, setImgOk] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather>("clear");
  const [time, setTime] = useState<Time>("day");
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 3D parallax tilt
  useEffect(() => {
    const stage = stageRef.current; const scene = sceneRef.current;
    if (!stage || !scene) return;
    let rx = -16, ry = 0, trx = -16, try_ = 0, raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      try_ = px * 20; trx = -16 + py * -10;
    };
    const onLeave = () => { trx = -16; try_ = 0; };
    const loop = () => {
      rx += (trx - rx) * 0.08; ry += (try_ - ry) * 0.08;
      scene.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(loop);
    };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    loop();
    return () => { stage.removeEventListener("mousemove", onMove); stage.removeEventListener("mouseleave", onLeave); cancelAnimationFrame(raf); };
  }, []);

  // weather + day cycle
  useEffect(() => {
    const wOrder: Weather[] = ["clear", "rain", "storm", "fog"];
    const tOrder: Time[] = ["dawn", "day", "dusk", "night"];
    let wi = 0, ti = 1;
    const wt = setInterval(() => { wi = (wi + 1) % 4; setWeather(wOrder[wi]); }, 16000);
    const tt = setInterval(() => { ti = (ti + 1) % 4; setTime(tOrder[ti]); }, 11000);
    return () => { clearInterval(wt); clearInterval(tt); };
  }, []);

  // Walking characters loop
  useEffect(() => {
    const island = islandRef.current; if (!island) return;
    let raf = 0; const start = performance.now();
    const SPEEDS = CHARS.map((_, i) => 22000 + i * 3500); // ms per loop
    const step = (now: number) => {
      const elapsed = now - start;
      CHARS.forEach((c, i) => {
        const el = charRefs.current[i]; if (!el) return;
        const dur = SPEEDS[i];
        const t = ((elapsed % dur) / dur) * c.path.length;
        const idx = Math.floor(t); const frac = t - idx;
        const a = c.path[idx % c.path.length];
        const b = c.path[(idx + 1) % c.path.length];
        const x = a[0] + (b[0] - a[0]) * frac;
        const y = a[1] + (b[1] - a[1]) * frac;
        const dir = b[0] - a[0] >= 0 ? 1 : -1;
        el.style.left = x + "%"; el.style.top = y + "%";
        el.style.setProperty("--dir", String(dir));
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const drops = useMemo(() => Array.from({ length: 90 }), []);
  const clouds = useMemo(() => Array.from({ length: 6 }), []);
  const birds = useMemo(() => Array.from({ length: 4 }), []);
  const boats = useMemo(() => Array.from({ length: 3 }), []);
  const tiles = useMemo(() => Array.from({ length: 24 }), []);
  const stars = useMemo(() => Array.from({ length: 60 }), []);

  return (
    <>
      <BackgroundLayers />
      <main className="map-page map-page--full">
        <header className="map-topbar">
          <Link className="bl-brand" to="/"><span className="bl-brand-eye">◉</span><span>BLACKLACE</span></Link>
          <div className="map-weather-tabs">
            {(["dawn","day","dusk","night"] as Time[]).map(w => (
              <button key={w} className={`bl-pill ${time === w ? "is-on" : ""}`} onClick={() => setTime(w)}>{w.toUpperCase()}</button>
            ))}
            <span className="map-sep" />
            {(["clear", "rain", "storm", "fog"] as Weather[]).map(w => (
              <button key={w} className={`bl-pill ${weather === w ? "is-on" : ""}`} onClick={() => setWeather(w)}>{w.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="bl-pill" to="/aloisia">ALOISIA</Link>
            <Link className="bl-pill" to="/">LIVE</Link>
          </div>
        </header>

        <section className="holo-map-stage holo-map-stage--bare">
          <div className="map-title-block">
            <p className="section-kicker">HOLOGRAPHIC MAP — LIVE</p>
            <h1>Blacklace Island</h1>
            <p>Mur d'écrans holographique. Cycle jour/nuit, météo dynamique, vie en mouvement.</p>
          </div>

          <div className={`island3d-stage time-${time} weather-${weather}`} ref={stageRef}>
            {/* Holographic video wall background */}
            <div className="holowall" aria-hidden>
              {tiles.map((_, i) => (
                <div key={i} className={`holowall-tile tile-${i % 6}`} style={{ animationDelay: `${(i * 0.37) % 4}s` }}>
                  <span className="hw-name">{["NATASHA","MAX","SATO","ALOISIA","FEUCH","OBS-7"][i % 6]}</span>
                  <span className="hw-scan" />
                  <span className="hw-glitch" />
                </div>
              ))}
              <div className="holowall-vignette" />
            </div>

            {/* Night stars */}
            <div className="i3d-stars" aria-hidden>
              {stars.map((_, i) => (
                <span key={i} style={{ left: `${(i*17)%100}%`, top: `${(i*29)%70}%`, animationDelay: `${(i%9)*0.4}s` }} />
              ))}
            </div>

            <div className="island3d-scene" ref={sceneRef}>
              {/* sky layer */}
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

              {/* island image (cutout, no frame) */}
              <div className="i3d-layer i3d-island" ref={islandRef}>
                {imgOk ? (
                  <img
                    src="public/assets/img/island-cutout.png"
                    alt="Blacklace Island"
                    onError={() => setImgOk(false)}
                    draggable={false}
                  />
                ) : (
                  <div className="i3d-placeholder">CARTE EN ATTENTE</div>
                )}

                {/* volcano effects */}
                <div className="i3d-volcano">
                  <span className="i3d-smoke" />
                  <span className="i3d-smoke s2" />
                  <span className="i3d-smoke s3" />
                  <span className="i3d-ember" />
                  <span className="i3d-ember e2" />
                  <span className="i3d-ember e3" />
                </div>

                {/* boats */}
                {boats.map((_, i) => (
                  <span key={i} className="i3d-boat" style={{
                    top: `${60 + i * 9}%`,
                    animationDuration: `${50 + i * 12}s`,
                    animationDelay: `${-i * 14}s`,
                  }}>⛵</span>
                ))}

                {/* walking characters */}
                {CHARS.map((c, i) => (
                  <div
                    key={c.name}
                    ref={(el) => (charRefs.current[i] = el)}
                    className="i3d-char"
                    style={{ ["--c" as any]: c.color }}
                  >
                    <span className="i3d-char-dot" />
                    <span className="i3d-char-trail" />
                    <span className="i3d-char-name">{c.name}</span>
                  </div>
                ))}

                {/* hotspots */}
                {HOTSPOTS.map(h => (
                  <button
                    key={h.id}
                    className={`i3d-hotspot ${active === h.id ? "is-on" : ""}`}
                    style={{ left: `${h.x}%`, top: `${h.y}%`, ["--c" as any]: h.color }}
                    onClick={() => setActive(active === h.id ? null : h.id)}
                    title={h.label}
                  >
                    <span className="i3d-pulse" />
                    <span className="i3d-pin" />
                    <span className="i3d-label">{h.label}</span>
                  </button>
                ))}
              </div>

              {/* weather overlay */}
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

              {/* base shadow */}
              <div className="i3d-shadow" />
            </div>

            {/* Time-of-day tint overlay (above everything) */}
            <div className="i3d-tint" aria-hidden />
          </div>

          {active && (
            <div className="i3d-info">
              <span className="section-kicker">ZONE</span>
              <h3>{HOTSPOTS.find(h => h.id === active)?.label}</h3>
              <button className="bl-pill" onClick={() => setActive(null)}>FERMER</button>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Map;
