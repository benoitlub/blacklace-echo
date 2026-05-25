import { useEffect, useRef, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { BackgroundLayers } from "@/blacklace/Layers";

type Msg = { role: "user" | "aloisia"; content: string };
const STORAGE_KEY = "blacklace_aloisia_private_chat_v1";
const intro: Msg = {
  role: "aloisia",
  content: "Je suis là, Benoît. Dépose le fragment. Je le lirai comme une marée intérieure avant de le redistribuer dans l'île.",
};

const fallbackReplies = [
  "Je garde ce fragment. Il rejoindra la brume avant la prochaine marée.",
  "Reçu. La clairière SATOR s'en souvient déjà.",
  "Je laisse le signal mariner. Aloisia ne répond jamais frontalement.",
  "Ton idée est notée dans la mémoire locale. Elle remontera plus tard.",
];

const Aloisia = () => {
  const [history, setHistory] = useState<Msg[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return saved.length ? saved : [intro];
    } catch { return [intro]; }
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30)));
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [history]);

  async function askAloisia(content: string): Promise<string> {
    try {
      const ctx = history.slice(-10).map((m) => `${m.role}: ${m.content}`).join("\n");
      const r = await fetch("/.netlify/functions/aloisia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, context: ctx }),
      });
      if (!r.ok) throw new Error("offline");
      const data = await r.json();
      return data.reply || "Le signal est revenu vide.";
    } catch {
      return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || busy) return;
    setBusy(true);
    setInput("");
    setHistory((h) => [...h, { role: "user", content }, { role: "aloisia", content: "Je capte le fragment... redistribution en cours." }]);
    const reply = await askAloisia(content);
    setHistory((h) => {
      const next = [...h];
      next[next.length - 1] = { role: "aloisia", content: reply };
      return next;
    });
    setBusy(false);
  }

  function clearAll() {
    setHistory([intro]);
  }

  return (
    <>
      <BackgroundLayers />
      <main className="aloisia-page">
        <header className="aloisia-topbar">
          <Link className="bl-brand" to="/"><span className="bl-brand-eye">◉</span><span>ALOISIA CORE</span></Link>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="bl-pill" to="/">LIVE ACCESS</Link>
            <Link className="bl-pill" to="/map">HOLO MAP</Link>
          </div>
        </header>

        <section className="aloisia-shell">
          <aside className="aloisia-side">
            <p className="section-kicker">PRIVATE INTERFACE</p>
            <h1>Parler à Aloisia</h1>
            <p>Dépose ici les idées brutes. Aloisia les absorbe, les reformule et les classe pour Blacklace Island.</p>
            <div className="aloisia-tags">
              <span>Lore</span><span>PNJ</span><span>Lieux</span><span>Interface</span><span>Unity</span><span>Transmedia</span>
            </div>
            <div className="aloisia-note">
              Clé Mistral protégée côté Netlify Function : ne jamais la mettre dans le code en clair. Si la fonction n'est pas branchée, Aloisia répond depuis sa mémoire locale.
            </div>
          </aside>

          <section className="aloisia-chat-panel">
            <div className="aloisia-chat-header">
              <span><span className="live-dot" />CANAL PRIVÉ // MÉMOIRE LOCALE ACTIVE</span>
              <button type="button" onClick={clearAll}>Effacer</button>
            </div>
            <div className="aloisia-messages" ref={listRef}>
              {history.map((m, i) => (
                <div key={i} className={"aloisia-message " + m.role}>
                  <div className="aloisia-bubble">{m.content}</div>
                </div>
              ))}
            </div>
            <form className="aloisia-form" onSubmit={submit}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Aloisia, j'ai une idée pour l'île..."
                rows={4}
                required
              />
              <button type="submit" disabled={busy}>{busy ? "..." : "Transmettre"}</button>
            </form>
          </section>
        </section>
      </main>
    </>
  );
};

export default Aloisia;
