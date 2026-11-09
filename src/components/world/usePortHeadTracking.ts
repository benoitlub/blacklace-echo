import { useEffect, useRef, useState } from "react";

const VISION = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21";
const MODEL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

type Box = { originX: number; originY: number; width: number; height: number };
type Detector = {
  detectForVideo(video: HTMLVideoElement, timestamp: number): { detections: { boundingBox?: Box }[] };
  close(): void;
};

export function usePortHeadTracking(onLook: (x: number, y: number) => void, reducedMotion: boolean) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const neutral = useRef<{ x: number; y: number } | null>(null);
  const look = useRef(onLook);
  look.current = onLook;

  useEffect(() => {
    if (!enabled) return;
    if (reducedMotion) { setEnabled(false); return; }
    let active = true;
    let stream: MediaStream | undefined;
    let detector: Detector | undefined;
    let timer: number | undefined;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    neutral.current = null;

    const onVisibility = () => { if (document.hidden) setEnabled(false); };
    document.addEventListener("visibilitychange", onVisibility);
    setMessage("Activation de la caméra…");

    async function start() {
      try {
        const camera = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
          audio: false,
        });
        if (!active) { camera.getTracks().forEach(track => track.stop()); return; }
        stream = camera;
        video.srcObject = camera;
        await video.play();
        if (!active) return;
        const { FilesetResolver, FaceDetector } = await import(/* @vite-ignore */ `${VISION}/vision_bundle.mjs`);
        if (!active) return;
        const files = await FilesetResolver.forVisionTasks(`${VISION}/wasm`);
        if (!active) return;
        const instance: Detector = await FaceDetector.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL, delegate: "CPU" },
          runningMode: "VIDEO",
        });
        if (!active) { instance.close(); return; }
        detector = instance;
        setMessage("Place ton visage face à l’écran pour calibrer.");
        let frame = -1;
        const sample = () => {
          if (!active) return;
          try {
            if (video.readyState >= 2 && video.currentTime !== frame) {
              frame = video.currentTime;
              const face = instance.detectForVideo(video, performance.now()).detections[0]?.boundingBox;
              if (face && video.videoWidth && video.videoHeight) {
                const x = (face.originX + face.width / 2) / video.videoWidth;
                const y = (face.originY + face.height / 2) / video.videoHeight;
                if (!neutral.current) {
                  neutral.current = { x, y };
                  setMessage("Suivi actif · les images restent sur cet appareil.");
                }
                look.current((neutral.current.x - x) * 6, (y - neutral.current.y) * 6);
              }
            }
            timer = window.setTimeout(sample, 80);
          } catch { fail(); }
        };
        sample();
      } catch { if (active) fail(); }
    }

    function fail() {
      setEnabled(false);
      setMessage("Suivi indisponible. La souris et le tactile restent actifs.");
    }

    void start();
    return () => {
      active = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      stream?.getTracks().forEach(track => track.stop());
      video.pause();
      video.srcObject = null;
      detector?.close();
      look.current(0, 0);
    };
  }, [enabled, reducedMotion]);

  function toggle() {
    if (enabled) { setEnabled(false); setMessage(""); return; }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Caméra indisponible. La souris et le tactile restent actifs.");
      return;
    }
    setEnabled(true);
  }

  function recenter() {
    neutral.current = null;
    look.current(0, 0);
  }

  return { enabled: enabled && !reducedMotion, message: reducedMotion ? "" : message, toggle, recenter };
}
