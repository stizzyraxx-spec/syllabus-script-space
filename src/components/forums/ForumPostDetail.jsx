import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Loader2, MessageSquare, Trash2, Pencil, Check, X, Lock, Link } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import ShareButton from "@/components/shared/ShareButton";

const categoryLabels = {
  general: "General Discussion",
  bible_study: "Bible Study",
  justice_ethics: "Justice & Ethics",
  testimonies: "Personal Testimonies",
};

export default function ForumPostDetail({ post, user, onBack }) {
  const [replyContent, setReplyContent] = useState("");
  const [editingPost, setEditingPost] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPostLink = () => {
    const url = `${window.location.origin}/forums?tab=forums&post=${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const queryClient = useQueryClient();
  const isOwner = user?.email && post.created_by === user.email;

  // 30-minute edit window for the post
  const canEditPost = isOwner && post.created_date &&
    differenceInMinutes(new Date(), new Date(post.created_date)) < 30;

  const { data: replies = [] } = useQuery({
    queryKey: ["replies", post.id],
    queryFn: () => db.entities.ForumReply.filter({ post_id: post.id }, "created_date"),
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => db.entities.ForumReply.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["replies", post.id] });
      await db.entities.ForumPost.update(post.id, { reply_count: (post.reply_count || 0) + 1 });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setReplyContent("");
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => db.entities.ForumPost.delete(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      onBack();
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: () => db.entities.ForumPost.update(post.id, { title: editTitle, content: editContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setEditingPost(false);
    },
  });

  const updateReplyMutation = useMutation({
    mutationFn: ({ id, content }) => db.entities.ForumReply.update(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", post.id] });
      setEditingReplyId(null);
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (id) => db.entities.ForumReply.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["replies", post.id] }),
  });

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    createReplyMutation.mutate({
      post_id: post.id,
      content: replyContent,
      author_name: user?.full_name || "Anonymous",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forums
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={copyPostLink}
            className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-accent transition-colors"
            title="Copy link to post"
          >
            <Link className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
          {canEditPost && !editingPost && (
            <button
              onClick={() => { setEditTitle(post.title); setEditContent(post.content); setEditingPost(true); }}
              className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          {isOwner && !canEditPost && post.created_date && differenceInMinutes(new Date(), new Date(post.created_date)) >= 30 && (
            <span className="flex items-center gap-1 font-body text-xs text-muted-foreground/50" title="Editing locked after 30 minutes">
              <Lock className="w-3 h-3" /> Locked
            </span>
          )}
          {isOwner && (
            <button
              onClick={() => { if (window.confirm("Delete this post?")) deletePostMutation.mutate(); }}
              className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card mb-8">
        <span className="font-body text-[10px] font-semibold tracking-wider uppercase text-accent bg-accent/10 px-2.5 py-1 rounded-full">
          {categoryLabels[post.category] || post.category}
        </span>

        {editingPost ? (
          <div className="mt-4 space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-display text-xl font-bold outline-none focus:ring-1 focus:ring-accent"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="font-body text-sm min-h-[120px]"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingPost(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground font-body text-xs transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={() => updatePostMutation.mutate()}
                disabled={updatePostMutation.isPending || !editTitle.trim() || !editContent.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-body text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {updatePostMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold mt-4 mb-4 text-foreground">{post.title}</h1>
            <p className="font-body text-foreground/80 leading-relaxed text-base mb-4 whitespace-pre-wrap">{post.content}</p>
          </>
        )}

        {/* Media */}
        {post.media_url && post.media_type === "photo" && (
          <img src={post.media_url} alt="Attachment" className="w-full max-h-96 object-cover rounded-lg mb-4" />
        )}
        {post.media_url && post.media_type === "video" && (
          <video src={post.media_url} controls className="w-full max-h-96 rounded-lg mb-4 bg-black" />
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              {replies.length} comments
            </span>
            <ShareButton
              title={post.title}
              text={`"${post.title}" — The Condition of Man`}
              url={`${window.location.origin}/forums?tab=forums&post=${post.id}`}
            />
          </div>
          <span className="font-body text-xs text-muted-foreground">
            {post.author_name || "Anonymous"} ·{" "}
            {post.created_date ? format(new Date(post.created_date), "MMMM d, yyyy") : ""}
          </span>
        </div>
      </div>

      {/* Comments */}
      <div className="mb-8">
        <h3 className="font-display text-lg font-bold mb-5 text-foreground">
          Comments ({replies.length})
        </h3>

        {replies.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground py-8 text-center">
            No comments yet. Be the first to respond!
          </p>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => {
              const isReplyOwner = user?.email && reply.created_by === user.email;
              const isEditingThis = editingReplyId === reply.id;
              return (
                <div key={reply.id} className="p-5 rounded-xl border border-border bg-secondary/30">
                   <div className="flex gap-3 mb-3">
                     <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden text-xs font-bold text-accent">
                       {reply.author_avatar ? (
                         <img src={reply.author_avatar} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <span>{(reply.author_name || "A")[0].toUpperCase()}</span>
                       )}
                     </div>
                     <div className="flex-1">
                       <p className="font-body text-xs font-semibold text-foreground">{reply.author_name || "Anonymous"}</p>
                       <p className="font-body text-xs text-muted-foreground">
                         {reply.created_date ? format(new Date(reply.created_date), "MMM d, yyyy") : ""}
                       </p>
                     </div>
                   </div>
                   {isEditingThis ? (
                     <div className="space-y-2">
                       <Textarea
                         value={editReplyContent}
                         onChange={(e) => setEditReplyContent(e.target.value)}
                         className="font-body text-sm min-h-[80px]"
                         autoFocus
                       />
                       <div className="flex gap-2 justify-end">
                         <button onClick={() => setEditingReplyId(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground font-body text-xs transition-colors">
                           <X className="w-3 h-3" /> Cancel
                         </button>
                         <button
                           onClick={() => updateReplyMutation.mutate({ id: reply.id, content: editReplyContent })}
                           disabled={updateReplyMutation.isPending || !editReplyContent.trim()}
                           className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-body text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
                         >
                           {updateReplyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                         </button>
                       </div>
                     </div>
                   ) : (
                     <>
                       <p className="font-body text-sm text-foreground/80 leading-relaxed mb-3 whitespace-pre-wrap">{reply.content}</p>
                       {isReplyOwner && (
                         <div className="flex items-center gap-2 justify-end">
                           <button
                             onClick={() => { setEditingReplyId(reply.id); setEditReplyContent(reply.content); }}
                             className="text-muted-foreground hover:text-accent transition-colors"
                             title="Edit comment"
                           >
                             <Pencil className="w-3.5 h-3.5" />
                           </button>
                           <button
                             onClick={() => { if (window.confirm("Delete this comment?")) deleteReplyMutation.mutate(reply.id); }}
                             className="text-muted-foreground hover:text-destructive transition-colors"
                             title="Delete comment"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comment form */}
      {user ? (
        <div className="p-5 rounded-xl border border-border bg-card">
          <Textarea
            placeholder="Write a comment..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="font-body text-sm min-h-[80px] mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmitReply}
              disabled={createReplyMutation.isPending || !replyContent.trim()}
              className="font-body inline-flex items-center gap-2 bg-accent text-accent-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {createReplyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-border bg-card text-center">
          <p className="font-body text-sm text-muted-foreground mb-3">
            Sign in to comment on this discussion.
          </p>
          <button
            onClick={() => db.auth.redirectToLogin()}
            className="font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            Sign In / Create Account
          </button>
        </div>
      )}
    </div>
  );
}