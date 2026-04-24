import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import VideoPlayer from "@/components/shared/VideoPlayer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, UserPlus, UserCheck, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";
import PostComments from "@/components/social/PostComments";
import EditPostModal from "@/components/social/EditPostModal";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { filterProfanity } from "@/lib/profanityFilter";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";



export default function Feed({ currentUser, onViewProfile }) {
  const queryClient = useQueryClient();
  const { awardPoints } = useAwardPoints();
  const [editingPost, setEditingPost] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (postId) => base44.entities.CommunityPost.delete(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 30),
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: !!currentUser,
  });

  const myProfile = allProfiles.find((p) => p.user_email === currentUser?.email);

  const isFollowing = (authorEmail) => {
    const authorProfile = allProfiles.find((p) => p.user_email === authorEmail);
    return authorProfile?.followers?.includes(currentUser?.email) || false;
  };

  const followMutation = useMutation({
    mutationFn: async (authorEmail) => {
      const authorProfiles = await base44.entities.UserProfile.filter({ user_email: authorEmail });
      if (authorProfiles.length > 0) {
        const authorProfile = authorProfiles[0];
        const followers = authorProfile.followers || [];
        const already = followers.includes(currentUser?.email);
        await base44.entities.UserProfile.update(authorProfile.id, {
          followers: already ? followers.filter((e) => e !== currentUser?.email) : [...followers, currentUser?.email],
        });
        if (myProfile) {
          const following = myProfile.following || [];
          await base44.entities.UserProfile.update(myProfile.id, {
            following: already ? following.filter((e) => e !== authorEmail) : [...following, authorEmail],
          });
        }
        if (!already) {
          await base44.entities.Notification.create({
            recipient_email: authorEmail,
            actor_name: currentUser?.full_name || "Someone",
            actor_email: currentUser?.email,
            type: "follow",
            message: `${currentUser?.full_name || "Someone"} started following you.`,
            link_path: "/community",
            read: false,
          });
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-profiles"] }),
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const likedBy = post.liked_by || [];
      const alreadyLiked = likedBy.includes(currentUser?.email);
      const isNewLike = !alreadyLiked;
      
      // Award point only for new likes
      if (isNewLike) {
        await awardPoints(currentUser.email, "like");
      }
      
      return base44.entities.CommunityPost.update(post.id, {
        likes: alreadyLiked ? (post.likes || 1) - 1 : (post.likes || 0) + 1,
        liked_by: alreadyLiked
          ? likedBy.filter((e) => e !== currentUser?.email)
          : [...likedBy, currentUser?.email],
      });
    },
    onSuccess: () => {
      toast.success("✨ +1 point for liking!");
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["player-progress", currentUser?.email] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", currentUser?.email] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
            <div className="h-48 bg-muted rounded-lg mb-4" />
            <div className="h-3 w-full bg-muted rounded mb-2" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-body text-muted-foreground text-sm">No posts yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" onClick={() => setOpenMenuId(null)}>
      <AnimatePresence>
        {editingPost && (
          <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} />
        )}
      </AnimatePresence>
      {posts.map((post, i) => {
        const isLiked = post.liked_by?.includes(currentUser?.email);
        const following = isFollowing(post.author_email);
        const isOwnPost = post.author_email === currentUser?.email;
        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onViewProfile(post.author_email)}
                  className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden"
                >
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-accent text-sm">
                      {(post.author_name || "A")[0].toUpperCase()}
                    </span>
                  )}
                </button>
                <div>
                  <button
                    onClick={() => onViewProfile(post.author_email)}
                    className="font-body font-semibold text-sm text-foreground hover:text-accent transition-colors"
                  >
                    {post.author_name || "Anonymous"}
                  </button>
                  <p className="font-body text-xs text-muted-foreground">
                    {post.created_date ? format(new Date(post.created_date), "MMM d, yyyy") : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentUser && !isOwnPost && (
                  <button
                    onClick={() => followMutation.mutate(post.author_email)}
                    disabled={followMutation.isPending}
                    className={`flex items-center gap-1.5 font-body text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      following
                        ? "border border-border text-muted-foreground hover:border-accent/40"
                        : "bg-accent/10 text-accent hover:bg-accent/20"
                    }`}
                  >
                    {following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    {following ? "Following" : "Follow"}
                  </button>
                )}
                {isOwnPost && (
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
            </div>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className={`grid gap-1 ${post.media_urls.length === 1 ? "grid-cols-1" : post.media_urls.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {post.media_urls.map((media, idx) => (
                  <div key={idx} className="relative overflow-hidden bg-black">
                    {media.type === "photo" && (
                      <img
                        src={media.url}
                        alt="Post media"
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {media.type === "video" && (
                      <video
                        src={media.url}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {media.type === "pdf" && (
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-48 flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        <div className="text-center">
                          <span className="text-3xl">📄</span>
                          <p className="font-body text-xs text-muted-foreground mt-1">View PDF</p>
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Fallback for old single media format */}
            {!post.media_urls && post.media_url && post.media_type === "photo" && (
              <img
                src={post.media_url}
                alt="Post"
                className="w-full object-cover max-h-[500px]"
              />
            )}
            {!post.media_urls && post.media_url && post.media_type === "video" && (
              <VideoPlayer src={post.media_url} className="w-full max-h-[500px] bg-black" />
            )}

            {/* Caption + actions */}
            <div className="p-4">
              {post.caption && (
                <p className="font-body text-sm text-foreground/90 leading-relaxed mb-4">
                  {filterProfanity(post.caption)}
                </p>
              )}
              <div className="flex items-center gap-5">
                <button
                  onClick={() => currentUser && likeMutation.mutate(post)}
                  className={`flex items-center gap-1.5 font-body text-sm transition-colors ${
                    isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  </button>
                <ShareButton
                  title={post.author_name ? `${post.author_name}'s post` : "Community post"}
                  text={post.caption || "Check out this post on The Condition of Man"}
                  url={`${window.location.origin}/community`}
                  imageUrl={post.media_urls?.length > 0 && post.media_urls[0]?.type === "photo" ? post.media_urls[0]?.url : (post.media_type === "photo" ? post.media_url : null)}
                />
              </div>
            </div>
            <PostComments post={post} currentUser={currentUser} />
          </motion.div>
        );
      })}
    </div>
  );
}