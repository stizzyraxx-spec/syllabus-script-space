import React, { useEffect, useRef, useState } from "react";

// Gold cursor with falling sprinkles. Hidden globally when document.body has
// the class `rpg-active` (set by RPGGame so the RPG keeps its native cursor).
export default function GoldCursor() {
  const dotRef = useRef(null);
  const sprinklesRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const [enabled, setEnabled] = useState(true);

  // Track whether we're inside the RPG (which opts out)
  useEffect(() => {
    const update = () => setEnabled(!document.body.classList.contains("rpg-active"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.removeProperty("--gold-cursor-hide");
      return;
    }
    // Hide native cursor everywhere (except text inputs)
    document.documentElement.style.setProperty("--gold-cursor-hide", "none");

    let raf;
    const onMove = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 8}px, ${e.clientY - 8}px)`;
      }
      // Throttle sprinkle spawn
      const now = Date.now();
      if (now - lastSpawnRef.current > 30) {
        lastSpawnRef.current = now;
        spawnSprinkle(e.clientX, e.clientY);
      }
    };

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
        background: radial-gradient(circle, #fde68a 0%, #f59e0b 70%, transparent 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99998;
        transition: transform ${dur}ms ease-out, opacity ${dur}ms ease-out;
        will-change: transform, opacity;
        opacity: 1;
      `;
      document.body.appendChild(el);
      // Trigger fall + fade
      requestAnimationFrame(() => {
        el.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`;
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), dur + 50);
    };

    document.addEventListener("pointermove", onMove);
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

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
        background: "radial-gradient(circle at 35% 35%, #fef3c7 0%, #fbbf24 45%, #d97706 100%)",
        boxShadow: "0 0 10px 2px rgba(251, 191, 36, 0.65), 0 0 22px 4px rgba(251, 191, 36, 0.35)",
        pointerEvents: "none",
        zIndex: 99999,
        transform: "translate(-100px, -100px)",
        willChange: "transform",
      }}
    />
  );
}
