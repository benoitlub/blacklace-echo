import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { ROTAS_BOARD_IMAGE } from "@/assets/rotasBoardImage";
import TransparentAsset from "./TransparentAsset";

type RotasResident = { actor: string; name: string; color: string; activity?: string; intention?: string; lastEvent?: string };
type Props = { entering: boolean; onBack: () => void; residents?: RotasResident[] };
type RotasSpotId = "eye" | "tea" | "prohibited" | "market" | "stalls" | "coast" | "fountain";
type RotasDepth = "district" | "place";

type RotasSpot = {
  id: RotasSpotId;
  label: string;
  kind: string;
  x: number;
  y: number;
  note: string;
  mood: string;
  detail: string;
  depth?: RotasDepth;
};

const ROTAS_SPOTS: RotasSpot[] = [
  { id: "eye", label: "Maison de l’Œil", kind: "archives vivantes", x: 50, y: 21, note: "La grande porte du Feuch Institut local. Tout ce qui observe finit ici.", mood: "verre turquoise, cuivre patiné, silence qui prend des notes", detail: "Hall, terminal Aloisia, bibliothèque-ruche, registre des anomalies." },
  { id: "tea", label: "Salon de thé", kind: "ruelle chaude", x: 26, y: 36, note: "Tables basses, thé trop lucide, plantes qui ont probablement un avis.", mood: "ombre douce, vapeur, conversations minuscules", detail: "Façade Tea, terrasse, première rencontre PNJ, menu des infusions absurdes." },
  { id: "prohibited", label: "Pro.Hibited", kind: "boutique de Natasha", x: 75, y: 38, note: "La boutique Pro.Hibited de Natasha : cartes, objets interdits à moitié, avatars et souvenirs qui refusent d’être seulement des souvenirs.", mood: "enseigne dorée, rideaux turquoise, vitrines fumées, rire bleu derrière le comptoir", detail: "Cartes Pro.Hibited, objets à examiner, avatars, posters Blacklace Dice, accès vers le loft de Natasha." },
  { id: "market", label: "Marché", kind: "place marchande", x: 33, y: 58, note: "Épices, fruits bleus, fausses cartes et rumeurs vendues sans garantie.", mood: "voix, tissus turquoise, paniers, odeur de mer", detail: "Stands, vendeurs, annonces du jour, mini-quêtes de collecte." },
  { id: "stalls", label: "Échoppes", kind: "passages secondaires", x: 60, y: 58, note: "Des petites portes, des lanternes, des raccourcis et un chat fiscalement douteux.", mood: "ruelle étroite, pierres claires, secrets dans les angles", detail: "Ruelles verticales, escaliers, portes fermées, indices SATOR." },
  { id: "coast", label: "Accès côte", kind: "sortie vers la mer", x: 54, y: 82, note: "Escaliers vers le ponton, embruns, mouettes et promesses de départ.", mood: "lumière basse, eau turquoise, bois humide", detail: "Ponton, Port Porsa Rotas, transition vers la côte et la mangrove." },
  { id: "fountain", label: "Fontaine centrale", kind: "carrefour", x: 51, y: 48, note: "Le cœur de la place. Les chemins tournent autour comme s’ils hésitaient.", mood: "mosaïque spirale, eau claire, bancs et murmures", detail: "Point de spawn, journal de lieu, choix des directions." },
];

export default function RotasPlaza({ entering, onBack, residents = [] }: Props) {
  const [selectedSpot, setSelectedSpot] = useState<RotasSpot | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [depth, setDepth] = useState<RotasDepth>("district");
  const sparks = useMemo(() => Array.from({ length: 18 }), []);
  const birds = useMemo(() => Array.from({ length: 5 }), []);
  const residentPositions = useMemo(() => [
    { x: 48, y: 48, zone: "fontaine" }, { x: 38, y: 58, zone: "marché" },
    { x: 61, y: 58, zone: "échoppes" }, { x: 29, y: 43, zone: "salon de thé" },
    { x: 72, y: 44, zone: "Pro.Hibited" }, { x: 51, y: 34, zone: "Maison de l’Œil" },
    { x: 46, y: 68, zone: "place basse" }, { x: 57, y: 69, zone: "place basse" },
  ], []);

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

      <button className="rotas-back" onClick={() => { if (depth === "place") { setDepth("district"); setSelectedSpot(null); } else onBack(); }}>{depth === "place" ? "Retour Rotas" : "Retour carte"}</button>

      <div
        className="rotas-board-shell rotas-board-shell--final"
        aria-label="Plateau flottant final de Rotas"
        style={{ "--rx": tilt.x, "--ry": tilt.y } as CSSProperties}
        onPointerMove={(event) => updateTilt(event.clientX, event.clientY, event.currentTarget)}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div className="rotas-board-shadow" />
        <div className="rotas-board rotas-board--final">
          <TransparentAsset className="rotas-final-board-img" src={ROTAS_BOARD_IMAGE} alt="Plateau de Rotas" />
          <div className="rotas-final-glow" aria-hidden />
          <div className="rotas-vertical-village" aria-hidden>
            <div className="rotas-building rotas-building--tea"><span className="rotas-dome"/><i>SALON DE THÉ</i></div>
            <div className="rotas-building rotas-building--eye"><span className="rotas-dome rotas-dome--eye"/><i>MAISON DE L’ŒIL</i></div>
            <div className="rotas-building rotas-building--shop"><span className="rotas-dome"/><i>BOUTIQUE</i></div>
            <div className="rotas-stall rotas-stall--market"><span/><i>MARCHÉ</i></div>
            <div className="rotas-stall rotas-stall--east"><span/></div>
          </div>
          <div className="rotas-live-residents" aria-label={`${residents.length} habitants Sherlock présents à Rotas`}>
            {residents.map((resident, index) => {
              const pos = residentPositions[index % residentPositions.length];
              return (
                <button
                  key={resident.actor}
                  className="rotas-resident"
                  type="button"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, ["--resident-color" as string]: resident.color, ["--resident-delay" as string]: `${-(index * 0.63)}s` } as CSSProperties}
                  title={resident.lastEvent ?? resident.intention ?? resident.name}
                  onClick={() => setSelectedSpot(null)}
                >
                  <span className="rotas-resident-body"><i/><b/></span>
                  <strong>{resident.name}</strong>
                  <small>{resident.activity ? `${resident.activity} · ${pos.zone}` : pos.zone}</small>
                  <em>{resident.lastEvent ?? resident.intention ?? "Présence Sherlock confirmée"}</em>
                </button>
              );
            })}
          </div>
          {ROTAS_SPOTS.map((spot) => (
            <button
              key={spot.id}
              className={`rotas-final-hotspot rotas-final-hotspot--${spot.id} ${selectedSpot?.id === spot.id ? "is-selected" : ""} ${depth === "place" && selectedSpot?.id !== spot.id ? "is-dimmed" : ""}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              type="button"
              title={spot.note}
              onClick={() => { setSelectedSpot(spot); setDepth("place"); }}
            >
              <span />
              <strong>{spot.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <aside className={`rotas-street-panel ${selectedSpot ? "is-open" : ""}`} aria-live="polite">
        {selectedSpot ? (
          <>
            <button className="rotas-panel-close" onClick={() => setSelectedSpot(null)}>×</button>
            <span className="section-kicker">{depth === "place" ? "ZOOM · LIEU" : "POINT D’INTÉRÊT"}</span>
            <h2>{selectedSpot.label}</h2>
            <p className="rotas-kind">{selectedSpot.kind}</p>
            <p>{selectedSpot.note}</p>
            <small>{selectedSpot.mood}</small>
            <div className="rotas-place-detail">{selectedSpot.detail}</div>
            <div className="rotas-depth-path">ÎLE → ROTAS → {selectedSpot.label.toUpperCase()}</div>
          </>
        ) : (
          <>
            <span className="section-kicker">PROMENADE</span>
            <h2>Rotas</h2>
            <p>Une place suspendue entre mer, lanternes, archives et chemins trop bien décorés pour être entièrement honnêtes.</p>
          </>
        )}
      </aside>
    </section>
  );
}
