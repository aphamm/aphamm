import { useEffect, useRef, useState } from "react";
import { shapes, type ShapeFn } from "../lib/shapes";

interface Link {
  label: string;
  href: string;
}

interface Props {
  title: string;
  description: string;
  details?: string;
  chars: string;
  charSize?: number;
  shape: string;
  links?: Link[];
  seed: number;
  expandLevel?: number;
}

function renderDescriptionWithLinks(text: string, links?: Link[]) {
  if (!links || links.length === 0) return text;

  const parts: (string | JSX.Element)[] = [];
  let remaining = text;

  for (const link of links) {
    const idx = remaining.indexOf(link.label);
    if (idx === -1) continue;

    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(
      <a
        key={link.href}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "var(--font-signifier)",
          fontSize: 11,
          fontWeight: 200,
          color: "#aaa",
          textTransform: "none",
          letterSpacing: "0",
          textDecoration: "underline",
          textUnderlineOffset: 2,
        }}
      >
        {link.label}
      </a>,
    );
    remaining = remaining.slice(idx + link.label.length);
  }

  if (remaining) parts.push(remaining);
  return parts;
}

export default function AsciiCard({
  title,
  description,
  details,
  chars,
  charSize = 10,
  shape,
  links,
  seed,
  expandLevel = 0,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

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

    const fontSize = charSize;
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
      time += 0.012;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = c / cols;
          const ny = r / rows;
          const density = shapeFn(nx, ny, time);

          if (density > 0.05) {
            const bright = density > 0.7;
            const shade = bright ? 50 : 90;
            ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${density * 0.75})`;
            ctx.fillText(charGrid[r][c], c * charWidth, r * fontSize);
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frameRef.current);
  }, [seed, chars, shape]);

  const isExpanded = expandLevel >= 1;
  const showMetrics = expandLevel >= 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animation: "fadeIn 0.8s ease both",
      }}
    >
      {/* main card — slides up when expanded */}
      <div
        className={undefined}
        style={{
          width: 256,
          height: 368,
          background: "transparent",
          borderRadius: 4,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
          transition:
            "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease",
          transform: isExpanded ? "translateY(-60px)" : "translateY(0)",
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
            {renderDescriptionWithLinks(description, links)}
          </p>
        </div>
      </div>

      {/* metrics panel — appears below */}
      <div
        style={{
          width: 256,
          background: "transparent",
          borderRadius: 4,
          padding: "20px",
          position: "relative",
          transition:
            "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s",
          transform: showMetrics ? "translateY(-60px)" : "translateY(20px)",
          opacity: showMetrics ? 1 : 0,
          pointerEvents: showMetrics ? "auto" : "none",
        }}
      >
        <Corner top left />
        <Corner top right />
        <Corner bottom left />
        <Corner bottom right />

        <p
          style={{
            fontFamily: "var(--font-signifier)",
            fontSize: 11,
            fontWeight: 200,
            color: "#555",
            lineHeight: 1.8,
          }}
        >
          {details}
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
