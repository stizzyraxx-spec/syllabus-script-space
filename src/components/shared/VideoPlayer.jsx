import React from "react";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";

export default function VideoPlayer({ src, className = "w-full max-h-[400px] bg-black" }) {
  const videoRef = useVideoAutoplay();

  return (
    <video
      ref={videoRef}
      src={src}
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      className={className}
    />
  );
}