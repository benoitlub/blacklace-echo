import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { BackgroundLayers } from "@/blacklace/Layers";

const HOTSPOTS = [
  { id: "volcano", label: "Fournaise de Feuch", x: 52, y: 18, color: "#ff7a00" },
  { id: "sator", label: "Clairière SATOR", x: 73, y: 36, color: "#a855f7" },
  { id: "obs", label: "Observatoire", x: 84, y: 52, color: "#00e5ff" },
  { id: "rotas", label: "Village de Rotas", x: 35, y: 50, color: "#ec4899" },
  { id: "port", label: "Porsa Rotas", x: 28, y: 70, color: "#3b82f6" },
  { id: "aloisia", label: "Cœur d'Aloisia", x: 46, y: 78, color: "#7a00ff" },
  { id: "max", label: "Max Liberty", x: 62, y: 82, color: "#ff003c" },
];

const Map = () => {
  const [imgOk, setImgOk] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [weather, setWeather] = useState<"rain" | "storm" | "clear" | "fog">("rain");
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  // 3D parallax tilt
  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;
    let rx = -18, ry = 0, trx = -18, try_ = 0;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      try_ = px * 18;
      trx = -18 + py * -10;
    };
    const onLeave = () => { trx = -18; try_ = 0; };
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
  }, []);

  // weather cycle
  useEffect(() => {
    const order: Array<typeof weather> = ["clear", "rain", "storm", "fog"];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % order.length;
      setWeather(order[i] as any);
    }, 14000);
    return () => clearInterval(t);
  }, []);

  // build rain drops once
  const drops = Array.from({ length: 90 });
  const clouds = Array.from({ length: 6 });
  const birds = Array.from({ length: 4 });
  const boats = Array.from({ length: 3 });

  return (
    <>
      <BackgroundLayers />
      <main className="map-page">
        <header className="map-topbar">
          <Link className="bl-brand" to="/"><span className="bl-brand-eye">◉</span><span>BLACKLACE</span></Link>
          <div className="map-weather-tabs">
            {(["clear", "rain", "storm", "fog"] as const).map(w => (
              <button key={w} className={`bl-pill ${weather === w ? "is-on" : ""}`} onClick={() => setWeather(w)}>{w.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="bl-pill" to="/aloisia">ALOISIA</Link>
            <Link className="bl-pill" to="/">LIVE</Link>
          </div>
        </header>

        <section className="holo-map-stage">
          <div className="map-title-block">
            <p className="section-kicker">HOLOGRAPHIC MAP — LIVE</p>
            <h1>Blacklace Island</h1>
            <p>Survole l'île pour incliner la perspective. Climat dynamique, vie en mouvement.</p>
          </div>

          <div className={`island3d-stage weather-${weather}`} ref={stageRef}>
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

              {/* island image */}
              <div className="i3d-layer i3d-island">
                {imgOk ? (
                  <img
                    src="/assets/img/island-map.png"
                    alt="Blacklace Island"
                    onError={() => setImgOk(false)}
                    draggable={false}
                  />
                ) : (
                  <div className="i3d-placeholder">CARTE EN ATTENTE</div>
                )}
                {/* volcano effects anchored on top */}
                <div className="i3d-volcano">
                  <span className="i3d-smoke" />
                  <span className="i3d-smoke s2" />
                  <span className="i3d-smoke s3" />
                  <span className="i3d-ember" />
                  <span className="i3d-ember e2" />
                  <span className="i3d-ember e3" />
                </div>

                {/* boats moving in the sea */}
                {boats.map((_, i) => (
                  <span key={i} className="i3d-boat" style={{
                    top: `${60 + i * 9}%`,
                    animationDuration: `${50 + i * 12}s`,
                    animationDelay: `${-i * 14}s`,
                  }}>⛵</span>
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

              {/* weather overlay layer (in front) */}
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
