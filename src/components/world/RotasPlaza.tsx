type Props = { entering: boolean; onBack: () => void };

const ROTAS_SPOTS = [
  { label: "Port Porsa Rotas", x: 22, y: 72, note: "arrivée, pontons et première brume" },
  { label: "Village de Rotas", x: 35, y: 52, note: "place centrale et rues visitables" },
  { label: "Feuch Institute", x: 48, y: 35, note: "bibliothèque-ruche, prototypes et liens propres" },
  { label: "Auberge Arepo", x: 43, y: 46, note: "chambres, rumeurs et thé trop lucide" },
  { label: "Marché", x: 34, y: 62, note: "échoppes, fruits bleus, fausses cartes" },
  { label: "Opéra", x: 56, y: 65, note: "club, basse et perceptions tordues" },
];

export default function RotasPlaza({ entering, onBack }: Props) {
  return (
    <section className={entering ? "rotas-plaza is-entering" : "rotas-plaza is-ready"}>
      <div className="rotas-space" />
      <div className="rotas-glow" />

      <div className="rotas-ui rotas-title">
        <span>FEUCH INSTITUTE // ZONE TESTABLE</span>
        <strong>Rotas</strong>
        <small>Plateau flottant image — v0.2</small>
      </div>

      <button className="rotas-back" onClick={onBack}>Retour carte</button>

      <div className="rotas-board-shell" aria-label="Plateau flottant de Rotas">
        <div className="rotas-board-shadow" />
        <div className="rotas-board">
          <img
            className="rotas-board-img"
            src={`${import.meta.env.BASE_URL}assets/img/island-cutout.png`}
            alt="Rotas sur Blacklace Island"
            draggable={false}
          />
          <div className="rotas-board-vignette" />
          <div className="rotas-board-scan" />

          {ROTAS_SPOTS.map((spot) => (
            <button
              key={spot.label}
              className="rotas-hotspot rotas-hotspot--image"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              type="button"
              title={spot.note}
            >
              <span />
              {spot.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rotas-ui rotas-sound">
        <span>AMBIANCE</span>
        <div><b /><b /><b /><b /><b /></div>
        <small>image réelle du site, overlay visitable, gobelin sobre</small>
      </div>

      <p className="rotas-tip">Rotas utilise maintenant l’image de l’île comme plateau flottant. C’est testable sans gros fichier fragile.</p>
    </section>
  );
}
