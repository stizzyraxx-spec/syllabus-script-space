import React, { useState } from "react";
import { Plus, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BioLinksManager({ links = [], onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const addLink = () => {
    if (title.trim() && url.trim()) {
      onChange([...links, { title: title.trim(), url: url.trim() }]);
      setTitle("");
      setUrl("");
      setIsAdding(false);
    }
  };

  const removeLink = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
        Bio Links
      </label>

      <div className="space-y-2 mb-3">
        <AnimatePresence>
          {links.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <ExternalLink className="w-4 h-4 text-accent flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-medium text-foreground truncate">{link.title}</p>
                  <p className="font-body text-xs text-muted-foreground truncate">{link.url}</p>
                </div>
              </div>
              <button
                onClick={() => removeLink(i)}
                className="text-muted-foreground hover:text-destructive transition-colors ml-2 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2"
        >
          <input
            autoFocus
            placeholder="Link title (e.g., My Ministry)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
          />
          <input
            placeholder="URL (https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="flex gap-2">
            <button
              onClick={addLink}
              className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground font-body text-xs font-semibold hover:bg-accent/90 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setIsAdding(false); setTitle(""); setUrl(""); }}
              className="flex-1 py-2 rounded-lg border border-border font-body text-xs font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground font-body text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Link
        </button>
      )}
    </div>
  );
}