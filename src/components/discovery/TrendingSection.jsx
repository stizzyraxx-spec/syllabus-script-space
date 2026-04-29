import React from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Heart, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function TrendingSection() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: () => db.entities.CommunityPost.list("-likes", 20),
  });

  const trendingTopics = posts.reduce((acc, post) => {
    const words = post.caption.split(/\s+/).filter(w => w.length > 4);
    words.forEach(word => {
      acc[word] = (acc[word] || 0) + 1;
    });
    return acc;
  }, {});

  const topTopics = Object.entries(trendingTopics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([topic]) => topic);

  if (isLoading) {
    return <div className="h-20 bg-secondary/30 rounded-lg animate-pulse" />;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h3 className="font-display text-lg font-bold text-foreground">Trending Now</h3>
      </div>

      <div className="space-y-3">
        {/* Top posts */}
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Hot Posts
          </p>
          <div className="space-y-2">
            {posts.slice(0, 5).map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 rounded-lg border border-border bg-card hover:border-accent/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-body text-sm text-foreground line-clamp-2">{post.caption}</p>
                  <div className="flex items-center gap-1 text-xs text-accent flex-shrink-0">
                    <TrendingUp className="w-3 h-3" />
                    {post.likes || 0}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3" />
                  {post.likes || 0}
                  <MessageSquare className="w-3 h-3" />
                  {post.comment_count || 0}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trending topics */}
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Popular Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {topTopics.map((topic) => (
              <motion.button
                key={topic}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent text-accent font-body text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-all"
              >
                #{topic}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}