import type { DrinkId } from "./drinks";
// Web Audio only, started by an explicit user gesture. Moderate volumes.
export class BarAudio {
  ctx: AudioContext; private master: GainNode; private bus: BiquadFilterNode; private wet: GainNode; private fb: GainNode;
  private seaSrc: AudioBufferSourceNode[] = []; private timers: number[] = []; private trip: { gain: GainNode; nodes: AudioScheduledSourceNode[]; timers: number[] } | null = null;
  constructor() {
    this.ctx = new AudioContext();
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = 0.55; this.master.connect(c.destination);
    this.bus = c.createBiquadFilter(); this.bus.type = "lowpass"; this.bus.frequency.value = 16000;
    const delay = c.createDelay(1); delay.delayTime.value = 0.33;
    this.fb = c.createGain(); this.fb.gain.value = 0; this.wet = c.createGain(); this.wet.gain.value = 0;
    this.bus.connect(this.master); this.bus.connect(delay); delay.connect(this.fb).connect(delay); delay.connect(this.wet).connect(this.master);
    const noise = this.noise(4);
    const layer = (type: BiquadFilterType, f: number, vol: number, lfo: number) => {
      const s = c.createBufferSource(); s.buffer = noise; s.loop = true;
      const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = 0.7;
      const g = c.createGain(); g.gain.value = vol;
      const o = c.createOscillator(); o.frequency.value = lfo; const og = c.createGain(); og.gain.value = vol * 0.7; o.connect(og).connect(g.gain); o.start();
      s.connect(fl).connect(g).connect(this.bus); s.start(); this.seaSrc.push(s);
    };
    layer("lowpass", 420, 0.07, 0.09);   // houle
    layer("bandpass", 750, 0.012, 0.23); // murmure du bar
    const clink = () => { this.tone(2300 + Math.random() * 900, 0.35, 0.018, "sine", this.bus); this.timers.push(window.setTimeout(clink, 5000 + Math.random() * 7000)); };
    this.timers.push(window.setTimeout(clink, 2500));
  }
  private noise(sec: number) { const b = this.ctx.createBuffer(1, this.ctx.sampleRate * sec, this.ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  private tone(freq: number, dur: number, vol: number, type: OscillatorType, out: AudioNode, reverse = false, glideTo?: number) {
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    if (reverse) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.95); g.gain.setValueAtTime(0.0001, t + dur); }
    else { g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
  gulp() { const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noise(0.25); const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 380; const g = c.createGain(); g.gain.setValueAtTime(0.09, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22); s.connect(f).connect(g).connect(this.master); s.start(); }
  startTrip(id: DrinkId) {
    this.stopTrip(); const c = this.ctx, gain = c.createGain(); gain.gain.value = 0; gain.connect(this.bus);
    const nodes: AudioScheduledSourceNode[] = [], timers: number[] = [];
    const drone = (f: number, type: OscillatorType, vol: number) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; const lp = c.createBiquadFilter(); lp.frequency.value = 900; const g = c.createGain(); g.gain.value = vol; o.connect(lp).connect(g).connect(gain); o.start(); nodes.push(o); };
    const every = (ms: number, fn: () => void) => { const id = window.setInterval(fn, ms); timers.push(id); };
    if (id === "violette") { drone(220, "sine", 0.03); every(900, () => this.tone([880, 1175, 1318, 1760][Math.floor(Math.random() * 4)], 1.4, 0.025, "sine", gain)); }
    if (id === "moscomiul") { drone(110, "triangle", 0.05); every(2600, () => this.tone(520, 1.6, 0.04, "sine", gain)); every(700, () => Math.random() < 0.4 && this.tone(1800 + Math.random() * 1500, 0.08, 0.012, "square", gain)); }
    if (id === "kombuchee") { drone(196, "sine", 0.035); every(260, () => Math.random() < 0.6 && this.tone(600 + Math.random() * 900, 0.18, 0.02, "sine", gain, true, 1400 + Math.random() * 600)); }
    if (id === "strawberry") { drone(55, "sawtooth", 0.035); every(625, () => this.tone(120, 0.22, 0.07, "sine", gain, false, 45)); every(312, () => this.tone([440, 554, 659, 880][Math.floor(Math.random() * 4)], 0.12, 0.014, "square", gain)); }
    if (id === "reboot") { drone(196, "sine", 0.03); drone(198.5, "sine", 0.03); every(1000, () => this.tone(3200, 0.12, 0.03, "triangle", gain, true)); }
    this.trip = { gain, nodes, timers };
  }
  /** level 0..1 of the trip; warp 0..1 transforms the whole bar soundscape. */
  update(level: number, warp: number, underwater: boolean) {
    const t = this.ctx.currentTime;
    this.trip?.gain.gain.setTargetAtTime(level, t, 0.3);
    this.bus.frequency.setTargetAtTime(16000 - warp * (underwater ? 15200 : 12000) - level * 2000, t, 0.4);
    this.wet.gain.setTargetAtTime(warp * 0.35 + level * 0.1, t, 0.4); this.fb.gain.setTargetAtTime(warp * 0.45, t, 0.4);
    this.seaSrc.forEach(s => s.playbackRate.setTargetAtTime(1 - warp * 0.3, t, 0.5));
  }
  stopTrip() {
    if (!this.trip) return; const { gain, nodes, timers } = this.trip; this.trip = null;
    timers.forEach(clearInterval); gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
    nodes.forEach(n => n.stop(this.ctx.currentTime + 0.4)); this.update(0, 0, false);
  }
  close() { this.timers.forEach(clearTimeout); this.stopTrip(); void this.ctx.close(); }
}
