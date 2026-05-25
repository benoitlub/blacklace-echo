import { useEffect, useRef, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Anchor, Beer, Triangle, Hexagon, Eye, Radio } from "lucide-react";
import { BackgroundLayers, glitch } from "@/blacklace/Layers";
import { zones, scriptedLines, videoSources, ZoneKey } from "@/blacklace/data";

type ChatItem = { name: string; text: string };
type Phase = "phase-signal" | "phase-feuch" | "phase-reboot";

const phaseButtons: { phase: Phase; label: string }[] = [
  { phase: "phase-signal", label: "SIGNAL" },
  { phase: "phase-feuch", label: "FEUCH" },
  { phase: "phase-reboot", label: "REBOOT" },
];

const Index = () => {
  const [phase, setPhase] = useState<Phase>("phase-signal");
  const [chat, setChat] = useState<ChatItem[]>([{ name: "SYSTEM", text: "Connexion au signal Blacklace..." }]);
  const [viewerCount, setViewerCount] = useState(128);
  const [signalHealth, setSignalHealth] = useState(97);
  const [videoIdx, setVideoIdx] = useState(0);
  const [zoneOpen, setZoneOpen] = useState<ZoneKey | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [videoOk, setVideoOk] = useState(true);

  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // phase class on <body>
  useEffect(() => {
    document.body.classList.remove("phase-signal", "phase-feuch", "phase-reboot");
    document.body.classList.add(phase);
  }, [phase]);

  // scripted chat + viewer count
  useEffect(() => {
    const id = setInterval(() => {
      const [name, text] = scriptedLines[Math.floor(Math.random() * scriptedLines.length)];
      setChat((c) => [...c.slice(-40), { name, text }]);
      setViewerCount(121 + Math.floor(Math.random() * 18));
    }, 7000);
    return () => clearInterval(id);
  }, []);

  // auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  // video rotation
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
    setSignalHealth(92 + Math.floor(Math.random() * 7));
    const id = setInterval(() => {
      setVideoIdx((i) => (i + 1) % videoSources.length);
      setChat((c) => [...c, { name: "SYSTEM", text: "Le signal vidéo vient de glisser." }]);
      glitch();
    }, 32000);
    return () => clearInterval(id);
  }, [videoIdx]);

  function handleChange(p: Phase) {
    setPhase(p);
    setChat((c) => [...c, { name: "SYSTEM", text: `Phase ${p.replace("phase-", "").toUpperCase()} active.` }]);
    glitch();
  }

  function openZone(k: ZoneKey) {
    setZoneOpen(k);
    setChat((c) => [...c, { name: "SYSTEM", text: "Accès demandé : " + zones[k].title + "." }]);
    glitch();
  }

  function submitChat(e: FormEvent) {
    e.preventDefault();
    const v = chatInput.trim();
    if (!v) return;
    setChat((c) => [...c, { name: "BENOÎT", text: v }]);
    setChatInput("");
    setTimeout(() => {
      setChat((c) => [
        ...c,
        { name: "ALOISIA", text: "Signal reçu. Je le garde dans la brume pour la prochaine mutation de l'île." },
      ]);
    }, 450);
    glitch();
  }

  const zone = zoneOpen ? zones[zoneOpen] : null;

  return (
    <>
      <BackgroundLayers />
      <main className="bl-home">
        <header className="bl-topbar">
          <a className="bl-brand" href="#top">
            <span className="bl-brand-eye">◉</span>
            <span>BLACKLACE</span>
          </a>
          <nav className="bl-nav">
            {phaseButtons.map((b) => (
              <button
                key={b.phase}
                className={"bl-pill" + (phase === b.phase ? " bl-pill-active" : "")}
                onClick={() => handleChange(b.phase)}
                type="button"
              >
                {b.label}
              </button>
            ))}
            <Link className="bl-pill" to="/map">HOLO MAP</Link>
            <Link className="bl-pill" to="/aloisia">ALOISIA</Link>
            <span className="bl-pill bl-status">LIVE</span>
          </nav>
        </header>

        <section className="bl-hero">
          <div className="bl-hero-copy">
            <p className="bl-kicker">UNE ÎLE OUBLIÉE QUELQUE PART DANS LE WEB</p>
            <h1>
              Natasha est en direct.
              <br />
              La brume répond.
            </h1>
            <p className="bl-lead">
              Blacklace Island n'explique pas tout. Elle ouvre des chemins, laisse passer des voix,
              puis change légèrement quand personne ne regarde.
            </p>
            <div className="bl-cta-row">
              <button className="bl-cta" type="button" onClick={() => openZone("port")}>
                Traverser la brume
              </button>
              <Link className="bl-cta ghost" to="/map">Voir l'île</Link>
            </div>
          </div>

          <div className="bl-card bl-floating-video">
            <div className="bl-card-head">
              <span>NATASHA // ROTAS SIGNAL</span>
              <span>SIGNAL {signalHealth}%</span>
            </div>
            <div className="bl-video-frame">
              {videoOk ? (
                <video
                  ref={videoRef}
                  key={videoIdx}
                  className="bl-media"
                  autoPlay
                  muted
                  playsInline
                  loop
                  onError={() => setVideoOk(false)}
                >
                  <source src={videoSources[videoIdx]} type="video/mp4" />
                </video>
              ) : (
                <div className="bl-waiting">
                  <Radio size={28} />
                  <span>EN ATTENTE DU SIGNAL</span>
                  <small style={{ opacity: 0.6, letterSpacing: ".1em" }}>
                    place /public/assets/videos/natasha-live.mp4
                  </small>
                </div>
              )}
              <div className="bl-video-label">LIVE // ROTAS</div>
            </div>
          </div>

          <aside className="bl-card bl-signal-console">
            <div className="bl-card-head">
              <span>ISLAND CHAT</span>
              <span>{viewerCount} viewers</span>
            </div>
            <div className="bl-log-list" ref={chatRef}>
              {chat.map((l, i) => (
                <div className="bl-log" key={i}>
                  <strong>{l.name}</strong>
                  <span>{l.text}</span>
                </div>
              ))}
            </div>
            <form className="bl-mini-form" onSubmit={submitChat}>
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Écris au signal..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitChat(e as unknown as FormEvent);
                  }
                }}
              />
              <button type="submit" aria-label="Envoyer">↵</button>
            </form>
          </aside>
        </section>

        <div className="bl-side-status">
          <span>● {phase.replace("phase-", "").toUpperCase()} ACTIVE</span>
          <span>◉ Aloisia en veille</span>
          <span>◯ Pro.Hibited Network</span>
        </div>

        <section className="bl-access">
          <p className="bl-section-title">ACCÈS AUX ZONES</p>
          <div className="bl-card-grid">
            <button className="bl-node" onClick={() => openZone("port")}>
              <span className="bl-icon"><Anchor size={18} /></span>
              <strong>Le Port</strong>
              <small>Arriver par Porsa Rotas.</small>
            </button>
            <button className="bl-node" onClick={() => openZone("max")}>
              <span className="bl-icon"><Beer size={18} /></span>
              <strong>Max Liberty</strong>
              <small>Le bar garde les lumières.</small>
            </button>
            <button className="bl-node" onClick={() => openZone("sator")}>
              <span className="bl-icon"><Triangle size={18} /></span>
              <strong>Clairière SATOR</strong>
              <small>Marty parle aux pierres.</small>
            </button>
            <button className="bl-node" onClick={() => openZone("ludmila")}>
              <span className="bl-icon"><Eye size={18} /></span>
              <strong>Club Ludmila</strong>
              <small>Perceptions altérées.</small>
            </button>
            <button className="bl-node" onClick={() => openZone("institute")}>
              <span className="bl-icon"><Hexagon size={18} /></span>
              <strong>Feuch Institute</strong>
              <small>Prototypes et inventions.</small>
            </button>
            <button className="bl-node" onClick={() => openZone("network")}>
              <span className="bl-icon"><Radio size={18} /></span>
              <strong>Pro.Hibited Network</strong>
              <small>BNN24, Moscomiul Break.</small>
            </button>
          </div>
        </section>

        <div className="bl-map-access">
          <Link className="bl-map-button" to="/map">OUVRIR LA HOLO MAP →</Link>
        </div>
      </main>

      {zone && (
        <div className="bl-modal" role="dialog" aria-modal="true">
          <div className="bl-modal-backdrop" onClick={() => setZoneOpen(null)} />
          <div className="bl-modal-panel">
            <button className="bl-modal-close" onClick={() => setZoneOpen(null)} aria-label="Fermer">×</button>
            <p className="bl-modal-kicker">{zone.kicker}</p>
            <h2>{zone.title}</h2>
            <p className="bl-modal-text">{zone.text}</p>
            <div className="bl-modal-fragment">{zone.fragment}</div>
            <div className="bl-modal-actions">
              <button onClick={() => { glitch(); setChat((c) => [...c, { name: "SYSTEM", text: "Signal marqué : " + zone.title }]); }}>
                Marquer le signal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
