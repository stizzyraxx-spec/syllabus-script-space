import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useTheme } from "@/lib/ThemeContext";

// Whiteboard modal — tldraw editor with sticky notes, drawing tools, text,
// shapes, etc. State auto-persists per user via `persistenceKey`.
export default function WhiteboardModal({ userEmail, onClose }) {
  const theme = useTheme();
  const isDark = theme?.isDark ?? false;
  const persistenceKey = `tcom-whiteboard-${userEmail || 'guest'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 bg-black/80"
    >
      <div className="w-full h-[90vh] max-w-7xl bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <h2 className="font-display text-lg font-bold text-foreground">Whiteboard</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close whiteboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 relative">
          <Tldraw persistenceKey={persistenceKey} inferDarkMode={!isDark} />
        </div>
      </div>
    </motion.div>
  );
}
