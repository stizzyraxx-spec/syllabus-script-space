import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function PersonalizedRecommendations({ userProfile }) {
  const { data: allPosts = [] } = useQuery({
    queryKey: ["all-posts-discovery"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 100),
  });

  const recommendations = useMemo(() => {
    if (!userProfile?.interest_tags || userProfile.interest_tags.length === 0) {
      return allPosts.slice(0, 5);
    }

    const scored = allPosts.map((post) => {
      let score = 0;
      const captionLower = post.caption.toLowerCase();

      // Score based on interest tags
      userProfile.interest_tags.forEach((tag) => {
        if (captionLower.includes(tag.toLowerCase())) {
          score += 10;
        }
      });

      // Boost recent, popular content
      score += post.likes || 0;
      score += (post.comment_count || 0) * 2;

      // Deprioritize already saved posts
      if (userProfile.bookmarked_posts?.includes(post.id)) {
        score = -1;
      }

      return { ...post, score };
    });

    return scored
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [allPosts, userProfile]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="font-display text-lg font-bold text-foreground">Recommended For You</h3>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-border text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="font-body text-sm text-muted-foreground">
            {userProfile?.interest_tags?.length === 0
              ? "Add interest tags to your profile for personalized recommendations"
              : "No matching posts found"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-lg border border-border bg-card hover:border-accent/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3 mb-2">
                {post.author_avatar && (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-muted-foreground mb-1">
                    {post.author_name || "Anonymous"}
                  </p>
                  <p className="font-body text-sm text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                    {post.caption}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>❤️ {post.likes || 0}</span>
                <span>💬 {post.comment_count || 0}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}