import { useEffect, useRef, useState, useCallback } from "react";
import type { Write } from "../lib/produced";
import AsciiCard from "./AsciiCard";

const SLAT_GAP = 64;
const CARD_WIDTH = 256;
const MOBILE_CARD_WIDTH = 220;
const MOBILE_GAP = 24;

interface Props {
  items: Write[];
}

export default function Carousel({ items }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollOffset = useRef(0);
  const frameRef = useRef(0);
  const smoothVel = useRef(0);
  const isMobileRef = useRef(false);
  const focusedIdx = useRef(0);
  const targetScrollRef = useRef<number | null>(null);
  const [expandState, setExpandState] = useState<{
    idx: number;
    level: number;
  }>({ idx: -1, level: 0 });
  const expandStateRef = useRef(expandState);
  expandStateRef.current = expandState;
  const expandProgress = useRef(0);
  const desktopSnapRef = useRef<() => number>(() => 0);
  const desktopIdxRef = useRef<(s: number) => number>(() => 0);
  const mobileSnapRef = useRef<() => number>(() => 0);
  const mobileIdxRef = useRef<(s: number) => number>(() => 0);
  const dragDistRef = useRef(0);

  const slatCount = items.length;

  const scrollToIndex = useCallback(
    (idx: number) => {
      const mobile = isMobileRef.current;
      const cardW = mobile ? MOBILE_CARD_WIDTH : CARD_WIDTH;
      const gap = mobile ? MOBILE_GAP : SLAT_GAP;
      const cardStep = cardW + gap;
      const wrapHalf = (slatCount * 3 * cardStep) / 2;
      targetScrollRef.current =
        (slatCount + idx) * cardStep - wrapHalf + cardW / 2;
    },
    [slatCount],
  );

  useEffect(() => {
    let targetMomentum = 0;
    let smoothMomentum = 0;
    let snapVelocity = 0;
    isMobileRef.current = window.innerWidth < 768;

    // center on the middle card of the middle copy
    const mobile = isMobileRef.current;
    const cardW = mobile ? MOBILE_CARD_WIDTH : CARD_WIDTH;
    const gap = mobile ? MOBILE_GAP : SLAT_GAP;
    const middleIdx = slatCount + Math.floor(slatCount / 2);
    const initStep = cardW + gap;
    const initWrapHalf = (slatCount * 3 * initStep) / 2;
    scrollOffset.current = middleIdx * initStep - initWrapHalf + cardW / 2;

    const desktopCardStep = CARD_WIDTH + SLAT_GAP;
    const desktopWrapHalf = (slatCount * 3 * desktopCardStep) / 2;

    const desktopSnap = () => {
      const raw = scrollOffset.current + desktopWrapHalf - CARD_WIDTH / 2;
      return (
        Math.round(raw / desktopCardStep) * desktopCardStep -
        desktopWrapHalf +
        CARD_WIDTH / 2
      );
    };

    const desktopIdxAtScroll = (s: number) => {
      const raw = Math.round(
        (s + desktopWrapHalf - CARD_WIDTH / 2) / desktopCardStep,
      );
      return ((raw % slatCount) + slatCount) % slatCount;
    };

    desktopSnapRef.current = desktopSnap;
    desktopIdxRef.current = desktopIdxAtScroll;

    let wheelYAccum = 0;
    const WHEEL_Y_THRESHOLD = 80;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > absY) {
        // horizontal scroll — carousel movement
        if (expandStateRef.current.level > 0) return;
        targetMomentum += e.deltaX * 0.08;
        targetScrollRef.current = null;
        wheelYAccum = 0;
      } else {
        // vertical scroll — expand/collapse
        wheelYAccum += e.deltaY;
        if (
          wheelYAccum > WHEEL_Y_THRESHOLD &&
          expandStateRef.current.level === 0
        ) {
          const snapped = desktopSnap();
          targetScrollRef.current = snapped;
          snapVelocity = 0;
          focusedIdx.current = desktopIdxAtScroll(snapped);
          setExpandState({ idx: focusedIdx.current, level: 2 });
          wheelYAccum = 0;
        } else if (
          wheelYAccum < -WHEEL_Y_THRESHOLD &&
          expandStateRef.current.level > 0
        ) {
          setExpandState({ idx: -1, level: 0 });
          wheelYAccum = 0;
        }
      }
    };

    let isDragging = false;
    let lastDragX = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (expandStateRef.current.level > 0) return;
      isDragging = true;
      lastDragX = e.clientX;
      dragDistRef.current = 0;
      targetMomentum = 0;
      smoothMomentum = 0;
      targetScrollRef.current = null;
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      dragDistRef.current += Math.abs(e.clientX - lastDragX);
      const delta = lastDragX - e.clientX;
      lastDragX = e.clientX;
      targetMomentum = delta * 0.6;
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchHandled = false;

    const mobileSnap = () => {
      const cardStep = MOBILE_CARD_WIDTH + MOBILE_GAP;
      const wrapHalf = (slatCount * 3 * cardStep) / 2;
      const raw = scrollOffset.current + wrapHalf - MOBILE_CARD_WIDTH / 2;
      return (
        Math.round(raw / cardStep) * cardStep - wrapHalf + MOBILE_CARD_WIDTH / 2
      );
    };

    const mobileIdxAtScroll = (s: number) => {
      const cardStep = MOBILE_CARD_WIDTH + MOBILE_GAP;
      const wrapHalf = (slatCount * 3 * cardStep) / 2;
      const raw = Math.round((s + wrapHalf - MOBILE_CARD_WIDTH / 2) / cardStep);
      return ((raw % slatCount) + slatCount) % slatCount;
    };

    mobileSnapRef.current = mobileSnap;
    mobileIdxRef.current = mobileIdxAtScroll;

    let isSwiping = false;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchHandled = false;
      isSwiping = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > 10 || dy > 10) {
        isSwiping = true;
        e.preventDefault();
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchHandled) return;
      const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
      const dy = (e.changedTouches[0]?.clientY ?? touchStartY) - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 30;

      if (!isSwiping) return;
      touchHandled = true;

      const cardStep = MOBILE_CARD_WIDTH + MOBILE_GAP;

      if (absDx > absDy) {
        // horizontal swipe — move one card
        if (expandStateRef.current.level > 0) {
          setExpandState({ idx: -1, level: 0 });
        }
        const snapped = targetScrollRef.current ?? mobileSnap();
        targetScrollRef.current = snapped + (dx < 0 ? cardStep : -cardStep);
        snapVelocity = 0;
        targetMomentum = 0;
        smoothMomentum = 0;
      } else {
        // vertical swipe — expand/collapse
        if (dy > 0 && expandStateRef.current.level === 0) {
          const snapped = mobileSnap();
          targetScrollRef.current = snapped;
          snapVelocity = 0;
          focusedIdx.current = mobileIdxAtScroll(snapped);
          setExpandState({ idx: focusedIdx.current, level: 2 });
        } else if (dy < 0 && expandStateRef.current.level > 0) {
          setExpandState({ idx: -1, level: 0 });
        }
      }
    };

    // keyboard navigation — desktop only
    const onKeyDown = (e: KeyboardEvent) => {
      if (isMobileRef.current) return;
      if (e.metaKey || e.altKey || e.ctrlKey) return;

      const key = e.key.toLowerCase();

      if (key === "arrowleft" || key === "h") {
        e.preventDefault();
        const snapped = targetScrollRef.current ?? desktopSnap();
        targetScrollRef.current = snapped - desktopCardStep;
        snapVelocity = 0;
        focusedIdx.current = desktopIdxAtScroll(targetScrollRef.current);
        if (expandStateRef.current.level > 0)
          setExpandState({ idx: -1, level: 0 });
      } else if (key === "arrowright" || key === "l") {
        e.preventDefault();
        const snapped = targetScrollRef.current ?? desktopSnap();
        targetScrollRef.current = snapped + desktopCardStep;
        snapVelocity = 0;
        focusedIdx.current = desktopIdxAtScroll(targetScrollRef.current);
        if (expandStateRef.current.level > 0)
          setExpandState({ idx: -1, level: 0 });
      } else if (key === "arrowdown" || key === "j") {
        e.preventDefault();
        if (expandStateRef.current.level === 0) {
          const snapped = desktopSnap();
          targetScrollRef.current = snapped;
          snapVelocity = 0;
          focusedIdx.current = desktopIdxAtScroll(snapped);
          setExpandState({ idx: focusedIdx.current, level: 2 });
        }
      } else if (key === "arrowup" || key === "k" || key === "escape") {
        e.preventDefault();
        setExpandState({ idx: -1, level: 0 });
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKeyDown);

    const onResize = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    window.addEventListener("resize", onResize);

    const copies = 3;

    const animate = () => {
      const mobile = isMobileRef.current;
      const cardW = mobile ? MOBILE_CARD_WIDTH : CARD_WIDTH;
      const gap = mobile ? MOBILE_GAP : SLAT_GAP;
      const visibleSlats = slatCount * copies;
      const wrapWidth = visibleSlats * (cardW + gap);

      const prev = scrollOffset.current;

      // keyboard scroll — spring physics
      if (targetScrollRef.current !== null) {
        const diff = targetScrollRef.current - scrollOffset.current;
        // spring: accelerate toward target, dampen
        snapVelocity += diff * 0.008;
        snapVelocity *= 0.85;
        scrollOffset.current += snapVelocity;
        targetMomentum = 0;
        smoothMomentum = 0;
        if (Math.abs(diff) < 0.3 && Math.abs(snapVelocity) < 0.1) {
          scrollOffset.current = targetScrollRef.current;
          targetScrollRef.current = null;
          snapVelocity = 0;
        }
      } else {
        // clamp momentum so one swipe ≈ one card
        const maxMomentum = (cardW + gap) * 0.15;
        targetMomentum = Math.max(
          -maxMomentum,
          Math.min(maxMomentum, targetMomentum),
        );
        smoothMomentum += (targetMomentum - smoothMomentum) * 0.3;
        scrollOffset.current += smoothMomentum;
        targetMomentum *= mobile ? 0.93 : 0.96;
        smoothMomentum *= mobile ? 0.93 : 0.96;
      }

      // expand animation progress
      const targetExpand = expandStateRef.current.level > 0 ? 1 : 0;
      expandProgress.current += (targetExpand - expandProgress.current) * 0.1;

      const rawVel = Math.abs(scrollOffset.current - prev);
      const lerp = rawVel > smoothVel.current ? 0.1 : 0.25;
      smoothVel.current += (rawVel - smoothVel.current) * lerp;
      const vel = Math.min(smoothVel.current, 12);
      const intensity = vel / 12;

      if (!mobile) {
        const warpEl = document.getElementById("warp-displacement");
        if (warpEl) {
          // disable warp when expanded to prevent blur
          const warpScale =
            expandStateRef.current.level > 0 ? 0 : intensity * 8;
          warpEl.setAttribute("scale", `${warpScale}`);
        }
      }

      const container = containerRef.current;
      if (!container) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const slats = container.children;
      const viewCenter = window.innerWidth / 2;
      const spread = window.innerWidth * (mobile ? 0.4 : 0.5);
      const ep = expandProgress.current;

      for (let i = 0; i < slats.length; i++) {
        const originalIdx = i % slatCount;
        const baseX = i * (cardW + gap);
        let x = baseX - scrollOffset.current;
        x = ((x % wrapWidth) + wrapWidth) % wrapWidth;
        x -= wrapWidth / 2 - viewCenter;

        const slatCenter = x + cardW / 2;
        const distNorm = (slatCenter - viewCenter) / spread;
        const absDist = Math.abs(distNorm);
        const proximity = Math.max(0, 1 - absDist);

        const rotateY = distNorm * 55 * intensity;
        const fisheye = proximity * proximity;
        let scale = 1 + fisheye * 0.12 * intensity - absDist * 0.08 * intensity;
        const translateZ = -absDist * 80 * intensity;
        let opacity = mobile
          ? 1
          : absDist > 0.8
            ? Math.max(0, 1 - (absDist - 0.8) / 0.3)
            : 1;

        const mobileScale = mobile ? MOBILE_CARD_WIDTH / CARD_WIDTH : 1;

        // expand effect — others dim
        const isFocused = originalIdx === expandStateRef.current.idx;
        if (ep > 0.01 && !mobile && !isFocused) {
          opacity *= 1 - ep * 0.5;
        }

        const el = slats[i] as HTMLElement;
        el.style.transform = [
          `translateX(${x}px)`,
          `perspective(1200px)`,
          `rotateY(${rotateY}deg)`,
          `translateZ(${translateZ}px)`,
          `scale(${scale * mobileScale})`,
        ].join(" ");
        el.style.opacity = `${opacity}`;
        el.style.zIndex =
          isFocused && ep > 0.01 ? "200" : `${Math.round(fisheye * 100)}`;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [slatCount, scrollToIndex]);

  const handleCardClick = useCallback(
    (originalIdx: number) => {
      if (dragDistRef.current > 5) return;

      const mobile = isMobileRef.current;
      const snapFn = mobile ? mobileSnapRef.current : desktopSnapRef.current;
      const idxFn = mobile ? mobileIdxRef.current : desktopIdxRef.current;
      const centeredIdx = idxFn(targetScrollRef.current ?? snapFn());

      if (originalIdx === centeredIdx) {
        if (expandState.level > 0) {
          setExpandState({ idx: -1, level: 0 });
        } else {
          const snapped = snapFn();
          targetScrollRef.current = snapped;
          setExpandState({ idx: originalIdx, level: 2 });
        }
      } else {
        if (expandState.level > 0) {
          setExpandState({ idx: -1, level: 0 });
        }
        // compute relative delta (shortest path around the ring)
        const cardW = isMobileRef.current ? MOBILE_CARD_WIDTH : CARD_WIDTH;
        const gap = isMobileRef.current ? MOBILE_GAP : SLAT_GAP;
        const cardStep = cardW + gap;
        const wrapHalf = (slatCount * 3 * cardStep) / 2;
        const cur = targetScrollRef.current ?? scrollOffset.current;
        const rawSnap = Math.round((cur + wrapHalf - cardW / 2) / cardStep);
        const snapped = rawSnap * cardStep - wrapHalf + cardW / 2;
        let delta = originalIdx - centeredIdx;
        if (delta > slatCount / 2) delta -= slatCount;
        if (delta < -slatCount / 2) delta += slatCount;
        targetScrollRef.current = snapped + delta * cardStep;
      }
    },
    [expandState, slatCount],
  );

  const allItems = Array.from(
    { length: slatCount * 3 },
    (_, i) => items[i % slatCount],
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        flex: 1,
        overflow: "hidden",
        cursor: expandState.level > 0 ? "default" : "grab",
        touchAction: "none",
      }}
    >
      {allItems.map((item, i) => (
        <div
          key={i}
          onClick={() => handleCardClick(i % slatCount)}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            marginTop: -184,
            transformOrigin: "center center",
            willChange: "transform, filter",
            cursor: "pointer",
          }}
        >
          <AsciiCard
            title={item.title}
            description={item.description}
            details={item.details}
            chars={item.chars || "01"}
            charSize={item.charSize}
            shape={item.shape || "blob"}
            links={item.links}
            seed={((i % slatCount) + 1) * 7919}
            expandLevel={
              expandState.idx === i % slatCount ? expandState.level : 0
            }
          />
        </div>
      ))}
    </div>
  );
}
