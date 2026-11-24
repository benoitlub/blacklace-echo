import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type Person = { group: THREE.Group; baseX: number; baseZ: number; phase: number };

function makePerson(color: number, x: number, z: number, scale = 1) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.85, 4, 10), new THREE.MeshStandardMaterial({ color }));
  body.position.y = 1.05;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe8b78e }));
  head.position.y = 1.85;
  group.add(body, head);
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.56, 4, 8), new THREE.MeshStandardMaterial({ color: 0x29313d }));
    leg.position.set(side * 0.14, 0.37, 0);
    group.add(leg);
  }
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  return group;
}

function sign(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Group();
  context.fillStyle = "#101520"; context.fillRect(0, 0, 512, 128);
  context.strokeStyle = color; context.lineWidth = 9; context.strokeRect(7, 7, 498, 114);
  context.fillStyle = color; context.font = "bold 44px sans-serif"; context.textAlign = "center";
  context.fillText(text, 256, 79);
  const texture = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.82), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
  const group = new THREE.Group(); group.add(mesh); return group;
}

function poseNatasha(model: THREE.Group) {
  const bone = (name: string) => {
    const node = model.getObjectByName(name);
    if (!(node instanceof THREE.Bone)) throw new Error(`Articulation Natasha manquante : ${name}`);
    return node;
  };

  // Keep the leg rig in its reference pose so the feet stay planted.
  bone("Spine").rotateZ(-0.055);
  bone("Spine1").rotateY(0.075);
  bone("Head").rotateY(-0.16);
  bone("Head").rotateZ(0.035);

  // Aim each upper arm and forearm in world space, then apply the
  // correction in its parent's frame to preserve the rig's wrist twist.
  function aim(joint: THREE.Bone, child: THREE.Bone, direction: THREE.Vector3) {
    const origin = joint.getWorldPosition(new THREE.Vector3());
    const current = child.getWorldPosition(new THREE.Vector3()).sub(origin).normalize();
    const correction = new THREE.Quaternion().setFromUnitVectors(current, direction.normalize());
    const parent = joint.parent!.getWorldQuaternion(new THREE.Quaternion());
    joint.quaternion.premultiply(parent.clone().invert().multiply(correction).multiply(parent));
  }

  aim(bone("LeftArm"), bone("LeftForeArm"), new THREE.Vector3(0.2, -1, -0.08));
  aim(bone("LeftForeArm"), bone("LeftHand"), new THREE.Vector3(0.02, -1, 0.16));
  aim(bone("RightArm"), bone("RightForeArm"), new THREE.Vector3(-0.23, -1, -0.02));
  aim(bone("RightForeArm"), bone("RightHand"), new THREE.Vector3(-0.06, -1, 0.22));

  // Compute bounds after skinning so the shoes sit on the street plane.
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model, true);
  const height = bounds.max.y - bounds.min.y;
  if (!Number.isFinite(height) || height <= 0) throw new Error("Dimensions de Natasha invalides.");
  const scale = 1.72 / height;
  model.scale.multiplyScalar(scale);
  model.position.set(2.05, -bounds.min.y * scale, -3.1);
  model.rotation.y = -0.28;
}

function disposeStreetMeshes(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const skeletons = new Set<THREE.Skeleton>();
  const images = new Set<ImageBitmap>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (object instanceof THREE.SkinnedMesh) skeletons.add(object.skeleton);
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });
  skeletons.forEach((skeleton) => skeleton.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  for (const texture of textures) {
    if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) images.add(texture.image);
    texture.dispose();
  }
  images.forEach((image) => image.close());
}

export default function RotasLivingStreet() {
  const mount = useRef<HTMLDivElement>(null);
  const movement = useRef({ x: 0, y: 0 });
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [notice, setNotice] = useState("Glisse le doigt pour regarder derrière Marty.");
  const [revealed, setRevealed] = useState(false);
  const [natashaStatus, setNatashaStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x182638);
    scene.fog = new THREE.Fog(0x182638, 15, 36);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
    camera.position.set(0, 2.4, 8.8);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0x9bd6ff, 0x3c263c, 2.1));
    const sun = new THREE.DirectionalLight(0xffc08c, 2.5);
    sun.position.set(-5, 10, 5); scene.add(sun);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(15, 45), new THREE.MeshStandardMaterial({ color: 0x6c6570, roughness: 0.85 }));
    ground.rotation.x = -Math.PI / 2; ground.position.z = -9; scene.add(ground);
    const wallMaterial = [0xdba78d, 0xc8a4a7, 0x9c93ac, 0xe2b98b];
    for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
      const height = 4.2 + (i % 3) * 0.8;
      const building = new THREE.Mesh(new THREE.BoxGeometry(3.8, height, 4), new THREE.MeshStandardMaterial({ color: wallMaterial[(i + (side === 1 ? 1 : 0)) % 4] }));
      building.position.set(side * 5.2, height / 2, 3 - i * 5);
      scene.add(building);
      for (let floor = 1; floor < 3; floor++) {
        const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.95), new THREE.MeshStandardMaterial({ color: 0x24364b, emissive: 0x172536, emissiveIntensity: 0.35 }));
        windowMesh.position.set(side * 3.285, floor * 1.35 + 0.7, 3 - i * 5);
        windowMesh.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
        scene.add(windowMesh);
      }
    }
    // The shop is a real object behind Marty's foreground position, not a UI overlay.
    const shop = sign("PRO.HIBITED", "#fa55cd");
    shop.position.set(-3.24, 2.75, 0.9); shop.rotation.y = Math.PI / 2; scene.add(shop);
    const tea = sign("SALON DE THÉ", "#f7c77a");
    tea.position.set(3.24, 2.75, -5); tea.rotation.y = -Math.PI / 2; scene.add(tea);
    const characters: Person[] = [
      { group: makePerson(0x2d4969, -1.55, 4.2, 1.18), baseX: -1.55, baseZ: 4.2, phase: 0 },
      { group: makePerson(0x385d53, 0.4, -2.5, 0.85), baseX: 0.4, baseZ: -2.5, phase: 2 },
      { group: makePerson(0xb76b5d, 1.25, -3.3, 0.85), baseX: 1.25, baseZ: -3.3, phase: 3 },
    ];
    characters.forEach(p => scene.add(p.group));

    const avatarRequest = new AbortController();
    let avatar: THREE.Group | undefined;
    const loadNatasha = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}avatars/natasha.glb`, {
          signal: avatarRequest.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = await response.arrayBuffer();
        avatarRequest.signal.throwIfAborted();
        const { scene: model } = await new GLTFLoader().parseAsync(bytes, "");
        if (avatarRequest.signal.aborted) {
          disposeStreetMeshes(model);
          return;
        }
        avatar = model;
        poseNatasha(model);
        scene.add(model);
        setNatashaStatus("ready");
      } catch {
        if (avatar) disposeStreetMeshes(avatar);
        if (!avatarRequest.signal.aborted) setNatashaStatus("failed");
      }
    };
    void loadNatasha();
    let width = 1; let height = 1;
    const resize = () => {
      width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    let down = false; let lastX = 0; let lastY = 0;
    const pointerDown = (e: PointerEvent) => { down = true; lastX = e.clientX; lastY = e.clientY; renderer.domElement.setPointerCapture(e.pointerId); };
    const pointerMove = (e: PointerEvent) => {
      if (!down) return;
      movement.current.x = THREE.MathUtils.clamp(movement.current.x + (e.clientX - lastX) / width * 3, -1.5, 1.5);
      movement.current.y = THREE.MathUtils.clamp(movement.current.y + (e.clientY - lastY) / height, -0.5, 0.5);
      lastX = e.clientX; lastY = e.clientY;
    };
    const pointerUp = () => { down = false; };
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    const clock = new THREE.Clock();
    let frame = 0; let lastReveal = false;
    const render = () => {
      frame = requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, movement.current.x * 2.2, 0.065);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.4 + movement.current.y, 0.065);
      camera.lookAt(0, 1.55, -3);
      characters.forEach((p, i) => {
        p.group.rotation.y = i === 0 ? Math.sin(t * 0.6 + p.phase) * 0.15 : 0;
        p.group.position.y = Math.sin(t * 2 + p.phase) * 0.025;
        if (i > 0) p.group.position.z = p.baseZ - (Math.sin(t * 0.3) + 1) * 0.55;
      });
      const visible = Math.abs(camera.position.x) > 1.25;
      if (visible !== lastReveal) { lastReveal = visible; setRevealed(visible); }
      renderer.render(scene, camera);
    };
    render();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      avatarRequest.abort();
      disposeStreetMeshes(scene);
      renderer.dispose(); host.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!tiltEnabled) return;
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma == null) return;
      movement.current.x = THREE.MathUtils.clamp(event.gamma / 24, -1.5, 1.5);
      movement.current.y = THREE.MathUtils.clamp((event.beta ?? 0) / 100, -0.5, 0.5);
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, [tiltEnabled]);

  const enableTilt = async () => {
    try {
      const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
      if (typeof orientation.requestPermission === "function") {
        if (await orientation.requestPermission() !== "granted") { setNotice("Capteurs refusés : utilise le glissement du doigt."); return; }
      }
      setTiltEnabled(true); setNotice("Incline doucement le téléphone. Tu peux aussi glisser le doigt.");
    } catch { setNotice("Capteurs indisponibles : utilise le glissement du doigt."); }
  };

  return <main style={{ minHeight: "100dvh", background: "#101923", color: "#f9e9d9", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
    <header style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div><strong>BLACKLACE ISLAND · ROTAS</strong><div style={{ fontSize: 12, opacity: 0.7 }}>Prototype 3D — rue de Rotas</div></div>
      <a href={`${import.meta.env.BASE_URL}port/`} style={{ color: "#ffcc9b" }}>← Retour au port</a>
    </header>
    <div ref={mount} aria-label="Scène 3D interactive dans une rue de Rotas" style={{ flex: 1, minHeight: "65dvh", position: "relative" }} />
    <footer style={{ padding: "12px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <button onClick={enableTilt} disabled={tiltEnabled} style={{ padding: "10px 15px", borderRadius: 12, background: "#f4b76d", color: "#15151a", border: 0, fontWeight: 700 }}>{tiltEnabled ? "Capteurs activés" : "Activer l'inclinaison"}</button>
      <span role="status" style={{ fontSize: 14 }}>{revealed ? "👀 Tu as changé de perspective ! Cherche la boutique Pro.Hibited." : notice}</span>
      <span role="status" style={{ fontSize: 14 }}>
        {natashaStatus === "ready" ? "Natasha est devant le salon de thé."
          : natashaStatus === "failed" ? "Natasha n’a pas pu être chargée."
          : "Chargement de Natasha…"}
      </span>
    </footer>
  </main>;
}
