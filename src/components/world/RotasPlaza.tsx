type RotasPlazaProps = {
  entering: boolean;
  onBack: () => void;
};

const plazaHotspots = [
  { id: "tea", label: "Salon de thé", x: 22, y: 52 },
  { id: "eye", label: "Maison de l’Œil", x: 49, y: 36 },
  { id: "boutique", label: "Boutique", x: 74, y: 52 },
  { id: "fountain", label: "Fontaine", x: 51, y: 61 },
  { id: "market", label: "Marché", x: 39, y: 70 },
];

const RotasPlaza = ({ entering, onBack }: RotasPlazaProps) => {
  return (
    <section className={`rotas-plaza ${entering ? "is-entering" : "is-ready"}`} aria-label="Place de Rotas">
      <div className="rotas-sky" />
      <div className="rotas-sea" />
      <div className="rotas-haze" />

      <div className="rotas-world">
        <div className="rotas-backdrop rotas-backdrop-left" />
        <div className="rotas-backdrop rotas-backdrop-right" />

        <div className="rotas-building tea-house">
          <span className="rotas-dome" />
          <span className="rotas-sign">TEA</span>
          <span className="rotas-door" />
          <span className="rotas-awning" />
        </div>

        <div className="rotas-building eye-house">
          <span className="rotas-dome main" />
          <span className="rotas-eye">◉</span>
          <span className="rotas-door large" />
          <span className="rotas-vines" />
        </div>

        <div className="rotas-building boutique-house">
          <span className="rotas-dome" />
          <span className="rotas-sign">BOUTIQUE</span>
          <span className="rotas-door" />
          <span className="rotas-awning stripe" />
        </div>

        <div className="rotas-plaza-floor">
          <span className="rotas-ring r1" />
          <span className="rotas-ring r2" />
          <span className="rotas-swirl s1" />
          <span className="rotas-swirl s2" />
        </div>

        <div className="rotas-fountain">
          <span />
        </div>

        <div className="rotas-stall stall-a" />
        <div className="rotas-stall stall-b" />
        <div className="rotas-palm palm-a" />
        <div className="rotas-palm palm-b" />
        <div className="rotas-player" title="Explorateur" />

        {plazaHotspots.map((h) => (
          <button
            className="rotas-hotspot"
            key={h.id}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            onClick={() => window.dispatchEvent(new CustomEvent("blacklace:rotas-hotspot", { detail: h.id }))}
          >
            <span />
            {h.label}
          </button>
        ))}
      </div>

      <div className="rotas-ui rotas-title">
        <span>ZONE STABLE</span>
        <strong>Place de Rotas</strong>
        <small>Le signal se précise : mer, marché, voix lointaines.</small>
      </div>

      <div className="rotas-ui rotas-sound">
        <span>AMBIANCE</span>
        <div><b /> <b /> <b /> <b /> <b /></div>
        <small>vent & mer → marché → fontaine</small>
      </div>

      <button className="rotas-back" onClick={onBack}>← Retour carte</button>
      <div className="rotas-tip">Explore la place • clique les points lumineux</div>
    </section>
  );
};

export default RotasPlaza;
