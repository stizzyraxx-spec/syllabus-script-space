import React from "react";
import { motion } from "framer-motion";
import { HandHeart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_LABELS = {
  health: "🩺 Health",
  family: "👨‍👩‍👧 Family",
  finances: "💼 Finances",
  guidance: "🧭 Guidance",
  salvation: "✝️ Salvation",
  gratitude: "🙏 Gratitude",
  other: "💬 Other",
};

export default function PrayerCard({ request, user, onPray }) {
  const hasPrayed = user && request.prayed_by?.includes(user.email);
  const count = request.prayer_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border border-border bg-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Category badge */}
          <span className="inline-block font-body text-[10px] font-semibold tracking-wider uppercase text-accent bg-accent/10 px-2.5 py-0.5 rounded-full mb-3">
            {CATEGORY_LABELS[request.category] || "Other"}
          </span>

          <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">
            {request.content}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-muted-foreground">
              {request.is_anonymous || !request.author_name ? "Anonymous" : request.author_name}
              {request.created_date && (
                <> · {formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}</>
              )}
            </span>

            <button
              onClick={() => onPray(request)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                hasPrayed
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:border-accent/50 hover:text-accent"
              }`}
            >
              <HandHeart className="w-3.5 h-3.5" />
              {hasPrayed ? "Praying" : "I'll Pray"}
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  hasPrayed ? "bg-accent-foreground/20 text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}