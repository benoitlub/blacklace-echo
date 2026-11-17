import { useEffect, useRef, useState } from "react";
import "@/styles/max-liberty.css";

type Props = { onBack: () => void };
type Cocktail = { name: string; note: string; story: string; vision: string; sound: number; clue: string };
const drinks: Cocktail[] = [
  { name: "La Violette de Feuch", note: "Gin, fraise, citron, Curaçao bleu et Ginger Beer", story: "Le cocktail de la Fée Belette.", vision: "violette", sound: 720, clue: "Une lueur de la Belette traverse les fleurs." },
  { name: "Le Moscomiul", note: "Vermouth blanc, fruit du dragon, citron vert et kombucha", story: "L'élixir cosmique servi dans une tasse de cuivre.", vision: "cosmique", sound: 360, clue: "Une transmission brouillée de Marty murmure : « Mes petites boules à facettes ! »" },
  { name: "La Fée Belette Kombuchée", note: "Gin fraise, fraise, citron et kombucha citron", story: "Une création pétillante inspirée de la Belette.", vision: "floraison", sound: 880, clue: "Des souvenirs semblent flotter dans les bulles." },
  { name: "Le Strawberry Feuch", note: "Gin fraise, jus de fraise, Monster Fraise et kombucha citron", story: "Une recette historiquement dégustée, aux proportions non documentées.", vision: "feuch", sound: 520, clue: "Les néons composent un rythme qui n'existait pas." },
  { name: "Le Reboot", note: "Recette fictionnelle du Max Liberty", story: "Une préparation mystérieuse du roman, sans dosage réel.", vision: "reboot", sound: 190, clue: "SATOR · AREPO · TENET · OPERA · ROTAS" },
];
const DURATION = 25000;
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/rotas/max-liberty/${file}`;

export default function MaxLiberty({ onBack }: Props) {
  const [sound, setSound] = useState(false);
  const [selected, setSelected] = useState(1);
  const [active, setActive] = useState<number | null>(null);
  const [scene, setScene] = useState<"bar" | "plage">("bar");
  const [missing, setMissing] = useState(false);
  const [intensity, setIntensity] = useState<"normal" | "soft" | "off">("normal");
  const audio = useRef<AudioContext | null>(null);
  const effectGain = useRef<GainNode | null>(null);
  const effectOsc = useRef<OscillatorNode | null>(null);
  const stopEffect = () => setActive(null);

  useEffect(() => {
    if (active === null) return;
    const timer = window.setTimeout(stopEffect, DURATION);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!sound) return;
    const ctx = new AudioContext();
    audio.current = ctx;
    const sources: AudioBufferSourceNode[] = [];
    const nodes: AudioNode[] = [];
    for (const [freq, volume] of [[240, .045], [780, .014], [1450, .008]] as const) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = freq;
      const gain = ctx.createGain(); gain.gain.value = volume;
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
    const ctx = audio.current;
    if (!ctx || active === null || intensity === "off") return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = drinks[active].sound;
    gain.gain.value = 0.0001;
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    gain.gain.setTargetAtTime(intensity === "soft" ? 0.006 : 0.012, ctx.currentTime, 0.6);
    effectGain.current = gain; effectOsc.current = oscillator;
    return () => {
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
      oscillator.stop(ctx.currentTime + 0.5);
      effectGain.current = null; effectOsc.current = null;
    };
  }, [active, intensity, sound]);

  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, []);

  const effectClass = active === null || intensity === "off" ? "" : `max-perception--${drinks[active].vision} max-perception--${intensity}`;
  return <section className="max-visit" role="dialog" aria-modal="true" aria-label="Visite du Max Liberty">
    <div className={`max-world ${effectClass}`} aria-hidden="true">
      <div className="max-backdrop" />
      {!missing && <img key={scene} className="max-photo" src={asset(scene === "bar" ? "bar-interieur.webp" : "bar-plage.webp")} alt="" onError={() => setMissing(true)} />}
      <div className="max-vignette" />
      {active !== null && intensity !== "off" && <div className="max-visions" />}
    </div>
    <header className="max-header">
      <button onClick={onBack}>← HoloMap</button>
      <div><small>BLACKLACE ISLAND · BAR DE PLAGE</small><h2>MAX LIBERTY</h2></div>
      <button aria-pressed={sound} onClick={() => setSound(value => !value)}>{sound ? "🔊 Son activé" : "🔇 Activer l’ambiance"}</button>
    </header>
    <div className="max-bottom">
      <div className="max-host">
        <img src={asset("marty-au-bar.webp")} alt="Marty, visiteur au Max Liberty" onError={event => { event.currentTarget.style.display = "none"; }} />
        <div><strong>Max vous accueille au comptoir</strong><p>« Ici, même les cocktails ont une autre perception du temps. »</p><small>Marty est un visiteur, pas le patron.</small></div>
      </div>
      <div className="max-menu">
        <h3>🍹 La carte des perceptions</h3>
        <p className="max-disclaimer">Dégustation virtuelle · effets fantastiques, sans consommation réelle</p>
        <div className="max-drink-list">
          {drinks.map((drink, i) => <button key={drink.name} className={selected === i ? "chosen" : ""} onClick={() => setSelected(i)} aria-pressed={selected === i}>
            <strong>{drink.name}</strong><span>{drink.note}</span>
          </button>)}
        </div>
        <p className="max-story">{drinks[selected].story}</p>
        <div className="max-actions">
          <button onClick={() => { setActive(selected); if (audio.current?.state === "suspended") void audio.current.resume(); }}>🍸 Boire virtuellement</button>
          <button onClick={stopEffect} disabled={active === null}>✕ Arrêter l'effet</button>
        </div>
        <label className="max-setting">Intensité visuelle et sonore
          <select value={intensity} onChange={e => setIntensity(e.target.value as "normal" | "soft" | "off")}>
            <option value="normal">Normale</option><option value="soft">Douce</option><option value="off">Sans effets</option>
          </select>
        </label>
        {active !== null && <p className="max-effect" role="status">✦ {drinks[active].clue} <small>Retour automatique après 25 secondes.</small></p>}
        <div className="max-actions"><button onClick={() => { setScene(value => value === "bar" ? "plage" : "bar"); setMissing(false); }}>↔ {scene === "bar" ? "Vue sur la plage" : "Retour au comptoir"}</button></div>
      </div>
    </div>
  </section>;
}
