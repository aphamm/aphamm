import { useEffect, useRef, useState } from "react";
import type { NextPageWithLayout } from "next";
import Carousel from "../components/Carousel";

import Shader from "../components/Shader";
import { getProduced, type Write } from "../lib/produced";

interface Props {
  publications: Write[];
}

const Home: NextPageWithLayout<Props> = ({ publications }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shaderVariant, setShaderVariant] = useState(0);
  useEffect(() => {
    const audio = new Audio("/cloudy.m4a");
    audio.volume = 0;
    audioRef.current = audio;

    const MAX_VOL = 0.3;
    const FADE_IN = 0.3;
    const FADE_OUT = 5;
    let fadeFrame = 0;
    let resumeStart = 0;

    const fadeLoop = () => {
      const t = audio.currentTime;
      const dur = audio.duration;
      if (!dur || audio.paused) return;

      const elapsed = (performance.now() - resumeStart) / 1000;
      const fadeInVol = Math.min(1, elapsed / FADE_IN);
      const fadeOutVol = dur - t < FADE_OUT ? (dur - t) / FADE_OUT : 1;
      audio.volume = MAX_VOL * Math.min(fadeInVol, fadeOutVol);

      fadeFrame = requestAnimationFrame(fadeLoop);
    };

    audio.addEventListener("play", () => {
      setIsPlaying(true);
      resumeStart = performance.now();
      fadeFrame = requestAnimationFrame(fadeLoop);
    });
    audio.addEventListener("pause", () => {
      setIsPlaying(false);
      cancelAnimationFrame(fadeFrame);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      cancelAnimationFrame(fadeFrame);
    });

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        if (audio.paused) {
          audio.volume = 0;
          audio.play().catch(() => {});
          setShaderVariant((v) => v + 1);
        } else {
          audio.pause();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      audio.pause();
      cancelAnimationFrame(fadeFrame);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.volume = 0;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <Shader active={isPlaying} variant={shaderVariant} />

      {/* background texture */}
      <img
        src="/back.jpg"
        alt=""
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 9999,
          pointerEvents: "none",
          mixBlendMode: "overlay",
          opacity: isPlaying ? 0 : 0.8,
          transition: "opacity 1s ease-in-out",
        }}
      />

      <div
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "16px 0",
          overflow: "hidden",
        }}
      >
        {/* fractal noise warp filter — desktop only, injected by Carousel */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter id="warp">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.008"
                numOctaves="3"
                result="w"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="w"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="B"
                id="warp-displacement"
              />
            </filter>
          </defs>
        </svg>

        {/* top */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "0 clamp(16px, 4vw, 32px)",
          }}
        >
          <h1
            onClick={toggleAudio}
            style={{
              fontFamily: "var(--font-signifier)",
              fontSize: "clamp(24px, 5vw, 32px)",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "-0.01em",
              color: "var(--fg)",
              lineHeight: 1.1,
              cursor: "pointer",
              animation: "deblur 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            apham
          </h1>
          <nav
            style={{
              display: "flex",
              gap: 20,
              paddingTop: 8,
              alignItems: "center",
              animation: "deblur 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <a
              href="https://github.com/aphamm"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://x.com/austinphamm"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </nav>
        </header>

        {/* carousel */}
        <Carousel items={publications} />

        {/* bottom */}
        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "0 clamp(16px, 4vw, 32px)",
            paddingBottom: 4,
            flexShrink: 0,
            textAlign: "center",
            animation: "deblur 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-signifier)",
              fontSize: "clamp(11px, 2vw, 14px)",
              fontWeight: 200,
              color: "#aaa",
              lineHeight: 1.5,
            }}
          >
            deep learning researcher
          </p>
          <p
            style={{
              fontFamily: "var(--font-signifier)",
              fontSize: "clamp(9px, 1.5vw, 11px)",
              fontWeight: 200,
              color: "#bbb",
              lineHeight: 1.5,
              letterSpacing: "0.05em",
            }}
          >
            [→ / ↓] to browse
          </p>
          <p
            style={{
              fontFamily: "var(--font-signifier)",
              fontSize: "clamp(11px, 2vw, 14px)",
              fontWeight: 200,
              color: "#aaa",
              textAlign: "right",
              lineHeight: 1.5,
            }}
          >
            surrending to life
          </p>
        </footer>
      </div>
    </>
  );
};

Home.getLayout = (page) => <>{page}</>;

export async function getStaticProps() {
  const publications = getProduced();
  return { props: { publications } };
}

export default Home;
