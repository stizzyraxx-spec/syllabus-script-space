import React from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WordDefinition({ word, onClose }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["word-def", word],
    queryFn: async () => {
      const res = await db.functions.invoke("getBibleWordDefinition", { word });
      if (res.data?.definition) {
        return res.data;
      }
      throw new Error("No definition received");
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
        <h3 className="font-display font-bold text-foreground text-lg">{word}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : isError ? (
        <p className="font-body text-sm text-destructive">Error loading definition</p>
      ) : data?.definition ? (
        <p className="font-body text-sm text-foreground/90 leading-relaxed">
          {data.definition}
        </p>
      ) : (
        <p className="font-body text-sm text-muted-foreground">No definition available</p>
      )}
    </motion.div>
  );
}