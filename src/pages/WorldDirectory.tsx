import { useState } from "react";
import { Link } from "react-router-dom";
import { residents, worldLocations } from "@/data/worldDirectory";
import "@/styles/world-directory.css";

export default function WorldDirectory() {
  const [selected, setSelected] = useState("port");
  const place = worldLocations.find(p => p.id === selected) ?? worldLocations[0];
  const cast = residents.filter(r => place.residents.includes(r.id));
  return <main className="world-directory">
    <header><Link to="/map">← HOLO MAP</Link><span>BLACKLACE ISLAND // ATLAS</span><Link to="/">SIGNAL</Link></header>
    <section className="world-intro"><p>ARCHIVES DE L’ÎLE · PREMIÈRE INTÉGRATION</p><h1>Lieux & habitants</h1><p>Le parcours débute au port, avec Marie Jeanne. Sélectionne un lieu pour découvrir les personnages qui lui sont associés.</p></section>
    <div className="world-layout"><nav aria-label="Lieux de Blacklace" className="world-places">{worldLocations.map(p=><button key={p.id} type="button" aria-pressed={selected===p.id} onClick={()=>setSelected(p.id)}>{p.name}</button>)}</nav>
    <article className="world-detail"><p className="world-kicker">DOSSIER DE LIEU</p><h2>{place.name}</h2><p>{place.detail}</p><h3>Personnages associés</h3>{cast.length ? <div className="world-cast">{cast.map(r=><section key={r.id} className="world-resident"><div className="world-avatar" aria-hidden="true">{r.name.slice(0,1)}</div><div><h4>{r.name}</h4><small>{r.role}</small><p>{r.note}</p></div></section>)}</div> : <p>Aucun personnage affecté à ce lieu pour le moment.</p>}
    <p className="world-disclaimer">Fiche éditoriale : les déplacements, modèles 3D et dialogues autonomes ne sont pas encore activés.</p>{place.existingRoute && <Link className="world-map-link" to={place.existingRoute}>Voir la Holo Map →</Link>}</article></div>
    <footer>Références visuelles en préparation · aucune image de personnage attribuée sans validation.</footer>
  </main>;
}
