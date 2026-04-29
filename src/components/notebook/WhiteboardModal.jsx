import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

// Whiteboard — embeds the full IdeaPlanner canvas (pencil, sticky notes,
// text, eraser, undo/redo, color picker, PDF export). State persists in
// localStorage automatically. The HTML lives at /whiteboard.html.
export default function WhiteboardModal({ userEmail, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 bg-black/80"
    >
      <div className="w-full h-[94vh] max-w-7xl bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
          <h2 className="font-display text-lg font-bold text-foreground">Whiteboard</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close whiteboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <iframe
          src="/whiteboard.html"
          title="Whiteboard"
          className="flex-1 w-full border-0"
          style={{ minHeight: 0 }}
        />
      </div>
    </motion.div>
  );
}
