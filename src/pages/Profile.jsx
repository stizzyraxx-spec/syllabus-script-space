import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStatsSection from "@/components/profile/ProfileStatsSection";
import FriendsManager from "@/components/profile/FriendsManager";
import AvatarCustomizer from "@/components/profile/AvatarCustomizer";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
      setLoading(false);
    });
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.UserProfile.filter({ user_email: user.email }).then((d) => d[0])
        : Promise.resolve(null),
    enabled: !!user?.email,
  });

  const { data: gameScores = [] } = useQuery({
    queryKey: ["game-scores", user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.GameScore.filter({ player_email: user.email }, "-created_date", 100)
        : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.PlayerAchievement.filter({ player_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="font-body text-muted-foreground">Sign in to view your profile</p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Your Profile</h1>
            <p className="font-body text-primary-foreground/70 text-sm mt-1">
              Manage your profile, achievements, and friends
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Profile Header with Avatar */}
          <div className="relative">
            <ProfileHeader
              user={user}
              profile={profile}
              onEditAvatar={() => setShowAvatarCustomizer(true)}
            />
          </div>

          {/* Avatar Customizer Modal */}
          {showAvatarCustomizer && (
            <AvatarCustomizer user={user} profile={profile} onClose={() => setShowAvatarCustomizer(false)} />
          )}

          {/* Stats Grid */}
          <ProfileStatsSection gameScores={gameScores} achievements={achievements} />

          {/* Friends Section */}
          <FriendsManager user={user} profile={profile} />
        </motion.div>
      </div>
    </div>
  );
}