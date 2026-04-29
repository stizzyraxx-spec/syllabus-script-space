import React from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { motion } from "framer-motion";

export default function VerseCommentary({ book, chapter, verse, text, onClose }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["commentary", book, chapter, verse],
    queryFn: async () => {
      const res = await db.functions.invoke("getBibleCommentary", { book, chapter, verse, text });
      if (res.data?.commentary) {
        return res.data;
      }
      throw new Error("No commentary received");
    },
    retry: 1,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="sticky top-24 bg-card rounded-xl border border-border p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display font-bold text-foreground text-lg">{book} {chapter}:{verse}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="font-body text-xs text-foreground/80 leading-relaxed mb-4 pb-4 border-b border-border">
        {text}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : isError ? (
        <p className="font-body text-sm text-destructive">Error loading commentary</p>
      ) : data?.commentary ? (
        <div>
          <h4 className="font-body text-xs font-semibold text-muted-foreground mb-2">Commentary</h4>
          <p className="font-body text-sm text-foreground/90 leading-relaxed">
            {data.commentary}
          </p>
        </div>
      ) : (
        <p className="font-body text-sm text-muted-foreground">No commentary available</p>
      )}
    </motion.div>
  );
}