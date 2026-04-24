import React from "react";
import { Edit3, Calendar, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function ProfileHeader({ user, profile, onEditAvatar }) {
  const joinDate = user?.created_date ? formatDistanceToNow(new Date(user.created_date), { addSuffix: true }) : "Recently";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Avatar */}
        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center overflow-hidden border-4 border-accent/20 relative"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl sm:text-5xl">
                {profile?.avatar_emoji || user.full_name?.charAt(0).toUpperCase() || "👤"}
              </span>
            )}
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditAvatar}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-lg"
            title="Customize avatar"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="font-display text-3xl font-bold text-foreground mb-1">{user.full_name}</h2>
          <p className="font-body text-muted-foreground text-sm mb-4">{user.email}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="font-body text-sm">Joined {joinDate}</span>
            </div>
            {profile?.total_points !== undefined && (
              <div className="flex items-center gap-2 text-accent">
                <Trophy className="w-4 h-4" />
                <span className="font-body text-sm font-semibold">{profile.total_points} Total Points</span>
              </div>
            )}
          </div>

          {profile?.bio && <p className="font-body text-sm text-foreground mt-3 italic">{profile.bio}</p>}
        </div>
      </div>
    </motion.div>
  );
}