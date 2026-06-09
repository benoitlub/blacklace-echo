type Props = { entering: boolean; onBack: () => void };

const ROTAS_SPOTS = [
  { label: "Auberge Arepo", x: 50, y: 36, note: "chambres, rumeurs et thé trop lucide" },
  { label: "Marché de Rotas", x: 34, y: 62, note: "échoppes, fruits bleus, fausses cartes" },
  { label: "Mairie", x: 66, y: 60, note: "tampons, archives et sourires suspects" },
  { label: "Salon de thé", x: 22, y: 44, note: "premiers dialogues avec la brume" },
  { label: "Boutique Pro.Hibited", x: 78, y: 45, note: "jeux, affiches, contrebande narrative" },
];

export default function RotasPlaza({ entering, onBack }: Props) {
  return (
    <section className={entering ? "rotas-plaza is-entering" : "rotas-plaza is-ready"}>
      <div className="rotas-sky" />
      <div className="rotas-sea" />
      <div className="rotas-haze" />

      <div className="rotas-ui rotas-title">
        <span>ZONE TESTABLE</span>
        <strong>Rotas</strong>
        <small>Plateau flottant minimal — v0.1</small>
      </div>

      <button className="rotas-back" onClick={onBack}>Retour carte</button>

      <div className="rotas-world" aria-label="Plateau flottant de Rotas">
        <div className="rotas-plaza-floor">
          <span className="rotas-ring" />
          <span className="rotas-ring r2" />
          <span className="rotas-swirl s1" />
          <span className="rotas-swirl s2" />
        </div>

        <div className="rotas-backdrop rotas-backdrop-left" />
        <div className="rotas-backdrop rotas-backdrop-right" />

        <div className="rotas-building tea-house">
          <span className="rotas-dome" />
          <span className="rotas-sign">SALON DE THÉ</span>
          <span className="rotas-awning" />
          <span className="rotas-door" />
        </div>

        <div className="rotas-building eye-house">
          <span className="rotas-dome main" />
          <span className="rotas-eye">◉</span>
          <span className="rotas-sign">AREPO</span>
          <span className="rotas-door large" />
          <span className="rotas-vines" />
        </div>

        <div className="rotas-building boutique-house">
          <span className="rotas-dome" />
          <span className="rotas-sign">PRO.HIBITED</span>
          <span className="rotas-awning stripe" />
          <span className="rotas-door" />
        </div>

        <span className="rotas-fountain"><span /></span>
        <span className="rotas-stall stall-a" />
        <span className="rotas-stall stall-b" />
        <span className="rotas-palm palm-a" />
        <span className="rotas-palm palm-b" />
        <span className="rotas-player" />

        {ROTAS_SPOTS.map((spot) => (
          <button
            key={spot.label}
            className="rotas-hotspot"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            type="button"
            title={spot.note}
          >
            <span />
            {spot.label}
          </button>
        ))}
      </div>

      <div className="rotas-ui rotas-sound">
        <span>AMBIANCE</span>
        <div><b /><b /><b /><b /><b /></div>
        <small>mer, marché, brume administrative</small>
      </div>

      <p className="rotas-tip">Clique les pastilles : première version légère, pas de mammouth fragile dans la valise.</p>
    </section>
  );
}
