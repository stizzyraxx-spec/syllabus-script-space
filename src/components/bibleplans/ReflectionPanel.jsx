import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function ReflectionPanel({ reflection, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["reflection-comments", reflection.id],
    queryFn: () =>
      db.entities.ReflectionComment.filter({
        reflection_id: reflection.id,
      }),
  });

  const isLiked = reflection.liked_by?.includes(currentUser?.email);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const likedBy = reflection.liked_by || [];
      const newLikes = isLiked
        ? likedBy.filter((e) => e !== currentUser.email)
        : [...likedBy, currentUser.email];
      await db.entities.PlanReflection.update(reflection.id, {
        likes: newLikes.length,
        liked_by: newLikes,
      });
      queryClient.invalidateQueries({
        queryKey: ["day-reflections"],
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!commentText.trim()) return;
      await db.entities.ReflectionComment.create({
        reflection_id: reflection.id,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        author_avatar: (await db.entities.UserProfile.filter({
          user_email: currentUser.email,
        }).then((p) => p[0]?.avatar_url)) || null,
        content: commentText,
      });
      await db.entities.PlanReflection.update(reflection.id, {
        comment_count: (reflection.comment_count || 0) + 1,
      });
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["reflection-comments"] });
      queryClient.invalidateQueries({ queryKey: ["day-reflections"] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border border-border bg-card hover:border-accent/40 transition-colors"
    >
      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden text-xs font-bold">
          {reflection.user_avatar ? (
            <img src={reflection.user_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            reflection.user_name?.[0]?.toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold text-foreground truncate">
            {reflection.user_name}
          </p>
          <p className="font-body text-xs text-muted-foreground">
            {reflection.created_date
              ? formatDistanceToNow(new Date(reflection.created_date), {
                  addSuffix: true,
                })
              : "just now"}
          </p>
        </div>
      </div>

      {/* Reflection text */}
      <p className="font-body text-xs text-foreground leading-relaxed mb-3">
        {reflection.reflection}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {currentUser && (
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart
              className="w-3.5 h-3.5"
              fill={isLiked ? "currentColor" : "none"}
            />
            {reflection.likes || 0}
          </button>
        )}

        {currentUser && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {reflection.comment_count || 0}
          </button>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {comments.slice(-3).map((comment) => (
            <div key={comment.id} className="text-xs">
              <p className="font-body font-semibold text-foreground">
                {comment.author_name}
              </p>
              <p className="font-body text-muted-foreground">{comment.content}</p>
            </div>
          ))}

          {currentUser && (
            <div className="pt-2 border-t border-border mt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a reply..."
                className="w-full px-2 py-1 rounded text-xs bg-secondary border border-border text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={() => commentMutation.mutate()}
                disabled={commentMutation.isPending || !commentText.trim()}
                className="mt-1 text-xs text-accent hover:text-accent/80 font-semibold disabled:opacity-40"
              >
                {commentMutation.isPending ? "..." : "Reply"}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}