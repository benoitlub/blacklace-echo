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
  const b = document.body;
  b.classList.add("bl-glitch", "bl-route-transition", "bl-glitch-pro");
  // brief flash
  const flash = document.createElement("div");
  flash.className = "bl-flash";
  b.appendChild(flash);
  // chromatic tearing slices
  const tear = document.createElement("div");
  tear.className = "bl-tear";
  tear.innerHTML = '<i style="--ty:18%;--tx:-12px;--d:60ms"></i><i style="--ty:42%;--tx:14px;--d:120ms"></i><i style="--ty:71%;--tx:-8px;--d:200ms"></i>';
  b.appendChild(tear);
  const dur = 520;
  setTimeout(() => {
    b.classList.remove("bl-glitch", "bl-route-transition", "bl-glitch-pro");
    flash.remove();
    tear.remove();
  }, dur);
}
