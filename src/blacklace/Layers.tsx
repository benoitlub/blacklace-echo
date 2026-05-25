import { useEffect, useRef } from "react";

export function BackgroundLayers() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add("bl-body");
    const id = setInterval(() => {
      const host = particlesRef.current;
      if (!host) return;
      const p = document.createElement("i");
      p.className = "bl-particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = "-12px";
      p.style.setProperty("--x", Math.random() * 120 - 60 + "px");
      p.style.animationDuration = 5 + Math.random() * 7 + "s";
      host.appendChild(p);
      setTimeout(() => p.remove(), 12000);
    }, 650);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="bl-bg-grid" />
      <div className="bl-bg-glow" />
      <div className="bl-noise" />
      <div className="bl-scanlines" />
      <div className="bl-particles" ref={particlesRef} />
      <div className="bl-glitch-layer" />
    </>
  );
}

export function glitch() {
  document.body.classList.add("bl-glitch", "bl-route-transition");
  setTimeout(() => document.body.classList.remove("bl-glitch", "bl-route-transition"), 460);
}
