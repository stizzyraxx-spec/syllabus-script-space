import React from "react";
import { Flame, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakDisplay({ readingStreak }) {
  if (!readingStreak) {
    return null;
  }

  const { current_streak = 0, longest_streak = 0, total_reading_days = 0 } = readingStreak;

  const streakStats = [
    {
      icon: Flame,
      label: "Current Streak",
      value: current_streak,
      unit: "days",
      color: "text-orange-500",
    },
    {
      icon: TrendingUp,
      label: "Longest Streak",
      value: longest_streak,
      unit: "days",
      color: "text-amber-600",
    },
    {
      icon: Calendar,
      label: "Total Reading Days",
      value: total_reading_days,
      unit: "days",
      color: "text-green-600",
    },
  ];

  return (
    <div>
      <div className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        <Flame className="w-3.5 h-3.5" /> Reading Streaks
      </div>
      <div className="grid grid-cols-3 gap-3">
        {streakStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-lg bg-secondary/50 border border-border text-center"
            >
              <Icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
              <p className="font-display text-lg font-bold text-foreground">{stat.value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}