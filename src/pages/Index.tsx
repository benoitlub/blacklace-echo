import { useEffect, useRef, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Anchor, Beer, Triangle, Hexagon, Eye, Radio } from "lucide-react";
import { BackgroundLayers, glitch } from "@/blacklace/Layers";
import { zones, scriptedLines, videoSources, ZoneKey, appLinks } from "@/blacklace/data";

type ChatItem = { name: string; text: string };
type Phase = "phase-signal" | "phase-feuch" | "phase-reboot";
type Phase2 = Phase | "phase-sator";

const phaseButtons: { phase: Phase2; label: string }[] = [
  { phase: "phase-signal", label: "SIGNAL" },
  { phase: "phase-feuch", label: "FEUCH" },
  { phase: "phase-reboot", label: "REBOOT" },
  { phase: "phase-sator", label: "SATOR" },
];

const zoneCards: { key: ZoneKey; icon: JSX.Element; subtitle: string }[] = [
  { key: "port", icon: <Anchor size={18} />, subtitle: "Arriver par Porsa Rotas." },
  { key: "max", icon: <Beer size={18} />, subtitle: "Le bar garde les lumières." },
  { key: "sator", icon: <Triangle size={18} />, subtitle: "Marty parle aux pierres." },
  { key: "ludmila", icon: <Eye size={18} />, subtitle: "Perceptions altérées." },
  { key: "institute", icon: <Hexagon size={18} />, subtitle: "Prototypes et inventions." },
  { key: "network", icon: <Radio size={18} />, subtitle: "BNN24, Moscomiul Break." },
];

const youtubeEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&controls=0&modestbranding=1`;

const statusClass = (status: string) => status.toLowerCase().replace(/\s+/g, "-");

const Index = () => {
  const [phase, setPhase] = useState<Phase2>("phase-signal");
  const [chat, setChat] = useState<ChatItem[]>([{ name: "SYSTEM", text: "Connexion au signal Blacklace..." }]);
  const [viewerCount, setViewerCount] = useState(128);
  const [signalHealth, setSignalHealth] = useState(97);
  const [videoIdx, setVideoIdx] = useState(0);
  const [zoneOpen, setZoneOpen] = useState<ZoneKey | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [signalLost, setSignalLost] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentSource = videoSources[videoIdx % videoSources.length];
  const isLocalSource = currentSource.type === "local";

  useEffect(() => {
    document.body.classList.remove("phase-signal", "phase-feuch", "phase-reboot", "phase-sator");
    document.body.classList.add(phase);
  }, [phase]);

  useEffect(() => {
    const id = setInterval(() => {
      const [name, text] = scriptedLines[Math.floor(Math.random() * scriptedLines.length)];
      setChat((c) => [...c.slice(-40), { name, text }]);
      setViewerCount(121 + Math.floor(Math.random() * 18));
    }, 7000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  useEffect(() => {
    const id = setInterval(() => {
      setVideoIdx((i) => (i + 1) % videoSources.length);
      setChat((c) => [...c, { name: "SYSTEM", text: "Le signal vidéo vient de glisser." }]);
      glitch();
    }, 32000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setSignalLost(false);
    setSignalHealth(92 + Math.floor(Math.random() * 7));

    if (!isLocalSource) return;

    const v = videoRef.current;
    if (!v) return;

    v.load();
    v.play().catch(() => {
      // Autoplay can be blocked briefly; keep the cockpit alive instead of killing the signal.
    });
  }, [videoIdx, isLocalSource]);

  function skipBrokenSignal() {
    setSignalLost(true);
    setChat((c) => [...c, { name: "SYSTEM", text: "Signal instable : bascule vers la source suivante." }]);
    window.setTimeout(() => {
      setSignalLost(false);
      setVideoIdx((i) => (i + 1) % videoSources.length);
      glitch();
    }, 900);
  }

  function requestLockedPhase(label: string) {
    setChat((c) => [...c, { name: "ALOISIA", text: `${label} n'est pas un interrupteur public. Je l'activerai quand l'île sera prête.` }]);
    glitch();
  }

  function handleChange(p: Phase2) {
    setPhase(p);
    setChat((c) => [...c, { name: "ALOISIA", text: `Phase ${p.replace("phase-", "").toUpperCase()} activée depuis le noyau.` }]);
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
                className={"bl-pill bl-phase-locked" + (phase === b.phase ? " bl-pill-active" : "")}
                onClick={() => requestLockedPhase(b.label)}
                type="button"
                title="Mode réservé à Aloisia"
              >
                {b.label}
              </button>
            ))}
            <Link className="bl-pill" to="/map">HOLO MAP</Link>
            <Link className="bl-pill" to="/aloisia">ALOISIA</Link>
            <span className="bl-pill bl-status">LIVE</span>
          </nav>
        </header>

        <div className="bl-stage-row">
          <div className="bl-card bl-floating-video">
            <div className="bl-card-head">
              <span>NATASHA // ROTAS SIGNAL</span>
              <span>SIGNAL {signalHealth}%</span>
            </div>
            <div className="bl-video-frame" id="liveScreen">
              <video
                ref={videoRef}
                key={isLocalSource ? currentSource.src : "local-standby"}
                className="bl-media"
                autoPlay
                muted
                playsInline
                loop
                onError={skipBrokenSignal}
                style={{ display: isLocalSource ? "block" : "none" }}
              >
                {isLocalSource && <source src={currentSource.src} />}
              </video>

              <iframe
                key={!isLocalSource ? currentSource.id : "youtube-standby"}
                className="bl-media"
                src={!isLocalSource ? youtubeEmbed(currentSource.id) : ""}
                title="Blacklace Signal"
                allow="autoplay; fullscreen"
                allowFullScreen
                style={{ display: !isLocalSource ? "block" : "none" }}
              />

              <div className="live-screen-glow" />
              <div className="live-screen-grid" />

              {signalLost && (
                <div className="bl-waiting">
                  <Radio size={28} />
                  <span>SIGNAL LOST</span>
                  <small style={{ opacity: 0.6, letterSpacing: ".1em" }}>
                    bascule vers la source suivante
                  </small>
                </div>
              )}

              <div className="bl-video-label">
                <span>{currentSource.label}</span>
                <span>SYNC {signalHealth}%</span>
              </div>
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
        </div>

        <section className="bl-hero">
          <div className="bl-hero-copy">
            <p className="bl-kicker">UNE ÎLE OUBLIÉE QUELQUE PART SUR LE WEB</p>
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
        </section>

        <div className="bl-side-status">
          <span>● {phase.replace("phase-", "").toUpperCase()} ACTIVE</span>
          <span>◉ Aloisia en veille</span>
          <span>◯ Pro.Hibited Network</span>
        </div>

        <section className="bl-access">
          <p className="bl-section-title">ACCÈS AUX ZONES</p>
          <div className="bl-card-grid">
            {zoneCards.map(({ key, icon, subtitle }) => {
              const z = zones[key];
              return (
                <button className="bl-node" key={key} onClick={() => openZone(key)}>
                  <span className="bl-icon">{icon}</span>
                  <strong>{z.title}</strong>
                  <small>{subtitle}</small>
                  <span className={`bl-zone-status bl-zone-status--${statusClass(z.status)}`}>{z.status}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bl-access">
          <p className="bl-section-title">MODULES CONNECTÉS</p>
          <div className="bl-card-grid">
            <a className="bl-node" href={appLinks.blacklaceDice} target="_blank" rel="noreferrer">
              <span className="bl-icon">🎲</span>
              <strong>Blacklace Dice</strong>
              <small>Missions anti-procrastination.</small>
            </a>
            <a className="bl-node" href={appLinks.feebeletteReboot} target="_blank" rel="noreferrer">
              <span className="bl-icon">🧚</span>
              <strong>Fée Belette Reboot</strong>
              <small>Reset doux, fébeltenetlébien.</small>
            </a>
            <a className="bl-node" href={appLinks.creatureSync} target="_blank" rel="noreferrer">
              <span className="bl-icon">🐾</span>
              <strong>Creature-Sync</strong>
              <small>Traducteur animalier instable.</small>
            </a>
            <a className="bl-node" href={appLinks.spectrl} target="_blank" rel="noreferrer">
              <span className="bl-icon">👻</span>
              <strong>SpecTRL</strong>
              <small>Signaux fantômes & SLS.</small>
            </a>
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
            <span className={`bl-zone-status bl-modal-status bl-zone-status--${statusClass(zone.status)}`}>{zone.status}</span>
            <p className="bl-modal-text">{zone.text}</p>
            <div className="bl-modal-fragment">{zone.fragment}</div>
            <div className={"bl-modal-actions" + (zone.mood ? " bl-modal-actions--" + zone.mood : "")}>
              {(zone.actions ?? []).map((a, i) => {
                const cls = "bl-modal-action " + (a.intent === "ghost" ? "is-ghost" : a.intent === "warn" ? "is-warn" : "is-primary");
                const onClick = () => {
                  if (a.phase) handleChange(a.phase);
                  if (a.signal) setChat((c) => [...c, { name: "SYSTEM", text: a.signal! }]);
                  glitch();
                };
                if (a.href) {
                  return (
                    <a key={i} className={cls} href={a.href} target="_blank" rel="noreferrer" onClick={onClick} title={a.hint}>
                      {a.label}
                      {a.hint && <em className="bl-modal-action-hint">{a.hint}</em>}
                    </a>
                  );
                }
                return (
                  <button key={i} className={cls} type="button" onClick={onClick} title={a.hint}>
                    {a.label}
                    {a.hint && <em className="bl-modal-action-hint">{a.hint}</em>}
                  </button>
                );
              })}
              <button className="bl-modal-action is-ghost" type="button" onClick={() => { glitch(); setChat((c) => [...c, { name: "SYSTEM", text: "Signal marqué : " + zone.title }]); }}>
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
