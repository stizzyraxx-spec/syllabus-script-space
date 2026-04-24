import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import MentionInput, { parseMentions } from "./MentionInput";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";

export default function PostComments({ post, currentUser }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const { awardPoints } = useAwardPoints();

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles-mention"],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 60000,
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: currentUser.email }),
    select: (data) => data[0],
    enabled: !!currentUser?.email,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["post-comments", post.id],
    queryFn: () => base44.entities.PostComment.filter({ post_id: post.id }, "created_date"),
    enabled: open,
  });

  const addComment = useMutation({
    mutationFn: async (content) => {
      const authorName = myProfile?.display_name || currentUser.full_name || "Anonymous";
      const authorAvatar = myProfile?.avatar_url || null;
      await base44.entities.PostComment.create({
        post_id: post.id,
        author_email: currentUser.email,
        author_name: authorName,
        author_avatar: authorAvatar,
        content,
      });
      await base44.entities.CommunityPost.update(post.id, {
        comment_count: (post.comment_count || 0) + 1,
      });
      // Notify post author if different
      if (post.author_email && post.author_email !== currentUser.email) {
        await base44.entities.Notification.create({
          recipient_email: post.author_email,
          actor_name: currentUser.full_name || "Someone",
          actor_email: currentUser.email,
          type: "comment",
          message: `${currentUser.full_name || "Someone"} commented on your post.`,
          link_path: "/community",
          read: false,
        });
      }
      // Notify tagged users
      const tagged = parseMentions(content, profiles);
      for (const email of tagged) {
        if (email !== currentUser.email && email !== post.author_email) {
          await base44.entities.Notification.create({
            recipient_email: email,
            actor_name: currentUser.full_name || "Someone",
            actor_email: currentUser.email,
            type: "reply",
            message: `${currentUser.full_name || "Someone"} mentioned you in a comment.`,
            link_path: "/community",
            read: false,
          });
        }
      }
      // Award point for comment
      await awardPoints(currentUser.email, "comment");
      },
      onSuccess: () => {
      toast.success("✨ +1 point for commenting!");
      queryClient.invalidateQueries({ queryKey: ["post-comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["player-progress", currentUser.email] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", currentUser.email] });
      setText("");
      },
      });

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-accent transition-colors px-4 py-2.5"
      >
        <MessageCircle className="w-4 h-4" />
        {post.comment_count || 0} {post.comment_count === 1 ? "comment" : "comments"}
        {open ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent overflow-hidden">
                {c.author_avatar ? (
                  <img src={c.author_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{(c.author_name || "A")[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 bg-secondary/50 rounded-xl px-3 py-2">
                <span className="font-body text-xs font-semibold text-foreground mr-2">{c.author_name}</span>
                <span className="font-body text-xs text-foreground/80">{c.content}</span>
                <p className="font-body text-[10px] text-muted-foreground mt-1">
                  {c.created_date ? format(new Date(c.created_date), "MMM d") : ""}
                </p>
              </div>
            </div>
          ))}

          {currentUser ? (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent overflow-hidden">
                {myProfile?.avatar_url ? (
                  <img src={myProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{(currentUser.full_name || "A")[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <MentionInput
                  value={text}
                  onChange={setText}
                  placeholder="Add a comment… use @ to tag someone"
                  className="flex-1 bg-secondary/50 rounded-full px-4 py-1.5 font-body text-xs text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-accent/40 transition-colors"
                />
                <button
                  onClick={() => text.trim() && addComment.mutate(text.trim())}
                  disabled={addComment.isPending || !text.trim()}
                  className="text-accent disabled:opacity-40 transition-opacity"
                >
                  {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <p className="font-body text-xs text-muted-foreground text-center py-1">
              <button onClick={() => base44.auth.redirectToLogin()} className="text-accent hover:underline">Sign in</button> to comment
            </p>
          )}
        </div>
      )}
    </div>
  );
}