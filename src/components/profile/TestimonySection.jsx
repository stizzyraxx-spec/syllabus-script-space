import React, { useState } from "react";
import { Heart } from "lucide-react";

export default function TestimonySection({ testimony = "", onChange, isEditing = false }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isEditing && !testimony) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-accent" />
        <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          My Faith Journey
        </label>
      </div>

      {isEditing ? (
        <textarea
          value={testimony}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Share your faith journey story... (This helps build community trust)"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent min-h-[100px] resize-none"
        />
      ) : (
        <p className="font-body text-sm text-foreground leading-relaxed p-4 rounded-lg bg-secondary/30 border border-border italic">
          "{testimony}"
        </p>
      )}
    </div>
  );
}