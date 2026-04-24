import React from "react";
import { Trash2, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function DraftPostsManager({ drafts = [], onEdit, onDelete }) {
  return (
    <div>
      <h3 className="font-display text-lg font-bold text-foreground mb-4">Draft Posts</h3>

      {drafts.length === 0 ? (
        <div className="p-8 rounded-lg border border-dashed border-border text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="font-body text-sm text-muted-foreground">No draft posts yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {drafts.map((draft) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-4 rounded-lg border border-border bg-card hover:border-accent/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground truncate">
                      {draft.title || "Untitled Draft"}
                    </p>
                    <p className="font-body text-sm text-muted-foreground line-clamp-2">
                      {draft.content}
                    </p>
                    <div className="flex items-center gap-1 mt-2 font-body text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(draft.created_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEdit(draft)}
                      className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-body text-xs font-medium hover:bg-accent/90 transition-colors"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => onDelete(draft.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}