import React, { useEffect, useRef, useState } from "react";
import { getCursorColor } from "@/components/profile/CursorSettings";

// Custom cursor with falling sprinkles. Color is user-selectable in
// Profile → Cursor Color (saved to localStorage). Hidden globally when
// document.body has the class `rpg-active` (set by RPGGame).
export default function GoldCursor() {
  const dotRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const [enabled, setEnabled] = useState(true);
  const [palette, setPalette] = useState(getCursorColor);

  // Track whether we're inside the RPG (which opts out)
  useEffect(() => {
    const update = () => setEnabled(!document.body.classList.contains("rpg-active"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Listen for cursor-color changes from settings
  useEffect(() => {
    const onChange = () => setPalette(getCursorColor());
    window.addEventListener("cursor-color-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cursor-color-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.removeProperty("--gold-cursor-hide");
      return;
    }
    document.documentElement.style.setProperty("--gold-cursor-hide", "none");

    const spawnSprinkle = (x, y) => {
      const el = document.createElement("div");
      const size = 3 + Math.random() * 4;
      const dx = (Math.random() - 0.5) * 30;
      const dy = 20 + Math.random() * 50;
      const dur = 600 + Math.random() * 600;
      el.style.cssText = `
        position: fixed;
        left: ${x}px; top: ${y}px;
        width: ${size}px; height: ${size}px;
        background: radial-gradient(circle, ${palette.sparkle} 0%, ${palette.core} 70%, transparent 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99998;
        transition: transform ${dur}ms ease-out, opacity ${dur}ms ease-out;
        will-change: transform, opacity;
        opacity: 1;
      `;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`;
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), dur + 50);
    };

    const onMove = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 8}px, ${e.clientY - 8}px)`;
      }
      const now = Date.now();
      if (now - lastSpawnRef.current > 30) {
        lastSpawnRef.current = now;
        spawnSprinkle(e.clientX, e.clientY);
      }
    };

    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, [enabled, palette]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${palette.sparkle} 0%, ${palette.core} 60%, ${palette.core} 100%)`,
        boxShadow: `0 0 10px 2px ${palette.glow}, 0 0 22px 4px ${palette.glow}`,
        pointerEvents: "none",
        zIndex: 99999,
        transform: "translate(-100px, -100px)",
        willChange: "transform",
      }}
    />
  );
}
