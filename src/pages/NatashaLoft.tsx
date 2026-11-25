import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { NatashaConversation } from "@/components/world/NatashaConversation";
import { poseNatashaSeated } from "@/components/world/natasha-seated";
import "@/styles/natasha-loft.css";

const assets = import.meta.env.BASE_URL;

function contactShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) return;
  const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 31);
  gradient.addColorStop(0, "rgba(43, 24, 13, 0.62)");
  gradient.addColorStop(0.55, "rgba(43, 24, 13, 0.32)");
  gradient.addColorStop(1, "rgba(43, 24, 13, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(canvas),
    transparent: true,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.93), material);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(-0.11, 0.002, 0.21);
  return shadow;
}

function disposeAvatar(model: THREE.Object3D) {
  const resources = new Set<{ dispose(): void }>();
  const images = new Set<ImageBitmap>();
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    resources.add(object.geometry);
    if (object instanceof THREE.SkinnedMesh) resources.add(object.skeleton);
    for (const material of [object.material].flat()) {
      resources.add(material);
      for (const value of Object.values(material)) {
        if (!(value instanceof THREE.Texture)) continue;
        resources.add(value);
        if (typeof ImageBitmap !== "undefined" && value.image instanceof ImageBitmap) images.add(value.image);
      }
    }
  });
  resources.forEach((resource) => resource.dispose());
  images.forEach((image) => image.close());
}

export default function NatashaLoft() {
  const viewport = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const touch = useRef<{ id: number; x: number; y: number }>();
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const host = canvasHost.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setStatus("failed");
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.domElement.setAttribute("aria-label", "Natasha assise sur le tapis");
    renderer.domElement.setAttribute("role", "img");
    host.append(renderer.domElement);

    const scene = new THREE.Scene();
    const shadow = contactShadow();
    scene.add(new THREE.HemisphereLight(0xffeee0, 0x746353, 2.2));
    const windowLight = new THREE.DirectionalLight(0xffdec0, 2.0);
    windowLight.position.set(3, 4, 2);
    scene.add(windowLight);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 20);
    camera.position.set(0.74, 1.25, 3.2);
    camera.lookAt(0, 0.52, 0.2);

    const draw = () => {
      const { clientWidth: width, clientHeight: height } = host;
      if (!width || !height) return;
      const halfHeight = Math.max(0.92, 0.5 * height / width);
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.right = halfHeight * width / height;
      camera.left = -camera.right;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(draw);
    observer.observe(host);

    const request = new AbortController();
    let model: THREE.Group | undefined;
    const load = async () => {
      try {
        const response = await fetch(`${assets}avatars/natasha.glb`, { signal: request.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = await response.arrayBuffer();
        request.signal.throwIfAborted();
        const { scene: avatar } = await new GLTFLoader().parseAsync(bytes, "");
        if (request.signal.aborted) {
          disposeAvatar(avatar);
          return;
        }
        model = avatar;
        poseNatashaSeated(avatar);
        scene.add(avatar);
        if (shadow) scene.add(shadow);
        draw();
        setStatus("ready");
      } catch {
        if (model) {
          model.removeFromParent();
          disposeAvatar(model);
          model = undefined;
        }
        if (!request.signal.aborted) setStatus("failed");
      }
    };
    void load();

    return () => {
      request.abort();
      observer.disconnect();
      if (model) disposeAvatar(model);
      if (shadow) disposeAvatar(shadow);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  function setParallax(x: number, y: number) {
    viewport.current?.style.setProperty("--loft-x", String(THREE.MathUtils.clamp(x, -1, 1)));
    viewport.current?.style.setProperty("--loft-y", String(THREE.MathUtils.clamp(y, -1, 1)));
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      const bounds = event.currentTarget.getBoundingClientRect();
      setParallax(2 * (event.clientX - bounds.left) / bounds.width - 1,
        2 * (event.clientY - bounds.top) / bounds.height - 1);
    } else if (touch.current?.id === event.pointerId) {
      setParallax((event.clientX - touch.current.x) / 90, (event.clientY - touch.current.y) / 90);
    }
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" && touch.current?.id !== event.pointerId) return;
    touch.current = undefined;
    setParallax(0, 0);
  }

  return (
    <main className="natasha-loft">
      <header className="natasha-loft-header">
        <Link to="/atlas">← Retour à l’atlas</Link>
        <h1>Le loft de Natasha</h1>
      </header>
      <div
        className="natasha-loft-view"
        ref={viewport}
        onPointerMove={move}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" || touch.current) return;
          touch.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerLeave={(event) => { if (event.pointerType === "mouse") release(event); }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <img className="natasha-loft-room" src={`${assets}assets/rotas/natasha-loft.webp`} alt="" />
        <div className="natasha-loft-avatar" ref={canvasHost} />
      </div>
      <footer className="natasha-loft-controls">
        {status === "loading" && <p role="status">Chargement de Natasha…</p>}
        {status === "failed" && <p role="status">L’avatar de Natasha n’a pas pu être affiché.</p>}
        <NatashaConversation onOpenChange={() => setParallax(0, 0)} />
      </footer>
    </main>
  );
}
