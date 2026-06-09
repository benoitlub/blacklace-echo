import { useMemo, useState } from "react";
import { ROTAS_BOARD_IMAGE } from "@/assets/rotasBoardImage";

type Props = { entering: boolean; onBack: () => void };
type RotasSpotId = "eye" | "tea" | "boutique" | "market" | "stalls" | "coast" | "fountain";

type RotasSpot = {
  id: RotasSpotId;
  label: string;
  kind: string;
  x: number;
  y: number;
  note: string;
  mood: string;
  detail: string;
};

const ROTAS_SPOTS: RotasSpot[] = [
  {
    id: "eye",
    label: "Maison de l’Œil",
    kind: "archives vivantes",
    x: 43,
    y: 24,
    note: "La grande porte du Feuch Institut local. Tout ce qui observe finit ici.",
    mood: "verre turquoise, cuivre patiné, silence qui prend des notes",
    detail: "Hall, terminal Aloisia, bibliothèque-ruche, registre des anomalies.",
  },
  {
    id: "tea",
    label: "Salon de thé",
    kind: "ruelle chaude",
    x: 25,
    y: 34,
    note: "Tables basses, thé trop lucide, plantes qui ont probablement un avis.",
    mood: "ombre douce, vapeur, conversations minuscules",
    detail: "Façade Tea, terrasse, première rencontre PNJ, menu des infusions absurdes.",
  },
  {
    id: "boutique",
    label: "Boutique",
    kind: "objets & jeux",
    x: 65,
    y: 42,
    note: "Vitrine Pro.Hibited, cartes, avatars et contrebande narrative homologuée à moitié.",
    mood: "enseigne dorée, rideaux rayés, néons discrets",
    detail: "Lien Pro.Hibited, objets à examiner, rayon avatars, posters Blacklace Dice.",
  },
  {
    id: "market",
    label: "Marché",
    kind: "place marchande",
    x: 27,
    y: 58,
    note: "Épices, fruits bleus, fausses cartes et rumeurs vendues sans garantie.",
    mood: "voix, tissus turquoise, paniers, odeur de mer",
    detail: "Stands, vendeurs, annonces du jour, mini-quêtes de collecte.",
  },
  {
    id: "stalls",
    label: "Échoppes",
    kind: "passages secondaires",
    x: 46,
    y: 68,
    note: "Des petites portes, des lanternes, des raccourcis et un chat fiscalement douteux.",
    mood: "ruelle étroite, pierres claires, secrets dans les angles",
    detail: "Ruelles verticales, escaliers, portes fermées, indices SATOR.",
  },
  {
    id: "coast",
    label: "Accès côte",
    kind: "sortie vers la mer",
    x: 53,
    y: 85,
    note: "Escaliers vers le ponton, embruns, mouettes et promesses de départ.",
    mood: "lumière basse, eau turquoise, bois humide",
    detail: "Ponton, Port Porsa Rotas, transition vers la côte et la mangrove.",
  },
  {
    id: "fountain",
    label: "Fontaine centrale",
    kind: "carrefour",
    x: 47,
    y: 48,
    note: "Le cœur de la place. Les chemins tournent autour comme s’ils hésitaient.",
    mood: "mosaïque spirale, eau claire, bancs et murmures",
    detail: "Point de spawn, journal de lieu, choix des directions.",
  },
];

export default function RotasPlaza({ entering, onBack }: Props) {
  const [selectedSpot, setSelectedSpot] = useState<RotasSpot | null>(null);
  const sparks = useMemo(() => Array.from({ length: 18 }), []);
  const birds = useMemo(() => Array.from({ length: 5 }), []);

  return (
    <section className={entering ? "rotas-plaza is-entering" : "rotas-plaza is-ready"}>
      <div className="rotas-space" />
      <div className="rotas-glow" />
      <div className="rotas-stars" aria-hidden>
        {sparks.map((_, i) => <span key={i} style={{ left: `${8 + (i * 19) % 86}%`, top: `${12 + (i * 31) % 70}%`, animationDelay: `${i * .18}s` }} />)}
      </div>
      <div className="rotas-birds" aria-hidden>
        {birds.map((_, i) => <span key={i} style={{ top: `${16 + i * 9}%`, animationDelay: `${-i * 4}s`, animationDuration: `${24 + i * 5}s` }}>⌁</span>)}
      </div>

      <div className="rotas-ui rotas-title">
        <span>FEUCH INSTITUTE // ZONE TESTABLE</span>
        <strong>Rotas</strong>
        <small>Plateau rues & chemins — v0.4</small>
      </div>

      <button className="rotas-back" onClick={onBack}>Retour carte</button>

      <div className="rotas-board-shell rotas-board-shell--streets" aria-label="Plateau flottant de Rotas">
        <div className="rotas-board-shadow" />
        <div className="rotas-board rotas-board--streets">
          <img
            className="rotas-board-img"
            src={ROTAS_BOARD_IMAGE}
            alt="Carte des rues de Rotas"
            draggable={false}
          />
          <div className="rotas-board-vignette" />
          <div className="rotas-board-scan" />
          <div className="rotas-board-route route-a" />
          <div className="rotas-board-route route-b" />
          <div className="rotas-board-route route-c" />

          {ROTAS_SPOTS.map((spot) => (
            <button
              key={spot.id}
              className={`rotas-hotspot rotas-hotspot--image ${selectedSpot?.id === spot.id ? "is-selected" : ""}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              type="button"
              title={spot.note}
              onClick={() => setSelectedSpot(spot)}
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
        <small>rues, marché, fontaine, brume administrative</small>
      </div>

      <aside className={`rotas-street-panel ${selectedSpot ? "is-open" : ""}`} aria-live="polite">
        {selectedSpot ? (
          <>
            <button className="rotas-panel-close" onClick={() => setSelectedSpot(null)}>×</button>
            <span className="section-kicker">VUE DE RUE À HABILLER</span>
            <h2>{selectedSpot.label}</h2>
            <p className="rotas-kind">{selectedSpot.kind}</p>
            <div className={`rotas-street-preview street-${selectedSpot.id}`}>
              <span className="street-lamp l1" />
              <span className="street-lamp l2" />
              <span className="street-door" />
              <span className="street-sign">{selectedSpot.label}</span>
              <span className="street-path" />
            </div>
            <p>{selectedSpot.note}</p>
            <small>{selectedSpot.mood}</small>
            <div className="rotas-build-list">
              <strong>Pièces d’habillage</strong>
              <span>{selectedSpot.detail}</span>
            </div>
            <button className="rotas-enter-street">Entrer bientôt</button>
          </>
        ) : (
          <>
            <span className="section-kicker">PROMENADE</span>
            <h2>Choisis une pastille</h2>
            <p>Chaque hotspot prépare une future vue verticale de rue : façade, ruelle, ambiance, PNJ et sortie retour place.</p>
          </>
        )}
      </aside>

      <p className="rotas-tip">Prototype hybride : le plateau utilise maintenant la carte Rotas “Rues et chemins”.</p>
    </section>
  );
}
