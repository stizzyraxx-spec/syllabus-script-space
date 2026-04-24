import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAwardPoints } from "@/hooks/useAwardPoints";

const COLORS = {
  yellow: "bg-yellow-100 text-yellow-900 border-yellow-300",
  green: "bg-green-100 text-green-900 border-green-300",
  blue: "bg-blue-100 text-blue-900 border-blue-300",
  pink: "bg-pink-100 text-pink-900 border-pink-300",
  orange: "bg-orange-100 text-orange-900 border-orange-300",
};

export default function BibleHighlights({ user }) {
  const queryClient = useQueryClient();
  const { awardPoints } = useAwardPoints();

  const { data: highlights = [], isLoading } = useQuery({
    queryKey: ["highlights", user?.email],
    queryFn: () => user?.email 
      ? base44.entities.BibleHighlight.filter({ user_email: user.email }, "-created_date")
      : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BibleHighlight.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["highlights", user?.email] }),
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-muted-foreground mb-3">Sign in to highlight verses</p>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  if (highlights.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-muted-foreground">No highlighted verses yet</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {highlights.map((h, i) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-lg border p-4 ${COLORS[h.color] || COLORS.yellow}`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h3 className="font-body font-semibold text-sm">{h.book} {h.chapter}:{h.verse}</h3>
            </div>
            <button
              onClick={() => deleteMutation.mutate(h.id)}
              disabled={deleteMutation.isPending}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-70"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
          <p className="font-body text-sm leading-relaxed mb-2">{h.text}</p>
          {h.note && (
            <p className="font-body text-xs italic border-t pt-2 opacity-80">"{h.note}"</p>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}