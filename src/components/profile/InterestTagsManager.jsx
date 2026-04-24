import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AVAILABLE_TAGS = [
  "Prophecy", "Ethics", "Parenting", "Marriage", "Finance",
  "Healing", "Justice", "Worship", "Discipleship", "Evangelism",
  "Prayer", "Apologetics", "Church History", "End Times", "Sanctification"
];

export default function InterestTagsManager({ tags = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      onChange(tags.filter(t => t !== tag));
    } else {
      onChange([...tags, tag]);
    }
  };

  return (
    <div>
      <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
        Interest Topics
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent text-accent font-body text-xs font-medium"
          >
            {tag}
            <button
              onClick={() => toggleTag(tag)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground font-body text-xs font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Tags
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 p-3 rounded-lg border border-border bg-card"
          >
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium border transition-all ${
                    tags.includes(tag)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}