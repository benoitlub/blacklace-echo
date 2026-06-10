import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import TransparentAsset from "./TransparentAsset";

type Props = { entering: boolean; onBack: () => void };
type RotasSpotId = "eye" | "tea" | "prohibited" | "market" | "stalls" | "coast" | "fountain";

type RotasSpot = {
  id: RotasSpotId;
  label: string;
  kind: string;
  x: number;
  y: number;
  w: number;
  z: number;
  depth: number;
  asset?: string;
  note: string;
  mood: string;
  detail: string;
};

const asset = (name: string) => `${import.meta.env.BASE_URL}assets/img/${name}`;
const ROTAS_EMPTY_PLATEAU = asset("file_00000000d6a871f499f027123cd0f875.png");

const ROTAS_SPOTS: RotasSpot[] = [
  { id: "eye", label: "Maison de l’Œil", kind: "archives vivantes", x: 50, y: 27, w: 27, z: 7, depth: 1.08, asset: asset("file_0000000081b0720ab104c27def46b870.png"), note: "La grande porte du Feuch Institut local. Tout ce qui observe finit ici.", mood: "verre turquoise, cuivre patiné, silence qui prend des notes", detail: "Hall, terminal Aloisia, bibliothèque-ruche, registre des anomalies." },
  { id: "tea", label: "Salon de thé", kind: "ruelle chaude", x: 30, y: 46, w: 15, z: 6, depth: .8, asset: asset("file_000000006c98720a9bf32582800c86c3.png"), note: "Tables basses, thé trop lucide, plantes qui ont probablement un avis.", mood: "ombre douce, vapeur, conversations minuscules", detail: "Façade Tea, terrasse, première rencontre PNJ, menu des infusions absurdes." },
  { id: "prohibited", label: "Pro.Hibited", kind: "boutique de Natasha", x: 70, y: 47, w: 15, z: 6, depth: .8, asset: asset("file_00000000b9d071f49659651dc56b7ad9.png"), note: "La boutique Pro.Hibited de Natasha : cartes, objets interdits à moitié, avatars et souvenirs qui refusent d’être seulement des souvenirs.", mood: "enseigne dorée, rideaux turquoise, vitrines fumées, rire bleu derrière le comptoir", detail: "Cartes Pro.Hibited, objets à examiner, avatars, posters Blacklace Dice, accès vers le loft de Natasha." },
  { id: "market", label: "Marché", kind: "place marchande", x: 41, y: 63, w: 13, z: 8, depth: 1.2, asset: asset("file_000000002ed471f4872072e0f90a5861.png"), note: "Épices, fruits bleus, fausses cartes et rumeurs vendues sans garantie.", mood: "voix, tissus turquoise, paniers, odeur de mer", detail: "Stands, vendeurs, annonces du jour, mini-quêtes de collecte." },
  { id: "stalls", label: "Échoppes", kind: "passages secondaires", x: 59, y: 63, w: 13, z: 8, depth: 1.2, asset: asset("file_00000000278871f49834d39d1e42d50f.png"), note: "Des petites portes, des lanternes, des raccourcis et un chat fiscalement douteux.", mood: "ruelle étroite, pierres claires, secrets dans les angles", detail: "Ruelles verticales, escaliers, portes fermées, indices SATOR." },
  { id: "coast", label: "Accès côte", kind: "sortie vers la mer", x: 50, y: 86, w: 10, z: 9, depth: 1.45, note: "Escaliers vers le ponton, embruns, mouettes et promesses de départ.", mood: "lumière basse, eau turquoise, bois humide", detail: "Ponton, Port Porsa Rotas, transition vers la côte et la mangrove." },
  { id: "fountain", label: "Fontaine centrale", kind: "carrefour", x: 50, y: 53, w: 11, z: 5, depth: .55, note: "Le cœur de la place. Les chemins tournent autour comme s’ils hésitaient.", mood: "mosaïque spirale, eau claire, bancs et murmures", detail: "Point de spawn, journal de lieu, choix des directions." },
];

const ROTAS_LANTERNS = [
  { x: 43, y: 31 }, { x: 57, y: 31 }, { x: 23, y: 46 }, { x: 77, y: 46 },
  { x: 31, y: 65 }, { x: 69, y: 65 }, { x: 39, y: 80 }, { x: 61, y: 80 },
  { x: 50, y: 90 }, { x: 18, y: 58 }, { x: 82, y: 58 },
];

export default function RotasPlaza({ entering, onBack }: Props) {
  const [selectedSpot, setSelectedSpot] = useState<RotasSpot | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const sparks = useMemo(() => Array.from({ length: 18 }), []);
  const birds = useMemo(() => Array.from({ length: 5 }), []);
  const motes = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ left: 15 + ((i * 17) % 72), top: 22 + ((i * 29) % 58), delay: -(i * .43), duration: 5.5 + (i % 6) * .6 })), []);

  const updateTilt = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
  };

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
        <small>Calques alignés — v1.0</small>
      </div>

      <button className="rotas-back" onClick={onBack}>Retour carte</button>

      <div
        className="rotas-board-shell rotas-board-shell--aligned"
        aria-label="Plateau flottant de Rotas"
        style={{ "--rx": tilt.x, "--ry": tilt.y } as CSSProperties}
        onPointerMove={(event) => updateTilt(event.clientX, event.clientY, event.currentTarget)}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div className="rotas-board-shadow" />
        <div className="rotas-board rotas-board--aligned">
          <img className="rotas-layer rotas-layer--aligned-base" src={ROTAS_EMPTY_PLATEAU} alt="Plateau vide de Rotas" draggable={false} />
          <div className="rotas-water-shimmer" aria-hidden><span /><span /><span /></div>
          <div className="rotas-depth-haze" aria-hidden />
          <div className="rotas-fountain-aura" aria-hidden><span /><span /><span /></div>
          <div className="rotas-lanterns" aria-hidden>
            {ROTAS_LANTERNS.map((lamp, i) => <span key={i} style={{ left: `${lamp.x}%`, top: `${lamp.y}%`, animationDelay: `${-i * .31}s` }} />)}
          </div>
          <div className="rotas-life-motes" aria-hidden>
            {motes.map((mote, i) => <span key={i} style={{ left: `${mote.left}%`, top: `${mote.top}%`, animationDelay: `${mote.delay}s`, animationDuration: `${mote.duration}s` }} />)}
          </div>

          {ROTAS_SPOTS.map((spot) => (
            <button
              key={spot.id}
              className={`rotas-aligned-layer rotas-aligned-layer--${spot.id} ${selectedSpot?.id === spot.id ? "is-selected" : ""}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, zIndex: spot.z, "--depth": spot.depth } as CSSProperties}
              type="button"
              title={spot.note}
              onClick={() => setSelectedSpot(spot)}
            >
              {spot.asset ? <TransparentAsset className="rotas-aligned-img" src={spot.asset} alt={spot.label} /> : <span className="rotas-ghost-hotspot" />}
              <strong>{spot.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <aside className={`rotas-street-panel ${selectedSpot ? "is-open" : ""}`} aria-live="polite">
        {selectedSpot ? (
          <>
            <button className="rotas-panel-close" onClick={() => setSelectedSpot(null)}>×</button>
            <span className="section-kicker">POINT D’INTÉRÊT</span>
            <h2>{selectedSpot.label}</h2>
            <p className="rotas-kind">{selectedSpot.kind}</p>
            <p>{selectedSpot.note}</p>
            <small>{selectedSpot.mood}</small>
            <div className="rotas-build-list"><strong>À brancher</strong><span>{selectedSpot.detail}</span></div>
            <button className="rotas-enter-street">Ouvrir la vue rue bientôt</button>
          </>
        ) : (
          <>
            <span className="section-kicker">PROMENADE</span>
            <h2>Rotas respire</h2>
            <p>Temple redressé, tentes avancées vers la fontaine, calques gardés pour le parallaxe et les futures vues de rue.</p>
          </>
        )}
      </aside>

      <p className="rotas-tip">Prototype vivant : calques redressés, tentes centrées, eau, lanternes et poussières.</p>
    </section>
  );
}
