import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EDITABLE_SELECTORS = ["input", "textarea", "select", "[contenteditable]"];

function isEditableTarget(el) {
  if (!el) return false;
  return EDITABLE_SELECTORS.some((sel) => el.closest(sel));
}

export default function CursorTrail() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (active) {
        setTrail((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY, opacity: 1 },
        ]);
      }
    };

    const handleFocus = (e) => {
      if (isEditableTarget(e.target)) setActive(true);
    };

    const handleBlur = (e) => {
      if (isEditableTarget(e.target)) {
        setActive(false);
        setTrail([]);
      }
    };

    const fadeInterval = setInterval(() => {
      setTrail((prev) =>
        prev
          .map((p) => ({ ...p, opacity: p.opacity - 0.08 }))
          .filter((p) => p.opacity > 0)
      );
    }, 30);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("focusin", handleFocus);
    window.addEventListener("focusout", handleBlur);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("focusin", handleFocus);
      window.removeEventListener("focusout", handleBlur);
      clearInterval(fadeInterval);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {trail.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed w-2 h-2 bg-white rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity * 0.6,
            transform: "translate(-50%, -50%)",
            zIndex: 40,
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}

      <motion.div
        className="fixed w-4 h-4 bg-white rounded-full pointer-events-none shadow-lg shadow-white/60"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          transform: "translate(-50%, -50%)",
          zIndex: 50,
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-white blur-sm"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ opacity: 0.5 }}
        />
      </motion.div>
    </>
  );
}