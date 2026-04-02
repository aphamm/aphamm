import { useEffect, useRef } from "react";
import type { Write } from "../lib/produced";
import AsciiCard from "./AsciiCard";

const SLAT_GAP = 36;
const CARD_WIDTH = 256;

interface Props {
  items: Write[];
}

export default function Carousel({ items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollOffset = useRef(0);
  const frameRef = useRef(0);
  const smoothVel = useRef(0);

  const slatCount = items.length;

  useEffect(() => {
    let momentum = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      momentum += (e.deltaY + e.deltaX) * 0.1;
    };

    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let lastDragX = 0;

    const onDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      lastDragX = e.clientX;
      dragStartOffset = scrollOffset.current;
      momentum = 0;
    };
    const onUp = () => {
      isDragging = false;
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = lastDragX - e.clientX;
      lastDragX = e.clientX;
      momentum = delta * 0.8;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);

    const copies = 3;
    const visibleSlats = slatCount * copies;
    const wrapWidth = visibleSlats * (CARD_WIDTH + SLAT_GAP);

    const animate = () => {
      const prev = scrollOffset.current;

      // apply momentum with friction
      scrollOffset.current += momentum;
      momentum *= 0.95;

      // smooth velocity — fast decay back to rest
      const rawVel = Math.abs(scrollOffset.current - prev);
      const lerp = rawVel > smoothVel.current ? 0.1 : 0.25;
      smoothVel.current += (rawVel - smoothVel.current) * lerp;
      const vel = Math.min(smoothVel.current, 12);
      const intensity = vel / 12;

      // update fractal noise warp
      const warpEl = document.getElementById("warp-displacement");
      if (warpEl) {
        warpEl.setAttribute("scale", `${intensity * 8}`);
      }

      const container = containerRef.current;
      if (!container) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const slats = container.children;
      const viewCenter = window.innerWidth / 2;
      const spread = window.innerWidth * 0.5;

      for (let i = 0; i < slats.length; i++) {
        const baseX = i * (CARD_WIDTH + SLAT_GAP);
        let x = baseX - scrollOffset.current;
        x = ((x % wrapWidth) + wrapWidth) % wrapWidth;
        x -= wrapWidth / 2 - viewCenter;

        const slatCenter = x + CARD_WIDTH / 2;
        const distNorm = (slatCenter - viewCenter) / spread;
        const absDist = Math.abs(distNorm);
        const proximity = Math.max(0, 1 - absDist);

        // fisheye: only active when scrolling
        // at rest (intensity=0): no rotation, no scale change
        // at speed: center bulges out, edges rotate away
        const rotateY = distNorm * 55 * intensity;
        const fisheye = proximity * proximity;
        const scale =
          1 + fisheye * 0.12 * intensity - absDist * 0.08 * intensity;
        const translateZ = -absDist * 80 * intensity;
        // fade edges
        const edgeThreshold = 0.8;
        const opacity =
          absDist > edgeThreshold
            ? Math.max(0, 1 - (absDist - edgeThreshold) / 0.3)
            : 1;

        const el = slats[i] as HTMLElement;
        el.style.transform = [
          `translateX(${x}px)`,
          `perspective(1200px)`,
          `rotateY(${rotateY}deg)`,
          `translateZ(${translateZ}px)`,
          `scale(${scale})`,
        ].join(" ");
        el.style.opacity = `${opacity}`;
        el.style.zIndex = `${Math.round(fisheye * 100)}`;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, [slatCount]);

  const allItems = Array.from(
    { length: slatCount * 3 },
    (_, i) => items[i % slatCount],
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: 500,
        overflow: "hidden",
        cursor: "grab",
      }}
    >
      {allItems.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            marginTop: -184,
            transformOrigin: "center center",
            willChange: "transform, filter",
          }}
        >
          <AsciiCard
            title={item.title}
            description={item.description}
            tag={item.links[0]?.label ?? ""}
            chars={item.chars || "01"}
            shape={item.shape || "blob"}
            seed={((i % slatCount) + 1) * 7919}
          />
        </div>
      ))}
    </div>
  );
}
