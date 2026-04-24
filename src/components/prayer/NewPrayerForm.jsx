import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  { value: "health", label: "🩺 Health" },
  { value: "family", label: "👨‍👩‍👧 Family" },
  { value: "finances", label: "💼 Finances" },
  { value: "guidance", label: "🧭 Guidance" },
  { value: "salvation", label: "✝️ Salvation" },
  { value: "gratitude", label: "🙏 Gratitude" },
  { value: "other", label: "💬 Other" },
];

export default function NewPrayerForm({ onSubmit, onCancel, isPending }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("other");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content: content.trim(), category, is_anonymous: isAnonymous });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 rounded-xl border border-border bg-card mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-bold text-foreground">Share a Prayer Request</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Share what's on your heart..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] font-body text-sm"
          autoFocus
        />

        {/* Category */}
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1 rounded-lg font-body text-xs font-medium border transition-all ${
                  category === cat.value
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="font-body text-sm text-muted-foreground">Post anonymously</span>
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Submit Request
          </button>
        </div>
      </form>
    </motion.div>
  );
}