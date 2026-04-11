import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
  variant: number;
}

const VIDEOS = ["/shader-loop.mp4", "/shader2-loop.mp4", "/shader3-loop.mp4"];

export default function Shader({ active, variant }: Props) {
  const src = VIDEOS[variant % VIDEOS.length];
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4;
    }
  }, [src]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
        opacity: active ? 1 : 0,
        transition: "opacity 1s ease-in-out",
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        key={src}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.08,
          mixBlendMode: "multiply",
          filter: "grayscale(100%) contrast(1.2)",
        }}
      />
    </div>
  );
}
