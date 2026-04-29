import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, ExternalLink, Grid, MessageCircle, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import EditProfileModal from "./EditProfileModal";
import PostComments from "./PostComments";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";
import DirectMessageModal from "./DirectMessageModal";
import StreakDisplay from "@/components/profile/StreakDisplay.jsx";
import AchievementBadges from "@/components/profile/AchievementBadges.jsx";

// Auto-play video card with comments
function ProfilePostCard({ post, currentUser }) {
  const videoRef = useVideoAutoplay();

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {post.media_url && post.media_type === "photo" && (
        <img src={post.media_url} alt="" className="w-full max-h-80 object-cover" />
      )}
      {post.media_url && post.media_type === "video" && (
        <video
          ref={videoRef}
          src={post.media_url}
          controls
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className="w-full max-h-80"
        />
      )}
      <div className="p-4">
        {post.caption && (
          <p className="font-body text-sm text-foreground/80 leading-relaxed">{post.caption}</p>
        )}
        <p className="font-body text-xs text-muted-foreground mt-2">
          {post.created_date ? format(new Date(post.created_date), "MMM d, yyyy") : ""}
        </p>
      </div>
      <PostComments post={post} currentUser={currentUser} />
    </div>
  );
}

export default function ProfileView({ profileEmail, currentUser, onBack }) {
  const queryClient = useQueryClient();
  const isOwnProfile = profileEmail === currentUser?.email;
  const [showEdit, setShowEdit] = useState(false);
  const [showDM, setShowDM] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profile", profileEmail],
    queryFn: () => db.entities.UserProfile.filter({ user_email: profileEmail }),
  });
  const profile = profiles[0];

  useEffect(() => {
    const unsubscribe = db.entities.UserProfile.subscribe((event) => {
      if (event.data?.user_email === profileEmail) {
        queryClient.invalidateQueries({ queryKey: ["profile", profileEmail] });
      }
    });
    return unsubscribe;
  }, [profileEmail, queryClient]);

  const { data: posts = [] } = useQuery({
    queryKey: ["user-posts", profileEmail],
    queryFn: () => db.entities.CommunityPost.filter({ author_email: profileEmail }, "-created_date"),
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const followersList = profile?.followers || [];
      const alreadyFollowing = followersList.includes(currentUser?.email);
      if (profile) {
        await db.entities.UserProfile.update(profile.id, {
          followers: alreadyFollowing
            ? followersList.filter((e) => e !== currentUser?.email)
            : [...followersList, currentUser?.email],
        });
      }
      const myProfiles = await db.entities.UserProfile.filter({ user_email: currentUser?.email });
      if (myProfiles.length > 0) {
        const myProfile = myProfiles[0];
        const myFollowing = myProfile.following || [];
        await db.entities.UserProfile.update(myProfile.id, {
          following: alreadyFollowing
            ? myFollowing.filter((e) => e !== profileEmail)
            : [...myFollowing, profileEmail],
        });
      }
      if (!alreadyFollowing && profileEmail && profileEmail !== currentUser?.email) {
        await db.entities.Notification.create({
          recipient_email: profileEmail,
          actor_name: currentUser?.full_name || "Someone",
          actor_email: currentUser?.email,
          type: "follow",
          message: `${currentUser?.full_name || "Someone"} started following you.`,
          link_path: "/community",
          read: false,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", profileEmail] }),
  });

  const isFollowing = profile?.followers?.includes(currentUser?.email);
  const followerCount = profile?.followers?.length || 0;
  const followingCount = profile?.following?.length || 0;

  const socialLinks = [
    { key: "tiktok", label: "TikTok", prefix: "https://tiktok.com/@", clean: (v) => v.replace(/^@/, "") },
    { key: "instagram", label: "Instagram", prefix: "https://instagram.com/", clean: (v) => v.replace(/^@/, "") },
    { key: "twitter", label: "X", prefix: "https://x.com/", clean: (v) => v.replace(/^@/, "") },
    { key: "facebook", label: "Facebook", prefix: "https://facebook.com/", clean: (v) => v },
    { key: "youtube", label: "YouTube", prefix: "https://youtube.com/", clean: (v) => v.replace(/^@/, "") },
    { key: "website", label: "Website", prefix: "", clean: (v) => v },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Profile header */}
      <div className="p-6 rounded-xl border border-border bg-card mb-6">
        <div className="flex items-start gap-5 mb-4">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-accent text-2xl">
                {(profile?.display_name || currentUser?.full_name || "A")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                  {profile?.display_name || currentUser?.full_name || "Community Member"}
                </h2>
                {profile?.username && (
                  <p className="font-body text-sm text-accent">@{profile.username}</p>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 font-body text-xs text-muted-foreground border border-border hover:border-accent/40 hover:text-accent transition-colors px-3 py-1.5 rounded-lg flex-shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                  Edit Profile
                </button>
              )}
            </div>
            {profile?.bio && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
         <div className="flex items-center gap-6 mb-4">
           <div className="text-center">
             <p className="font-display font-bold text-lg text-foreground">{posts.length}</p>
             <p className="font-body text-xs text-muted-foreground">Posts</p>
           </div>
           <div className="text-center">
             <p className="font-display font-bold text-lg text-foreground">{followerCount}</p>
             <p className="font-body text-xs text-muted-foreground">Followers</p>
           </div>
           <div className="text-center">
             <p className="font-display font-bold text-lg text-foreground">{followingCount}</p>
             <p className="font-body text-xs text-muted-foreground">Following</p>
           </div>
           <div className="text-center">
             <div className="flex items-center justify-center gap-1.5 mb-1">
               <Star className="w-4 h-4 text-accent fill-accent" />
               <p className="font-display font-bold text-lg text-accent">{profile?.total_points || 0}</p>
             </div>
             <p className="font-body text-xs text-muted-foreground">Points</p>
           </div>
         </div>

        {/* Social links */}
        {profile && socialLinks.some((s) => profile[s.key]) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {socialLinks.map(({ key, label, prefix, clean }) =>
              profile[key] ? (
                <a
                  key={key}
                  href={prefix ? prefix + clean(profile[key]) : clean(profile[key])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-accent transition-colors border border-border hover:border-accent/40 px-2.5 py-1 rounded-full"
                >
                  <ExternalLink className="w-3 h-3" />
                  {label}
                </a>
              ) : null
            )}
          </div>
        )}

        {!isOwnProfile && currentUser && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={`font-body text-sm font-semibold px-6 py-2 rounded-lg transition-colors ${
                isFollowing
                  ? "border border-border text-foreground hover:border-accent/40"
                  : "bg-accent text-accent-foreground hover:bg-accent/90"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              onClick={() => setShowDM(true)}
              className="flex items-center gap-1.5 font-body text-sm font-semibold px-4 py-2 rounded-lg border border-border text-foreground hover:border-accent/40 hover:text-accent transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
          </div>
        )}
      </div>

      {/* Streaks and Achievements */}
      {profile && (
        <div className="space-y-6 mb-6">
          {profile.reading_streak && (
            <div className="p-6 rounded-xl border border-border bg-card">
              <StreakDisplay readingStreak={profile.reading_streak} />
            </div>
          )}

          {profile.achievements && profile.achievements.length > 0 && (
            <div className="p-6 rounded-xl border border-border bg-card">
              <AchievementBadges achievements={profile.achievements} />
            </div>
          )}
        </div>
      )}

      {/* Posts */}
      <div className="mb-3">
        <span className="font-body text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          {posts.length} Posts
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Grid className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <ProfilePostCard key={post.id} post={post} currentUser={currentUser} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showEdit && (
          <EditProfileModal
            profile={profile}
            currentUser={currentUser}
            onClose={() => setShowEdit(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDM && currentUser && (
          <DirectMessageModal
            currentUser={currentUser}
            recipientEmail={profileEmail}
            recipientName={profile?.display_name || profileEmail}
            onClose={() => setShowDM(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}