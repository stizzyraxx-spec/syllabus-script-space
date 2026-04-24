import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Play, Heart, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function LiveVideoGallery({ userEmail, currentUser }) {
  const queryClient = useQueryClient();

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["user-live-streams", userEmail],
    queryFn: () => base44.entities.LiveStream.filter({ host_email: userEmail, status: "ended" }, "-created_date", 20),
  });

  const deleteMutation = useMutation({
    mutationFn: (streamId) => base44.entities.LiveStream.update(streamId, { video_url: null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-live-streams", userEmail] }),
  });

  const streamsWithVideos = streams.filter((s) => s.video_url);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (streamsWithVideos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-body text-sm text-muted-foreground">No saved live videos yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AnimatePresence>
        {streamsWithVideos.map((stream, i) => (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl overflow-hidden border border-border bg-card group"
          >
            {/* Thumbnail */}
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              <video
                src={stream.video_url}
                className="w-full h-full object-cover"
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-body font-semibold text-sm text-foreground truncate mb-1">
                {stream.title}
              </h3>
              <p className="font-body text-xs text-muted-foreground mb-3">
                {stream.created_date ? format(new Date(stream.created_date), "MMM d, yyyy") : ""}
              </p>

              {/* Engagement stats */}
              <div className="flex items-center gap-3 mb-3 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Heart className="w-3 h-3" />
                  {stream.likes || 0}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={stream.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-accent text-accent-foreground font-body text-xs font-semibold py-2 rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Watch
                </a>
                {currentUser?.email === stream.host_email && (
                  <button
                    onClick={() => deleteMutation.mutate(stream.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}