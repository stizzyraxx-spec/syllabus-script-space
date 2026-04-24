import React, { useState } from "react";
import { Award, Star, BookOpen, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const ACHIEVEMENT_ICONS = {
  streak: Zap,
  plan_completion: BookOpen,
  reading_milestone: Star,
};

const ACHIEVEMENT_COLORS = {
  streak: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
  plan_completion: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  reading_milestone: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
};

export default function AchievementBadges({ achievements = [] }) {
  const [hoveredBadge, setHoveredBadge] = useState(null);

  if (achievements.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        <Award className="w-3.5 h-3.5" /> Achievements
      </div>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {achievements.map((achievement, idx) => {
            const Icon = ACHIEVEMENT_ICONS[achievement.type] || Award;
            const colors = ACHIEVEMENT_COLORS[achievement.type] || ACHIEVEMENT_COLORS.reading_milestone;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredBadge(achievement.id)}
                onMouseLeave={() => setHoveredBadge(null)}
                className="relative"
              >
                <div
                  className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center cursor-help transition-transform hover:scale-110`}
                >
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                <AnimatePresence>
                  {hoveredBadge === achievement.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 rounded-lg bg-card border border-border shadow-lg whitespace-nowrap z-10"
                    >
                      <p className="font-body text-xs font-semibold text-foreground">{achievement.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked_date && (
                        <p className="font-body text-[9px] text-accent mt-1">
                          {format(new Date(achievement.unlocked_date), "MMM d, yyyy")}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}