import { Link } from "react-router-dom";
import { useState } from "react";
import { BackgroundLayers } from "@/blacklace/Layers";

const Map = () => {
  const [imgOk, setImgOk] = useState(true);
  return (
    <>
      <BackgroundLayers />
      <main className="map-page">
        <header className="map-topbar">
          <Link className="bl-brand" to="/"><span className="bl-brand-eye">◉</span><span>BLACKLACE</span></Link>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="bl-pill" to="/aloisia">ALOISIA</Link>
            <Link className="bl-pill" to="/">LIVE ACCESS</Link>
          </div>
        </header>

        <section className="holo-map-stage">
          <div className="map-title-block">
            <p className="section-kicker">HOLOGRAPHIC MAP</p>
            <h1>Blacklace Island</h1>
            <p>Carte locale de l'île. Les points deviendront les accès vivants de Blacklace.</p>
          </div>
          <div className="map-core">
            {imgOk ? (
              <img src="/assets/img/island-map.png" alt="Carte de Blacklace Island" onError={() => setImgOk(false)} />
            ) : (
              <div style={{ display: "grid", placeContent: "center", minHeight: 320, color: "rgba(255,255,255,.5)", fontFamily: "var(--font-display)", letterSpacing: ".18em", fontSize: 12, textAlign: "center", padding: 24 }}>
                CARTE EN ATTENTE<br /><br />
                <small style={{ opacity: 0.7 }}>place /public/assets/img/island-map.png</small>
              </div>
            )}
            <button className="hotspot rotas" title="Rotas Village"><span>Rotas</span></button>
            <button className="hotspot feuch" title="Fournaise de Feuch"><span>Feuch</span></button>
            <button className="hotspot port" title="Porsa Rotas"><span>Port</span></button>
            <button className="hotspot aloisia-spot" title="Aloisia Core"><span>Aloisia</span></button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Map;
