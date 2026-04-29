import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, UserPlus, UserCheck, Loader2, PlusSquare } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ShareButton from "@/components/shared/ShareButton";
import PostComments from "@/components/social/PostComments";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";

function AutoPlayVideo({ src, className }) {
  const videoRef = useVideoAutoplay();
  return (
    <video
      ref={videoRef}
      src={src}
      playsInline
      controls
      preload="auto"
      crossOrigin="anonymous"
      className={className}
    />
  );
}

export default function HomeCommunityFeed() {
  const [user, setUser] = useState(null);
  const [featuredVideoPost, setFeaturedVideoPost] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    db.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await db.auth.me();
        setUser(me);
      }
    });
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: () => db.entities.CommunityPost.list("-created_date", 10),
    onSuccess: (data) => {
      const videoPosts = data.filter((p) => p.media_type === "video" && p.media_url);
      if (videoPosts.length > 0) {
        setFeaturedVideoPost(videoPosts[Math.floor(Math.random() * videoPosts.length)]);
      }
    },
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: () => db.entities.UserProfile.list(),
    enabled: !!user,
  });

  const myProfile = allProfiles.find((p) => p.user_email === user?.email);

  // Pick a random video post once posts are loaded
  useEffect(() => {
    if (posts.length > 0) {
      const videoPosts = posts.filter((p) => p.media_type === "video" && p.media_url);
      if (videoPosts.length > 0) {
        setFeaturedVideoPost(videoPosts[Math.floor(Math.random() * videoPosts.length)]);
      }
    }
  }, [posts.length]);

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const likedBy = post.liked_by || [];
      const alreadyLiked = likedBy.includes(user?.email);
      return db.entities.CommunityPost.update(post.id, {
        likes: alreadyLiked ? (post.likes || 1) - 1 : (post.likes || 0) + 1,
        liked_by: alreadyLiked
          ? likedBy.filter((e) => e !== user?.email)
          : [...likedBy, user?.email],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
  });

  const followMutation = useMutation({
    mutationFn: async (authorEmail) => {
      // Update the author's followers
      const authorProfiles = await db.entities.UserProfile.filter({ user_email: authorEmail });
      if (authorProfiles.length > 0) {
        const authorProfile = authorProfiles[0];
        const followers = authorProfile.followers || [];
        const isFollowing = followers.includes(user?.email);
        await db.entities.UserProfile.update(authorProfile.id, {
          followers: isFollowing
            ? followers.filter((e) => e !== user?.email)
            : [...followers, user?.email],
        });
        // Update my following list
        if (myProfile) {
          const following = myProfile.following || [];
          await db.entities.UserProfile.update(myProfile.id, {
            following: isFollowing
              ? following.filter((e) => e !== authorEmail)
              : [...following, authorEmail],
          });
        }
        // Send notification on new follow
        if (!isFollowing) {
          await db.entities.Notification.create({
            recipient_email: authorEmail,
            actor_name: user?.full_name || "Someone",
            actor_email: user?.email,
            type: "follow",
            message: `${user?.full_name || "Someone"} started following you.`,
            link_path: "/community",
            read: false,
          });
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-profiles"] }),
  });

  const isFollowing = (authorEmail) => {
    const authorProfile = allProfiles.find((p) => p.user_email === authorEmail);
    return authorProfile?.followers?.includes(user?.email) || false;
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Community Feed
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              What the community is sharing
            </p>
          </div>
          <Link
            to="/community"
            className="flex items-center gap-2 font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            <PlusSquare className="w-4 h-4" />
            Post
          </Link>
        </div>

        {!user && (
          <div className="mb-8 p-5 rounded-xl border border-border bg-card text-center">
            <p className="font-body text-sm text-muted-foreground mb-3">
              Sign in to like, comment, and share with the community
            </p>
            <button
              onClick={() => db.auth.redirectToLogin()}
              className="font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              Sign In / Create Account
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground text-sm">No posts yet. Be the first!</p>
            <Link to="/community" className="font-body text-sm text-accent hover:underline mt-2 inline-block">
              Go to Community →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured random video post */}
            {featuredVideoPost && (() => {
              const post = featuredVideoPost;
              const isLiked = post.liked_by?.includes(user?.email);
              const following = isFollowing(post.author_email);
              const isOwnPost = post.author_email === user?.email;
              return (
                <motion.div
                  key={`video-${post.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3">
                      <Link to="/community" className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {post.author_avatar ? (
                          <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display font-bold text-accent text-sm">
                            {(post.author_name || "A")[0].toUpperCase()}
                          </span>
                        )}
                      </Link>
                      <div>
                        <p className="font-body font-semibold text-sm text-foreground">{post.author_name || "Anonymous"}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {post.created_date ? format(new Date(post.created_date), "MMM d, yyyy") : ""}
                        </p>
                      </div>
                    </div>
                    {user && !isOwnPost && (
                      <button
                        onClick={() => followMutation.mutate(post.author_email)}
                        disabled={followMutation.isPending}
                        className={`flex items-center gap-1.5 font-body text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          following ? "border border-border text-muted-foreground hover:border-accent/40" : "bg-accent/10 text-accent hover:bg-accent/20"
                        }`}
                      >
                        {following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        {following ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  <AutoPlayVideo src={post.media_url} className="w-full max-h-[400px] bg-black" />
                  {post.caption && (
                    <div className="px-4 pt-3 pb-1">
                      <p className="font-body text-sm text-foreground/90 leading-relaxed">{post.caption}</p>
                    </div>
                  )}
                  <div className="px-4 py-3 flex items-center gap-5">
                    <button
                      onClick={() => user && likeMutation.mutate(post)}
                      disabled={!user}
                      className={`flex items-center gap-1.5 font-body text-sm transition-colors ${isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"} disabled:opacity-40`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    </button>
                    <ShareButton
                      title={post.author_name ? `${post.author_name}'s post` : "Community post"}
                      text={post.caption || "Check out this post on The Condition of Man"}
                      url={`${window.location.origin}/community`}
                      imageUrl={post.media_url}
                    />
                  </div>
                  <PostComments post={post} currentUser={user} />
                </motion.div>
              );
            })()}

            {/* Non-video posts */}
            {posts.filter((p) => p.media_type !== "video").map((post, i) => {
              const isLiked = post.liked_by?.includes(user?.email);
              const following = isFollowing(post.author_email);
              const isOwnPost = post.author_email === user?.email;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3">
                      <Link to="/community" className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {post.author_avatar ? (
                          <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display font-bold text-accent text-sm">
                            {(post.author_name || "A")[0].toUpperCase()}
                          </span>
                        )}
                      </Link>
                      <div>
                        <p className="font-body font-semibold text-sm text-foreground">{post.author_name || "Anonymous"}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {post.created_date ? format(new Date(post.created_date), "MMM d, yyyy") : ""}
                        </p>
                      </div>
                    </div>
                    {user && !isOwnPost && (
                      <button
                        onClick={() => followMutation.mutate(post.author_email)}
                        disabled={followMutation.isPending}
                        className={`flex items-center gap-1.5 font-body text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          following ? "border border-border text-muted-foreground hover:border-accent/40" : "bg-accent/10 text-accent hover:bg-accent/20"
                        }`}
                      >
                        {following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        {following ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  {post.media_url && post.media_type === "photo" && (
                    <img src={post.media_url} alt="Post" className="w-full object-cover max-h-[400px]" />
                  )}
                  {post.caption && (
                    <div className="px-4 pt-3 pb-1">
                      <p className="font-body text-sm text-foreground/90 leading-relaxed">{post.caption}</p>
                    </div>
                  )}
                  <div className="px-4 py-3 flex items-center gap-5">
                    <button
                      onClick={() => user && likeMutation.mutate(post)}
                      disabled={!user}
                      className={`flex items-center gap-1.5 font-body text-sm transition-colors ${isLiked ? "text-accent" : "text-muted-foreground hover:text-accent"} disabled:opacity-40`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    </button>
                    <ShareButton
                      title={post.author_name ? `${post.author_name}'s post` : "Community post"}
                      text={post.caption || "Check out this post on The Condition of Man"}
                      url={`${window.location.origin}/community`}
                      imageUrl={post.media_type === "photo" ? post.media_url : null}
                    />
                  </div>
                  <PostComments post={post} currentUser={user} />
                </motion.div>
              );
            })}

            <div className="text-center pt-4">
              <Link to="/community" className="font-body text-sm text-accent hover:underline font-semibold">
                See all community posts →
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}