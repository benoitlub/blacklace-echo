import { useEffect, useRef, useState } from "react";
import "@/styles/max-liberty.css";

type Props = { onBack: () => void };
const drinks = [
  { name: "Breuvage de Feuch", note: "Agrumes, braise bleue et une pointe de chaos", effect: "Les lumières semblent danser un instant." },
  { name: "Moscow Vium", note: "Citron vert, menthe et moscovium imaginaire microdosé", effect: "Les couleurs prennent une longueur d'avance." },
  { name: "Marée Quantique", note: "Fruits tropicaux et écume phosphorescente", effect: "Le ressac paraît répondre à vos pensées." },
];
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/rotas/max-liberty/${file}`;

export default function MaxLiberty({ onBack }: Props) {
  const [sound, setSound] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [scene, setScene] = useState<"bar" | "plage">("bar");
  const [missing, setMissing] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!sound) return;
    const ctx = new AudioContext();
    audio.current = ctx;
    const sources: AudioBufferSourceNode[] = [];
    const nodes: AudioNode[] = [];
    // Low-volume synthetic surf and distant chatter; no external audio or autoplay.
    for (const [freq, volume] of [[240, .045], [780, .014], [1450, .008]] as const) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(); sources.push(source); nodes.push(filter, gain);
    }
    return () => {
      sources.forEach(source => { source.stop(); source.disconnect(); });
      nodes.forEach(node => node.disconnect());
      void ctx.close();
      audio.current = null;
    };
  }, [sound]);
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, []);
  return <section className="max-visit" role="dialog" aria-modal="true" aria-label="Visite du Max Liberty">
    <div className="max-backdrop" aria-hidden="true" />
    {!missing && <img key={scene} className="max-photo" src={asset(scene === "bar" ? "bar-interieur.webp" : "bar-plage.webp")} alt="" onError={() => setMissing(true)} />}
    <div className="max-vignette" />
    <header className="max-header">
      <button onClick={onBack}>← HoloMap</button>
      <div><small>BLACKLACE ISLAND · BAR DE PLAGE</small><h2>MAX LIBERTY</h2></div>
      <button aria-pressed={sound} onClick={() => setSound(value => !value)}>{sound ? "🔊 Son activé" : "🔇 Activer l’ambiance"}</button>
    </header>
    <div className="max-bottom">
      <div className="max-host">
        <img src={asset("marty-au-bar.webp")} alt="Un visiteur aux cheveux bleus au Max Liberty" onError={event => { event.currentTarget.style.display = "none"; }} />
        <div><strong>Max vous accueille au comptoir</strong><p>« Ici, même les cocktails ont une autre perception du temps. »</p><small>Marty est un visiteur, pas le patron.</small></div>
      </div>
      <div className="max-menu">
        <h3>La carte des perceptions</h3>
        <p className="max-disclaimer">Cocktails et effets entièrement fictifs · expérience visuelle uniquement</p>
        {drinks.map((drink, i) => <button key={drink.name} className={selected === i ? "chosen" : ""} onClick={() => setSelected(i)} aria-pressed={selected === i}>
          <strong>{drink.name}</strong><span>{drink.note}</span>
        </button>)}
        {selected !== null && <p className="max-effect" role="status">✦ {drinks[selected].effect}</p>}
        <div className="max-actions"><button onClick={() => { setScene(value => value === "bar" ? "plage" : "bar"); setMissing(false); }}>↔ {scene === "bar" ? "Vue sur la plage" : "Retour au comptoir"}</button></div>
      </div>
    </div>
  </section>;
}
