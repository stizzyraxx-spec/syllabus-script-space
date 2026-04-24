import { useEffect, useRef } from "react";

const activeVideos = new Set();

/**
 * Cross-browser autoplay hook.
 * - Always starts muted (the only reliable way to autoplay on all browsers/platforms).
 * - Pauses other playing videos when this one enters view.
 * - Pauses when scrolled out of view.
 */
export function useVideoAutoplay() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Always muted for autoplay — browsers (Chrome, Safari, Firefox, iOS) all allow muted autoplay.
    el.muted = true;
    el.playsInline = true;

    activeVideos.add(el);

    const handlePlay = () => {
      // Pause all other videos when this one plays
      activeVideos.forEach((v) => {
        if (v !== el && !v.paused) v.pause();
      });
    };
    el.addEventListener("play", handlePlay);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          activeVideos.forEach((v) => {
            if (v !== el && !v.paused) v.pause();
          });
          const playPromise = el.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay blocked — leave paused, user can tap play
            });
          }
        } else {
          el.pause();
        }
      },
      { threshold: [0, 0.25, 0.5] }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener("play", handlePlay);
      activeVideos.delete(el);
    };
  }, []);

  return ref;
}