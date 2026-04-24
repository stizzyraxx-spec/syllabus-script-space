import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { uploadFileToS3 } from "@/lib/uploadToS3";
import VideoPlayer from "@/components/shared/VideoPlayer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, Plus, X, Image, Send, MoreHorizontal, Pencil, Trash2, Link } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { filterProfanity } from "@/lib/profanityFilter";
import EditPostModal from "@/components/social/EditPostModal";

function CreateFeedPost({ user, myProfile, onClose }) {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-feed"] });
      onClose();
    },
  });

  const handleSubmit = async () => {
    if (!caption.trim()) return;
    let media_url = null;
    let media_type = "text";

    if (mediaFile) {
      setUploading(true);
      media_url = await uploadFileToS3(mediaFile);
      media_type = mediaFile.type.startsWith("video") ? "video" : "photo";
      setUploading(false);
    }

    createMutation.mutate({
      author_email: user.email,
      author_name: myProfile?.display_name || user.full_name || "Anonymous",
      author_avatar: myProfile?.avatar_url || null,
      caption: filterProfanity(caption),
      media_url,
      media_type,
      likes: 0,
      liked_by: [],
      comment_count: 0,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 rounded-xl border border-border bg-card mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-sm font-semibold text-foreground">New Post</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <Textarea
        placeholder="Share a thought, reflection, or encouragement..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="font-body text-sm min-h-[80px] mb-3"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-accent transition-colors font-body text-xs">
          <Image className="w-4 h-4" />
          Add Photo/Video
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => setMediaFile(e.target.files[0])}
          />
        </label>
        {mediaFile && (
          <span className="font-body text-xs text-accent truncate max-w-[140px]">{mediaFile.name}</span>
        )}
        <button
          onClick={handleSubmit}
          disabled={!caption.trim() || createMutation.isPending || uploading}
          className="flex items-center gap-1.5 bg-accent text-accent-foreground font-body text-xs font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {(createMutation.isPending || uploading) ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          Post
        </button>
      </div>
    </motion.div>
  );
}

export default function FeedTab({ user, searchParams, setSearchParams }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const queryClient = useQueryClient();

  const copyPostLink = (postId, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/forums?tab=feed&feedpost=${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteMutation = useMutation({
    mutationFn: (postId) => base44.entities.CommunityPost.delete(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-feed"] }),
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user.email }),
    select: (data) => data[0],
    enabled: !!user?.email,
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["forum-feed"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 30),
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const likedBy = post.liked_by || [];
      const alreadyLiked = likedBy.includes(user?.email);
      return base44.entities.CommunityPost.update(post.id, {
        likes: alreadyLiked ? (post.likes || 1) - 1 : (post.likes || 0) + 1,
        liked_by: alreadyLiked
          ? likedBy.filter((e) => e !== user?.email)
          : [...likedBy, user?.email],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-feed"] }),
  });

  return (
    <div>
      {user && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 mb-6 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      )}
      {!user && (
        <div className="p-4 rounded-xl border border-border bg-card mb-6 text-center">
          <p className="font-body text-sm text-muted-foreground mb-2">Sign in to create posts</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            Sign In / Create Account
          </button>
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateFeedPost user={user} myProfile={myProfile} onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingPost && (
          <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} />
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-body text-muted-foreground text-sm">No posts yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post, i) => {
            const isLiked = post.liked_by?.includes(user?.email);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-bold text-accent text-sm">
                          {(post.author_name || "A")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-body font-semibold text-sm text-foreground">{post.author_name || "Anonymous"}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {post.created_date ? format(new Date(post.created_date), "MMM d, yyyy") : ""}
                      </p>
                    </div>
                  </div>
                  {user && post.author_email === user.email && (
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === post.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            className="absolute right-0 top-8 z-20 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                          >
                            <button
                              onClick={() => { setEditingPost(post); setOpenMenuId(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 font-body text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => { if (window.confirm("Delete this post?")) deleteMutation.mutate(post.id); setOpenMenuId(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 font-body text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {post.media_url && post.media_type === "photo" && (
                  <img src={post.media_url} alt="Post" className="w-full object-cover max-h-[400px]" />
                )}
                {post.media_url && post.media_type === "video" && (
                  <VideoPlayer src={post.media_url} className="w-full max-h-[400px] bg-black" />
                )}

                <div className="p-4">
                  {post.caption && (
                    <p className="font-body text-sm text-foreground/90 leading-relaxed mb-4">{filterProfanity(post.caption)}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => user && likeMutation.mutate(post)}
                      disabled={!user}
                      className={`flex items-center gap-1.5 font-body text-sm transition-colors ${
                        isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
                      } disabled:opacity-40`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                      {post.likes > 0 && <span className="text-xs">{post.likes}</span>}
                    </button>
                    <button
                      onClick={(e) => copyPostLink(post.id, e)}
                      className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-accent transition-colors"
                      title="Copy link to post"
                    >
                      <Link className="w-3.5 h-3.5" />
                      {copiedId === post.id ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}