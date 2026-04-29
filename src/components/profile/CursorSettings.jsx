import React, { useState, useEffect } from "react";
import { Sparkles, Check } from "lucide-react";

// Saved color is read by GoldCursor on every render. We dispatch a custom
// event so the cursor updates immediately without a refresh.
const STORAGE_KEY = "tcom-cursor-color";

export const CURSOR_PRESETS = [
  { id: "gold",     label: "Gold (default)", core: "#fbbf24", glow: "rgba(251, 191, 36, 0.65)",  sparkle: "#fde68a" },
  { id: "rose",     label: "Rose",           core: "#f43f5e", glow: "rgba(244, 63, 94, 0.55)",   sparkle: "#fecdd3" },
  { id: "amethyst", label: "Amethyst",       core: "#a855f7", glow: "rgba(168, 85, 247, 0.55)",  sparkle: "#e9d5ff" },
  { id: "ocean",    label: "Ocean",          core: "#3b82f6", glow: "rgba(59, 130, 246, 0.55)",  sparkle: "#bfdbfe" },
  { id: "emerald",  label: "Emerald",        core: "#10b981", glow: "rgba(16, 185, 129, 0.55)",  sparkle: "#a7f3d0" },
  { id: "ember",    label: "Ember",          core: "#f97316", glow: "rgba(249, 115, 22, 0.55)",  sparkle: "#fed7aa" },
  { id: "ivory",    label: "Ivory",          core: "#f8fafc", glow: "rgba(248, 250, 252, 0.65)", sparkle: "#ffffff" },
  { id: "shadow",   label: "Shadow",         core: "#1e293b", glow: "rgba(30, 41, 59, 0.7)",     sparkle: "#94a3b8" },
];

export function getCursorColor() {
  try {
    const id = localStorage.getItem(STORAGE_KEY) || "gold";
    return CURSOR_PRESETS.find(p => p.id === id) || CURSOR_PRESETS[0];
  } catch {
    return CURSOR_PRESETS[0];
  }
}

export default function CursorSettings() {
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "gold"; } catch { return "gold"; }
  });

  const choose = (id) => {
    setSelected(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
    window.dispatchEvent(new CustomEvent("cursor-color-change", { detail: id }));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-accent" />
        <h2 className="font-display text-xl font-bold text-foreground">Cursor Color</h2>
      </div>
      <p className="font-body text-sm text-muted-foreground mb-5">
        Change the color of the cursor that follows you across the platform. Your choice is saved
        in this browser. The RPG game keeps its native cursor regardless of this setting.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CURSOR_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => choose(p.id)}
            className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              selected === p.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            <div
              className="w-12 h-12 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${p.sparkle} 0%, ${p.core} 60%, ${p.core} 100%)`,
                boxShadow: `0 0 14px 3px ${p.glow}`,
              }}
            />
            <span className="font-body text-xs font-semibold text-foreground">{p.label}</span>
            {selected === p.id && (
              <span className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-0.5">
                <Check className="w-3 h-3" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
