import React from "react";
import { MessageSquare, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import ShareButton from "@/components/shared/ShareButton";
import ReportButton from "@/components/moderation/ReportButton";
import { db } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const categoryLabels = {
  general: "General Discussion",
  bible_study: "Bible Study",
  justice_ethics: "Justice & Ethics",
  testimonies: "Personal Testimonies",
};

export default function ForumPostCard({ post, user = null, onSelect }) {
  const queryClient = useQueryClient();
  const isOwner = user?.email && post.created_by === user.email;

  const deleteMutation = useMutation({
    mutationFn: () => db.entities.ForumPost.delete(post.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-posts"] }),
  });

  return (
    <div
      onClick={() => onSelect(post)}
      className="p-6 rounded-xl border border-border bg-card hover:border-accent/30 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-body text-[10px] font-semibold tracking-wider uppercase text-accent bg-accent/10 px-2.5 py-1 rounded-full">
          {categoryLabels[post.category] || post.category}
        </span>
      </div>

      <h3 className="font-display text-lg font-bold mb-2 text-foreground group-hover:text-accent transition-colors">
        {post.title}
      </h3>

      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
        {post.content}
      </p>

      {/* Media preview */}
      {post.media_url && post.media_type === "photo" && (
        <img
          src={post.media_url}
          alt="Attachment"
          className="w-full max-h-48 object-cover rounded-lg mb-3"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      {post.media_url && post.media_type === "video" && (
        <video
          src={post.media_url}
          controls
          className="w-full max-h-48 rounded-lg mb-3 bg-black"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
            <MessageSquare className="w-3.5 h-3.5" />
            {post.reply_count || 0} comments
          </span>
          <ShareButton
            title={post.title}
            text={`"${post.title}" — The Condition of Man`}
            url={`${window.location.origin}/forums?tab=forums&post=${post.id}`}
          />
          <ReportButton
            contentType="post"
            contentId={post.id}
            reportedUserEmail={post.created_by}
            contentPreview={post.title}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-accent text-xs">
                {(post.author_name || "A")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {post.author_name || "Anonymous"} ·{" "}
            {post.created_date ? format(new Date(post.created_date), "MMM d, yyyy") : ""}
          </div>
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this post?")) deleteMutation.mutate();
              }}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}