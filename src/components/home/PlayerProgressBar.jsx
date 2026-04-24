import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Zap, Award } from "lucide-react";

const LEVEL_TITLES = ["Seeker", "Disciple", "Servant", "Warrior", "Prophet"];

export default function PlayerProgressBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
    });
  }, []);

  const { data: playerProgress } = useQuery({
    queryKey: ["player-progress", user?.email],
    queryFn: () =>
      base44.entities.RPGPlayerProgress.filter({
        player_email: user?.email,
      }),
    enabled: !!user?.email,
  });

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile", user?.email],
    queryFn: () =>
      base44.entities.UserProfile.filter({
        user_email: user?.email,
      }),
    enabled: !!user?.email,
  });

  if (!user || !playerProgress || playerProgress.length === 0) {
    return null;
  }

  const progress = playerProgress[0];
  const profile = userProfile?.[0];
  const totalPoints = profile?.total_points || 0;
  const currentLevel = Math.max(1, progress.level || 1);
  const currentXp = progress.xp || 0;
  const xpToNextLevel = currentLevel * 100;
  const xpInCurrentLevel = currentXp % xpToNextLevel;
  const xpProgress = (xpInCurrentLevel / xpToNextLevel) * 100;
  const levelTitle = LEVEL_TITLES[Math.min(currentLevel - 1, 4)];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-accent/40 rounded-xl p-4 md:p-6 mb-6 md:mb-8 w-full"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Award className="w-4 md:w-5 h-4 md:h-5 text-accent flex-shrink-0" />
          <div>
            <p className="text-white/60 text-xs font-body">Your RPG Progress</p>
            <p className="font-display text-base md:text-lg font-bold text-white">
              Level {currentLevel} • {levelTitle}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs font-body">Total XP</p>
          <p className="font-display text-lg md:text-xl font-bold text-accent">
            {currentXp.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-white/50 text-xs font-body">Experience to Next Level</p>
          <p className="text-white text-xs font-semibold">
            {Math.floor(xpInCurrentLevel)}/{xpToNextLevel}
          </p>
        </div>

        <div className="w-full h-3 rounded-full bg-white/10 border border-white/20 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Faith", value: progress.faith_score || 0 },
          { label: "Wisdom", value: progress.wisdom_score || 0 },
          { label: "Obedience", value: progress.obedience_score || 0 },
          { label: "Integrity", value: progress.integrity_score || 0 },
          { label: "Points Earned", value: totalPoints },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-white/50 text-xs mb-1">{stat.label}</p>
            <p className="font-display font-bold text-white text-sm">{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}