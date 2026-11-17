import type { Drink } from "./drinks";
// Fluorescent drawings anchored to the real decor (normalized coordinates of 00_fond_complet, 1672×941).
type P = [number, number][];
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const poly = (n: number, f: (k: number) => [number, number]): P => range(n + 1).map(i => f(i / n));
const ellipse = (cx: number, cy: number, rx: number, ry: number) => poly(40, k => [cx + rx * Math.cos(k * 6.283), cy + ry * Math.sin(k * 6.283)]);
const spiral = (cx: number, cy: number, r: number) => poly(60, k => [cx + r * k * Math.cos(k * 18), cy + r * k * 1.777 * Math.sin(k * 18)]);
export const LANTERNS: [number, number][] = [[.646, .166], [.75, .096], [.56, .24], [.513, .294], [.34, .18], [.15, .65], [.393, .75]];
const TRACES: P[] = [
  ...range(5).map(i => poly(30, k => [.1 + i * .02 + k * (.64 - i * .02), .79 + i * .036 + Math.sin(k * 9 + i) * .006 - k * .015])), // veines du bois
  poly(30, k => [.43 + k * .57, .505 + Math.sin(k * 5) * .002]), // bord du comptoir
  ...[.31, .395, .465].map(y => poly(20, k => [.62 + k * .36, y])), // étagères
  ...range(16).map(i => { const x = .64 + i * .021, y = .31 - .005 * (i % 3); return [[x, y], [x, y - .05], [x + .008, y - .065], [x + .008, y - .065], [x + .016, y - .05], [x + .016, y]] as P; }), // bouteilles
  ellipse(.895, .17, .1, .145), // enseigne
  spiral(.063, .9, .06), spiral(.978, .87, .045), // hibiscus
  ...[[.436, .59], [.524, .6], [.625, .61], [.758, .62]].map(([x, y]) => ellipse(x, y, .034, .018)), // tabourets
  poly(20, k => [.04 + k * .38, .555]), // horizon
];
export type Imgs = { marty?: HTMLImageElement; natasha?: HTMLImageElement; max?: HTMLImageElement; plage?: HTMLImageElement };
export function drawVision(c: CanvasRenderingContext2D, W: number, H: number, t: number, d: Drink, e: { emerge: number; inlay: number; warp: number; fade: number }, reduced: boolean, imgs: Imgs) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  const A = e.fade * (reduced ? .5 : 1); if (A <= 0.001) return;
  c.globalCompositeOperation = "lighter"; c.lineCap = "round"; c.lineJoin = "round";
  const X = (x: number) => x * W, Y = (y: number) => y * H, S = W / 1000;
  const [c1, c2, c3] = d.palette;
  const glow = (col: string, w: number, a: number) => { c.strokeStyle = col; c.globalAlpha = a * .22; c.lineWidth = w * 4 * S; c.stroke(); c.globalAlpha = a; c.lineWidth = w * S; c.stroke(); };
  const path = (p: P, frac = 1, dx = 0, dy = 0) => { const n = Math.max(1, Math.ceil((p.length - 1) * frac)); c.beginPath(); c.moveTo(X(p[0][0] + dx), Y(p[0][1] + dy)); for (let i = 1; i <= n; i++) c.lineTo(X(p[i][0] + dx), Y(p[i][1] + dy)); };
  // A. tracés UV qui émergent sur bois, fleurs, bouteilles
  TRACES.forEach((p, i) => {
    const f = Math.min(1, Math.max(0, e.emerge * 1.6 - (i % 9) * .07)); if (!f) return;
    const shimmer = .75 + .25 * Math.sin(t * 1.7 + i * 1.3);
    const dbl = d.id === "reboot" ? .012 * Math.sin(t * .6) * e.inlay : 0;
    path(p, f); glow(i % 2 ? c1 : c2, 1.4, A * shimmer * .85);
    if (dbl) { path(p, f, dbl, 0); glow(c2, 1, A * .5); }
  });
  const ia = A * e.inlay;
  // B. halos et spirales autour des lanternes
  const ha = A * Math.max(e.warp, e.inlay * .35);
  if (ha > .01) LANTERNS.forEach(([x, y], i) => {
    const r = (.03 + .015 * Math.sin(t * .8 + i)) * (1 + e.warp);
    c.beginPath(); for (let k = 0; k <= 50; k++) { const a = k / 50 * 12 + t * (i % 2 ? .6 : -.6); const rr = r * k / 50; c.lineTo(X(x + rr * Math.cos(a)), Y(y + rr * 1.777 * Math.sin(a))); }
    glow(i % 2 ? c3 : c1, 1.2, ha * .8);
  });
  if (ia < .01) return;
  if (d.id === "violette") {
    range(reduced ? 4 : 9).forEach(i => {
      const x = .2 + .6 * (.5 + .5 * Math.sin(t * .23 + i * 2.1)), y = .35 + .4 * (.5 + .5 * Math.sin(t * .31 + i * 1.7));
      const flap = .3 + .7 * Math.abs(Math.sin(t * 6 + i)); const s = (.012 + (i % 3) * .004) * W;
      c.save(); c.translate(X(x), Y(y)); c.rotate(Math.sin(t + i) * .4); c.globalAlpha = ia * .9;
      for (const side of [-1, 1]) { c.beginPath(); c.ellipse(side * s * .55 * flap, -s * .2, s * .6 * flap, s * .45, side * .5, 0, 6.283); c.fillStyle = i % 2 ? c1 : c3; c.fill(); c.beginPath(); c.ellipse(side * s * .4 * flap, s * .35, s * .35 * flap, s * .28, side * -.4, 0, 6.283); c.fillStyle = c2; c.fill(); }
      c.restore();
    });
    [[.22, .9], [.3, .84], [.55, .88], [.12, .78], [.66, .93]].forEach(([x, y], i) => { // fleurs UV qui éclosent sur le bois
      const g = Math.min(1, ia * 1.4 - i * .1); if (g <= 0) return; const r = .022 * g;
      for (let k = 0; k < 5; k++) { const a = k * 1.2566 + t * .2; c.beginPath(); c.ellipse(X(x + r * Math.cos(a)), Y(y + r * .5 * Math.sin(a)), r * W * .7, r * W * .3, a, 0, 6.283); glow(k % 2 ? c1 : c3, 1, ia); }
    });
    for (const s0 of [13, 29, 41]) { const k = (t - s0) / 2.4; if (k < 0 || k > 1) continue; // Belette fugitive le long du comptoir
      const x = 1 - k * .6, y = .5 - Math.abs(Math.sin(k * 30)) * .012; c.save(); c.translate(X(x), Y(y)); c.globalAlpha = A;
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-S * 10, -S * 14, S * 30, -S * 16, S * 42, -S * 4); c.quadraticCurveTo(S * 62, -S * 18, S * 78, -S * 6); glow(c3, 3, A); c.restore();
      path(poly(10, q => [x + q * .08, y - .006]), 1); glow(c1, 1, A * .5);
    }
  }
  if (d.id === "moscomiul") {
    range(reduced ? 30 : 70).forEach(i => { const x = (i * .137) % 1, y = (i * .291) % .55; const tw = .5 + .5 * Math.sin(t * 1.3 + i * 7); c.globalAlpha = ia * tw; c.fillStyle = i % 3 ? "#fff" : c1; c.beginPath(); c.arc(X(x), Y(y), S * (1 + (i % 3)), 0, 6.283); c.fill(); });
    range(reduced ? 3 : 6).forEach(i => {
      const x = .15 + i * .14 + .03 * Math.sin(t * .4 + i), y = 1.05 - ((t * .018 + i * .19) % 1.1); const pulse = 1 + .15 * Math.sin(t * 2 + i); const r = (.025 + (i % 2) * .012) * W;
      c.beginPath(); c.ellipse(X(x), Y(y), r * pulse, r * .7 / pulse, 0, Math.PI, 0); glow(i % 2 ? c1 : c2, 1.5, ia * .9);
      for (let k = 0; k < 5; k++) { c.beginPath(); const x0 = X(x) - r + k * r / 2; c.moveTo(x0, Y(y)); for (let j = 1; j < 12; j++) c.lineTo(x0 + Math.sin(t * 2 + j * .6 + k) * S * 4, Y(y) + j * S * 6); glow(c3, .8, ia * .6); }
    });
    for (const s0 of [12, 33]) { const k = t - s0; if (k < 0 || k > 8 || !imgs.marty) continue; // transmission de Marty, ancrée aux bouteilles
      const a = A * Math.min(1, k, 8 - k), x = X(.665), y = Y(.06), w = W * .08, h = w * 1.6;
      c.globalCompositeOperation = "screen";
      range(10).forEach(j => { const off = Math.sin(t * 9 + j * 3) * S * 6 * (j % 3 === 0 ? 1 : .2); c.globalAlpha = a * .75; c.drawImage(imgs.marty!, 0, imgs.marty!.height * j / 10, imgs.marty!.width, imgs.marty!.height / 10, x + off, y + h * j / 10, w, h / 10); });
      c.globalCompositeOperation = "lighter"; c.strokeStyle = c1; c.globalAlpha = a; c.lineWidth = S; c.strokeRect(x - 2, y - 2, w + 4, h + 4);
      c.fillStyle = c1; c.font = `${Math.round(S * 9)}px monospace`; c.fillText("TRANSMISSION · MARTY", x, y + h + S * 12); c.fillText("« Mes petites boules à facettes ! »", x - w * .4, y + h + S * 24);
    }
  }
  if (d.id === "kombuchee") {
    const mem = [imgs.natasha, imgs.marty, imgs.plage, imgs.max];
    range(reduced ? 6 : 13).forEach(i => {
      const x = .08 + ((i * .173) % .86) + .015 * Math.sin(t + i), y = -.1 + ((t * .02 + i * .137) % 1.2); // bulles qui descendent : temps inversé
      const r = (.018 + (i % 4) * .01) * W; const img = i % 3 === 0 ? mem[(i / 3) % 4] : undefined;
      c.save(); c.globalAlpha = ia; c.beginPath(); c.arc(X(x), Y(y), r, 0, 6.283);
      if (img) { c.save(); c.clip(); c.globalCompositeOperation = "screen"; c.globalAlpha = ia * .55; const s = r * 2 / Math.min(img.width, img.height); c.drawImage(img, X(x) - img.width * s / 2, Y(y) - img.height * s / 2, img.width * s, img.height * s); c.restore(); }
      c.beginPath(); c.arc(X(x), Y(y), r, 0, 6.283); glow(i % 2 ? c1 : c3, 1.2, ia * .9);
      c.beginPath(); c.arc(X(x) - r * .35, Y(y) - r * .35, r * .18, 0, 6.283); c.fillStyle = "#fff"; c.globalAlpha = ia * .6; c.fill(); c.restore();
    });
    const cx = X(.47), cy = Y(.33), R = W * .035; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); glow(c1, 1.2, ia);
    for (const [len, sp] of [[.8, -1.2], [.55, -.1]]) { const a = -t * -sp - Math.PI / 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(-a) * R * len, cy + Math.sin(-a) * R * len); glow(c2, 1.4, ia); }
  }
  if (d.id === "strawberry") {
    const beat = Math.exp(-((t * 1.6) % 1) * 4); // 96 bpm, pulsation douce (pas de flash)
    [TRACES[5], TRACES[6], TRACES[7], TRACES[8], TRACES[25]].forEach((p, i) => { path(p); glow(i % 2 ? c1 : c3, 2.4, ia * (.45 + .4 * beat)); const k = ((t * .35 + i * .2) % 1); const q = p[Math.floor(k * (p.length - 1))]; c.beginPath(); c.arc(X(q[0]), Y(q[1]), S * 4, 0, 6.283); c.fillStyle = c2; c.globalAlpha = ia; c.fill(); });
    range(24).forEach(i => { const h = (.015 + .05 * Math.abs(Math.sin(i * 1.7 + Math.floor(t * 3.2) * .9)) * (.4 + .6 * beat)) * H; c.fillStyle = i % 2 ? c1 : c2; c.globalAlpha = ia * .55; c.fillRect(X(.625 + i * .015), Y(.5) - h, W * .008, h); });
  }
  if (d.id === "reboot") {
    const cx = X(.47), cy = Y(.31), R = W * .05; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); glow(c1, 1.4, ia); // horloge inversée
    range(12).forEach(i => { const a = -i * .5236; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * .85, cy + Math.sin(a) * R * .85); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); glow(c3, 1, ia); });
    for (const [len, sp] of [[.85, 1.4], [.55, .12]]) { const a = -Math.PI / 2 - t * sp; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R * len, cy + Math.sin(a) * R * len); glow(c2, 1.6, ia); }
    const words = ["SATOR", "AREPO", "TENET", "OPERA", "ROTAS"]; // carré SATOR posé sur le comptoir
    c.save(); c.translate(X(.27), Y(.84)); c.transform(1, 0, -.55, .45, 0, 0); c.rotate(Math.sin(t * .2) * .08);
    const cell = W * .022; c.font = `bold ${Math.round(cell * .8)}px monospace`; c.textAlign = "center"; c.textBaseline = "middle";
    words.forEach((w, r) => w.split("").forEach((ch, k) => { const lit = Math.floor(t * 1.2) % 5 === r; c.globalAlpha = ia * (lit ? 1 : .5); c.fillStyle = lit ? c2 : c1; c.fillText(ch, (k - 2) * cell, (r - 2) * cell); }));
    c.beginPath(); c.rect(-2.5 * cell, -2.5 * cell, 5 * cell, 5 * cell); glow(c1, 1, ia); c.restore();
  }
  c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
}
