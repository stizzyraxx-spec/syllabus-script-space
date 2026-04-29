import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const STICKY_COLORS = [
  { id: "yellow", bg: "#fff3a3", text: "#3a2f00" },
  { id: "pink",   bg: "#ffc8d6", text: "#4a1228" },
  { id: "blue",   bg: "#bee0ff", text: "#0e2a4a" },
  { id: "green",  bg: "#bff0c2", text: "#0e3a14" },
  { id: "orange", bg: "#ffd0a3", text: "#4a2300" },
  { id: "lilac",  bg: "#dac6ff", text: "#2a1450" },
];

const NOTE_W = 200;
const NOTE_H = 200;

function loadNotes(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveNotes(key, notes) {
  try { localStorage.setItem(key, JSON.stringify(notes)); } catch {}
}

function Thumbtack({ color = "#c0392b" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="drop-shadow-md select-none pointer-events-none">
      <ellipse cx="14" cy="11" rx="9" ry="9" fill={color} />
      <ellipse cx="11" cy="8" rx="3" ry="2" fill="rgba(255,255,255,0.55)" />
      <line x1="14" y1="20" x2="14" y2="26" stroke="#222" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StickyNote({ note, onChange, onDelete, onBringForward, boardRef }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const dragRef = useRef(null);
  const colorMeta = STICKY_COLORS.find(c => c.id === note.color) || STICKY_COLORS[0];

  // Sync text from prop changes
  useEffect(() => { setText(note.text); }, [note.text]);

  const startDrag = (e) => {
    if (editing) return;
    e.preventDefault();
    onBringForward(note.id);
    const rect = boardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + note.x);
    const offsetY = e.clientY - (rect.top + note.y);
    dragRef.current = { offsetX, offsetY };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const r = boardRef.current.getBoundingClientRect();
      let x = ev.clientX - r.left - dragRef.current.offsetX;
      let y = ev.clientY - r.top - dragRef.current.offsetY;
      x = Math.max(0, Math.min(x, r.width - NOTE_W));
      y = Math.max(0, Math.min(y, r.height - NOTE_H));
      onChange(note.id, { x, y });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const commit = () => {
    setEditing(false);
    if (text !== note.text) onChange(note.id, { text });
  };

  return (
    <div
      className="absolute select-none"
      style={{
        left: note.x,
        top: note.y,
        width: NOTE_W,
        height: NOTE_H,
        zIndex: note.z || 1,
        transform: `rotate(${note.rotation || 0}deg)`,
        transition: dragRef.current ? "none" : "transform 0.18s ease-out, box-shadow 0.2s",
        filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.25))",
      }}
      onPointerDown={startDrag}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
    >
      {/* Thumbtack on top edge */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10">
        <Thumbtack color={note.tackColor || "#c0392b"} />
      </div>

      <div
        className="w-full h-full rounded-sm relative overflow-hidden"
        style={{ background: colorMeta.bg, color: colorMeta.text, fontFamily: "'Caveat', 'Comic Sans MS', cursive" }}
      >
        {/* Subtle paper texture via inline gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.05) 100%)",
            mixBlendMode: "soft-light",
          }}
        />

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-1 right-1 z-20 w-6 h-6 rounded-full bg-black/15 hover:bg-black/35 flex items-center justify-center transition-colors"
          title="Delete note"
        >
          <Trash2 className="w-3.5 h-3.5" style={{ color: colorMeta.text }} />
        </button>

        {/* Note body */}
        {editing ? (
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setText(note.text); setEditing(false); }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute inset-0 w-full h-full bg-transparent border-0 outline-none resize-none p-4 pt-7 text-lg leading-tight"
            style={{ color: colorMeta.text, fontFamily: "inherit" }}
            placeholder="Type a note…"
          />
        ) : (
          <div className="absolute inset-0 p-4 pt-7 text-lg leading-tight whitespace-pre-wrap break-words overflow-hidden">
            {note.text || <span className="opacity-50 italic">Double-click to edit</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WhiteboardModal({ userEmail, onClose }) {
  const theme = useTheme();
  const isDark = theme?.isDark ?? false;
  const storageKey = `tcom-corkboard-${userEmail || 'guest'}`;
  const boardRef = useRef(null);

  const [notes, setNotes] = useState(() => loadNotes(storageKey));
  const [maxZ, setMaxZ] = useState(() => Math.max(0, ...loadNotes(storageKey).map(n => n.z || 0)));

  // Persist on every change
  useEffect(() => { saveNotes(storageKey, notes); }, [notes, storageKey]);

  const updateNote = useCallback((id, patch) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...patch } : n)));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const bringForward = useCallback((id) => {
    setMaxZ(z => {
      const next = z + 1;
      setNotes(prev => prev.map(n => (n.id === id ? { ...n, z: next } : n)));
      return next;
    });
  }, []);

  const addNote = (color) => {
    if (!boardRef.current) return;
    const r = boardRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(r.width - NOTE_W - 20, Math.random() * (r.width - NOTE_W)));
    const y = Math.max(20, Math.min(r.height - NOTE_H - 20, Math.random() * (r.height - NOTE_H)));
    const rotation = (Math.random() * 8) - 4; // -4 to +4 degrees
    const tackColors = ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400", "#16a085"];
    const tackColor = tackColors[Math.floor(Math.random() * tackColors.length)];
    setMaxZ(z => z + 1);
    setNotes(prev => [
      ...prev,
      {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        x, y, rotation, color: color || STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)].id,
        text: "", tackColor, z: maxZ + 1,
      },
    ]);
  };

  const clearAll = () => {
    if (notes.length === 0) return;
    if (window.confirm("Remove all sticky notes from the corkboard? This cannot be undone.")) {
      setNotes([]);
    }
  };

  // Cork board background — layered radial gradients give the speckled cork look
  const corkBg = isDark
    ? `radial-gradient(circle at 20% 30%, #6b4923 0px, #5a3d1c 1px, transparent 2px),
       radial-gradient(circle at 70% 60%, #7a5630 0px, #5a3d1c 1px, transparent 2px),
       radial-gradient(circle at 40% 80%, #6b4923 0px, #5a3d1c 1px, transparent 2px),
       linear-gradient(135deg, #4a3318 0%, #5a3d1c 50%, #4a3318 100%)`
    : `radial-gradient(circle at 20% 30%, #c8946b 0px, #b07a4f 1px, transparent 2px),
       radial-gradient(circle at 70% 60%, #d4a075 0px, #b07a4f 1px, transparent 2px),
       radial-gradient(circle at 40% 80%, #c8946b 0px, #b07a4f 1px, transparent 2px),
       linear-gradient(135deg, #b07a4f 0%, #c1875c 50%, #b07a4f 100%)`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 bg-black/80"
    >
      <div className="w-full h-[92vh] max-w-7xl bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-foreground">Corkboard</h2>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Drag to move • Double-click to edit • {notes.length} note{notes.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              {STICKY_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => addNote(c.id)}
                  className="w-6 h-6 rounded-full border-2 border-border hover:scale-110 transition-transform"
                  style={{ background: c.bg }}
                  title={`Add ${c.id} note`}
                />
              ))}
            </div>
            <button
              onClick={() => addNote()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
              title="Add note (random color)"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
            {notes.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive text-sm transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corkboard surface */}
        <div
          ref={boardRef}
          className="flex-1 relative overflow-hidden"
          style={{
            background: corkBg,
            backgroundSize: "60px 60px, 80px 80px, 100px 100px, 100% 100%",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.35)",
          }}
        >
          {notes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <p className="text-white/80 text-lg font-display mb-2">Your corkboard is empty.</p>
              <p className="text-white/60 text-sm">Click an "Add" button above to pin your first sticky note.</p>
            </div>
          )}
          {notes.map(n => (
            <StickyNote
              key={n.id}
              note={n}
              onChange={updateNote}
              onDelete={deleteNote}
              onBringForward={bringForward}
              boardRef={boardRef}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
