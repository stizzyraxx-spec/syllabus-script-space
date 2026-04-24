import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";
import { filterProfanity, containsProfanity } from "@/lib/profanityFilter";

export default function EditPostModal({ post, onClose }) {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState(post.caption || "");
  const [warning, setWarning] = useState("");

  const saveMutation = useMutation({
    mutationFn: () =>
      base44.entities.CommunityPost.update(post.id, {
        caption: filterProfanity(caption),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["forum-feed"] });
      onClose();
    },
  });

  const handleSave = () => {
    if (containsProfanity(caption)) {
      setWarning("Your post contains inappropriate language and will be filtered.");
    } else {
      setWarning("");
    }
    saveMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display text-lg font-bold text-foreground">Edit Post</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {post.media_url && post.media_type === "photo" && (
            <img src={post.media_url} alt="Post" className="w-full max-h-48 object-cover rounded-lg" />
          )}
          {post.media_url && post.media_type === "video" && (
            <video controls playsInline preload="metadata" className="w-full max-h-48 rounded-lg bg-black">
              <source src={post.media_url} type="video/mp4" />
            </video>
          )}

          <textarea
            value={caption}
            onChange={(e) => { setCaption(e.target.value); setWarning(""); }}
            placeholder="Edit your caption..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px] resize-none"
          />

          {warning && (
            <p className="text-xs text-amber-600 font-body">{warning}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || !caption.trim()}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}