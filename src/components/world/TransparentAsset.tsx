import { useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  draggable?: boolean;
};

function shouldRemoveCheckerPixel(r: number, g: number, b: number, a: number) {
  if (a < 12) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (r + g + b) / 3;

  // The generated assets currently contain a baked white/light-grey checkerboard.
  // Neutral bright pixels are background; warm stones, teal domes and gold details are preserved.
  return avg > 232 && max - min < 12;
}

export default function TransparentAsset({ src, alt, className, draggable = false }: Props) {
  const [cleanSrc, setCleanSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        if (mounted) setCleanSrc(src);
        return;
      }

      context.drawImage(image, 0, 0);

      try {
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = frame.data;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (shouldRemoveCheckerPixel(r, g, b, a)) {
            pixels[i + 3] = 0;
          }
        }

        context.putImageData(frame, 0, 0);
        if (mounted) setCleanSrc(canvas.toDataURL("image/png"));
      } catch {
        if (mounted) setCleanSrc(src);
      }
    };

    image.onerror = () => {
      if (mounted) setCleanSrc(src);
    };

    image.src = src;

    return () => {
      mounted = false;
    };
  }, [src]);

  return (
    <img
      className={className}
      src={cleanSrc ?? src}
      alt={alt}
      draggable={draggable}
      style={{ opacity: cleanSrc ? undefined : 0.01 }}
    />
  );
}
