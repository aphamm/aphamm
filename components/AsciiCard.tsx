import { useEffect, useRef } from "react";
import { shapes, type ShapeFn } from "../lib/shapes";

interface Props {
  title: string;
  description: string;
  tag: string;
  chars: string;
  shape: string;
  seed: number;
}

export default function AsciiCard({
  title,
  description,
  tag,
  chars,
  shape,
  seed,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 256;
    const h = 224;
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const fontSize = 10;
    const charWidth = fontSize * 0.62;
    const cols = Math.floor(w / charWidth);
    const rows = Math.floor(h / fontSize);

    const shapeFn: ShapeFn = shapes[shape] || shapes.blob;

    // seeded random for char selection
    let s = seed;
    const rand = () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };

    const charGrid: string[][] = [];
    for (let r = 0; r < rows; r++) {
      charGrid[r] = [];
      for (let c = 0; c < cols; c++) {
        charGrid[r][c] = chars[Math.floor(rand() * chars.length)];
      }
    }

    let time = 0;

    const draw = () => {
      time += 0.015;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = c / cols;
          const ny = r / rows;
          const density = shapeFn(nx, ny, time);

          if (density > 0.05) {
            // bright core vs dim edges
            const bright = density > 0.7;
            const r2 = bright ? 100 : 140;
            const g2 = bright ? 100 : 140;
            const b2 = bright ? 220 : 200;
            ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${density * 0.8})`;
            ctx.fillText(charGrid[r][c], c * charWidth, r * fontSize);
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frameRef.current);
  }, [seed, chars, shape]);

  return (
    <div
      style={{
        width: 256,
        height: 368,
        background: "#f8f8f6",
        borderRadius: 4,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        filter: "url(#warp)",
      }}
    >
      <Corner top left />
      <Corner top right />
      <Corner bottom left />
      <Corner bottom right />

      <div style={{ flex: 1, padding: "20px 16px 0" }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>

      <div style={{ padding: "16px 20px 20px" }}>
        <p
          style={{
            fontFamily: "var(--font-signifier)",
            fontSize: 14,
            fontWeight: 300,
            color: "#1a1a1a",
            lineHeight: 1.4,
            marginBottom: 6,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: "var(--font-signifier)",
            fontSize: 11,
            fontWeight: 200,
            color: "#aaa",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function Corner({
  top,
  right,
  bottom,
  left,
}: {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: 14,
        height: 14,
        ...(top ? { top: -2 } : {}),
        ...(bottom ? { bottom: -2 } : {}),
        ...(left ? { left: -2 } : {}),
        ...(right ? { right: -2 } : {}),
        borderColor: "#ddd",
        borderStyle: "solid",
        borderWidth: 0,
        ...(top ? { borderTopWidth: 1.5 } : {}),
        ...(bottom ? { borderBottomWidth: 1.5 } : {}),
        ...(left ? { borderLeftWidth: 1.5 } : {}),
        ...(right ? { borderRightWidth: 1.5 } : {}),
      }}
    />
  );
}
