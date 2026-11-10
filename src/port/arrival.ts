import { parsePublicFeed } from '../blacklace/sherlock-feed';
import { installNavigation } from './navigation.js';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { MARIE_JEANNE_WELCOME } from '../sherlock/arrival';

const root = document.querySelector<HTMLElement>('#port')!;
const get = (id: string) => document.getElementById(id)!;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let phase = 'quay', line = 0, frame = 0, start = 0, timer = 0;
let renderer: THREE.WebGLRenderer | undefined;
let scene: THREE.Scene, camera: THREE.PerspectiveCamera;
let ready = false;
const canvas = get('title-canvas') as HTMLCanvasElement;
function draw() { if (renderer && ready) renderer.render(scene, camera); }
function dispose() { cancelAnimationFrame(frame); renderer?.dispose(); renderer = undefined; canvas.hidden = true; }
function setPhase(next: string) {
  phase = next; root.dataset.phase = next;
  document.querySelector<HTMLDetailsElement>('.port-tools')!.open = false;
  document.querySelector<HTMLElement>('.landmarks')!.inert = next !== 'explore';
  get('welcome').inert = next !== 'welcome';
  document.querySelector<HTMLElement>('.lowerbar')!.inert = next !== 'explore';
  if (next === 'welcome') {
    dispose(); line = 0; updateLine(); get('next').focus();
  }
  if (next === 'explore') {
    get('skip').hidden = true;
    document.querySelector<HTMLAnchorElement>('.places a')!.focus();
  }
}
function updateLine() {
  get('dialogue').textContent = MARIE_JEANNE_WELCOME[line];
  get('next').textContent = line === 2 ? 'Terminer →' : 'Continuer →';
}
function welcome() { clearTimeout(timer); cancelAnimationFrame(frame); setPhase('welcome'); }
function reveal() {
  setPhase('reveal'); canvas.hidden = true;
  timer = window.setTimeout(welcome, 1300);
}
function animate(now: number) {
  if (phase !== 'crossing') return;
  if (!start) start = now;
  const progress = Math.min(1, (now - start) / 6700);
  // The camera crosses the stationary letter meshes at z=0, and keeps going.
  const t = progress * progress * (3 - 2 * progress);
  camera.position.z = 20 - 24 * t;
  camera.position.y = .12 * Math.sin(t * Math.PI);
  draw();
  if (progress < 1) frame = requestAnimationFrame(animate); else reveal();
}
get('enter').onclick = () => {
  if (phase !== 'quay') return;
  if (reduced.matches || !ready) { welcome(); return; }
  setPhase('crossing'); start = 0; frame = requestAnimationFrame(animate);
};
get('skip').onclick = welcome;
get('next').onclick = () => { if (line < 2) { line++; updateLine(); } else setPhase('explore'); };
get('explore').onclick = () => setPhase('explore');
get('night-toggle').onclick = () => {
  const night = root.dataset.night !== 'true'; root.dataset.night = String(night);
  get('night-toggle').textContent = night ? '☀ Jour' : '☾ Nuit';
  get('night-toggle').setAttribute('aria-pressed', String(night));
};
let pointer: { x: number; y: number; id: number } | undefined;
function parallax(x: number, y: number) {
  if (reduced.matches || phase === 'crossing') return;
  x = Math.max(-1, Math.min(1, x)); y = Math.max(-1, Math.min(1, y));
  root.style.setProperty('--px', String(x)); root.style.setProperty('--py', String(y));
  if (ready && phase === 'quay') { camera.position.x = x * .25; camera.position.y = -y * .15; draw(); }
}
root.onpointerdown = e => {
  if ((e.target as Element).closest('a,button,summary')) return;
  pointer = { x: e.clientX, y: e.clientY, id: e.pointerId }; root.setPointerCapture(e.pointerId);
};
root.onpointermove = e => {
  if (e.pointerType === 'mouse') parallax(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
  else if (pointer?.id === e.pointerId) parallax((pointer.x - e.clientX) / 150, (pointer.y - e.clientY) / 150);
};
root.onpointerup = root.onpointercancel = () => { pointer = undefined; };
get('recenter').onclick = () => parallax(0, 0);
window.onkeydown = e => { if (e.key === 'Escape') { if (phase === 'welcome') setPhase('explore'); else if (phase !== 'explore') welcome(); } };
reduced.onchange = () => { if (reduced.matches && phase === 'crossing') welcome(); parallax(0, 0); };
document.querySelector<HTMLElement>('.landmarks')!.inert = true;
get('welcome').inert = true;
document.querySelector<HTMLElement>('.lowerbar')!.inert = true;

async function init() {
  if (reduced.matches) return;
  const enter = get('enter') as HTMLButtonElement;
  enter.disabled = true;
  enter.textContent = 'Le quai se dessine…';
  let fontTimeout = 0;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: devicePixelRatio < 2 });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .025, 100);
    camera.position.z = 20;
    scene.add(new THREE.HemisphereLight(0xffefd0, 0x26384a, 2.5));
    const light = new THREE.DirectionalLight(0xffd18b, 4); light.position.set(-3, 5, 8); scene.add(light);
    const font = await Promise.race([
      new FontLoader().loadAsync(`${import.meta.env.BASE_URL}port/title-font.json`),
      new Promise<never>((_, reject) => { fontTimeout = window.setTimeout(() => reject(new Error('Font timeout')), 8000); }),
    ]);
    if (phase !== 'quay') { dispose(); return; }
    const geometry = new TextGeometry('BLACKLACE ISLAND', { font, size: 1, depth: .48, curveSegments: 5, bevelEnabled: true, bevelThickness: .025, bevelSize: .018, bevelSegments: 2 });
    geometry.center();
    const mesh = new THREE.Mesh(geometry, [new THREE.MeshStandardMaterial({ color: 0xf2d298, metalness: .4, roughness: .42 }), new THREE.MeshStandardMaterial({ color: 0x80501d, metalness: .3, roughness: .55 })]);
    scene.add(mesh);
    geometry.computeBoundingBox();
    const width = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
    // Leave the centre of the quay as the camera path; individual glyphs remain solid.
    function resize() {
      if (!renderer) return;
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      const visibleWidth = 2 * 20 * Math.tan(THREE.MathUtils.degToRad(24)) * camera.aspect;
      mesh.scale.setScalar(Math.min(1.7, visibleWidth * .90 / width));
      renderer.setSize(innerWidth, innerHeight, false); draw();
    }
    ready = true; get('fallback-title').hidden = true; resize(); window.addEventListener('resize', resize);
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); ready = false; if (phase === 'crossing') welcome(); else get('fallback-title').hidden = false; });
    window.addEventListener('pagehide', () => { geometry.dispose(); (mesh.material as THREE.Material[]).forEach(m => m.dispose()); dispose(); });
  } catch (error) { console.warn('Mode réduit du Seuil :', error); dispose(); }
  finally { clearTimeout(fontTimeout); enter.disabled = false; enter.textContent = 'Entrer sur Blacklace Island →'; }
}
installNavigation(root, reduced, () => phase, setPhase);
void init();

// A quiet local sea bed, generated only following an explicit gesture.
let audio: AudioContext | undefined;
let sea: AudioBufferSourceNode | undefined;
get('sound-toggle').onclick = async () => {
  try {
    if (!audio) {
      audio = new AudioContext();
      const buffer = audio.createBuffer(1, audio.sampleRate * 4, audio.sampleRate);
      const samples = buffer.getChannelData(0);
      let smooth = 0;
      for (let i = 0; i < samples.length; i++) { smooth = (smooth + .025 * (Math.random() * 2 - 1)) / 1.025; samples[i] = smooth * 2; }
      sea = audio.createBufferSource(); sea.buffer = buffer; sea.loop = true;
      const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 600;
      const gain = audio.createGain(); gain.gain.value = .13;
      sea.connect(filter).connect(gain).connect(audio.destination); sea.start();
    } else if (audio.state === 'running') await audio.suspend(); else await audio.resume();
    const on = audio.state === 'running';
    get('sound-toggle').textContent = on ? 'Son : oui' : 'Son : non';
    get('sound-toggle').setAttribute('aria-pressed', String(on));
  } catch { get('sound-toggle').textContent = 'Son indisponible'; }
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden && audio?.state === 'running') {
    void audio.suspend(); get('sound-toggle').textContent = 'Son : non'; get('sound-toggle').setAttribute('aria-pressed', 'false');
  }
});

// Only project verified inhabitants onto the existing places. Movement remains
// authoritative in Sherlock and its existing Rotas/HoloMap renderer.
const endpoint = import.meta.env.VITE_SHERLOCK_PUBLIC_FEED_URL;
let poll = 0;
async function refreshResidents() {
  if (!endpoint || document.hidden) return;
  try {
    const response = await fetch(endpoint, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Sherlock unavailable');
    const entries = parsePublicFeed(await response.json());
    const inhabitants = new Map<string, {place: string; moving: boolean}>();
    for (const entry of entries) {
      if (entry.kind === 'waited') inhabitants.set(entry.actor, {place: entry.place, moving: false});
      if (entry.kind === 'moved') inhabitants.set(entry.actor, {place: entry.to, moving: true});
    }
    for (const landmark of document.querySelectorAll<HTMLElement>('.landmark')) {
      let residents = landmark.querySelector<HTMLElement>('.residents');
      if (!residents) { residents = document.createElement('span'); residents.className = 'residents'; landmark.append(residents); }
      residents.textContent = [...inhabitants].filter(([,value]) => value.place === landmark.dataset.place)
        .map(([name, value]) => `${name === 'marie-jeanne' ? 'Marie Jeanne' : name}${value.moving ? ' · en route' : ''}`).join(' · ');
    }
  } catch { document.querySelectorAll('.residents').forEach(element => element.textContent = ''); }
}
if (endpoint) { void refreshResidents(); poll = window.setInterval(refreshResidents, 15000); }
window.addEventListener('pagehide', () => { clearInterval(poll); clearTimeout(timer); void audio?.close(); });
