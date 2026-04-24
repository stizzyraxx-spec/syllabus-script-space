import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAwardPoints } from "@/hooks/useAwardPoints";

export default function BibleFavorites({ user, onSelectVerse }) {
  const queryClient = useQueryClient();
  const { awardPoints } = useAwardPoints();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.email],
    queryFn: () => user?.email 
      ? base44.entities.BibleFavorite.filter({ user_email: user.email }, "-created_date")
      : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BibleFavorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", user?.email] }),
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-muted-foreground mb-3">Sign in to save your favorite verses</p>
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

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-muted-foreground">No favorite verses yet</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {favorites.map((fav, i) => (
        <motion.div
          key={fav.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-lg border border-border p-4 hover:border-accent/40 transition-colors"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <button
              onClick={() => onSelectVerse(fav.book, fav.chapter, fav.start_verse)}
              className="text-left flex-1 hover:opacity-70 transition-opacity"
            >
              <h3 className="font-body font-semibold text-sm text-foreground">
                {fav.book} {fav.chapter}:{fav.start_verse}
              </h3>
            </button>
            <button
              onClick={() => deleteMutation.mutate(fav.id)}
              disabled={deleteMutation.isPending}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
          <p className="font-body text-sm text-foreground/80 leading-relaxed">{fav.text}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}