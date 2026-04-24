import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Lock } from "lucide-react";

const CATEGORIES = {
  combat: { name: "Combat", color: "from-red-500 to-red-600" },
  exploration: { name: "Exploration", color: "from-blue-500 to-blue-600" },
  progression: { name: "Progression", color: "from-purple-500 to-purple-600" },
  skills: { name: "Skills", color: "from-green-500 to-green-600" },
};

export default function AchievementPanel({ achievements, unlockedAchievements, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState("combat");
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const categoryAchievements = achievements.filter(
    (a) => a.category === selectedCategory
  );

  const isAchievementUnlocked = (achievementId) =>
    unlockedAchievements.some((a) => a.achievement_id === achievementId && a.is_unlocked);

  const unlockedInCategory = categoryAchievements.filter((a) =>
    isAchievementUnlocked(a.id)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div className="max-w-3xl w-full py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" />
            <div>
              <h2 className="font-display text-3xl font-bold text-white">Achievements</h2>
              <p className="text-white/60 text-sm">
                {unlockedAchievements.length}/{achievements.length} unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {Object.entries(CATEGORIES).map(([key, category]) => {
            const count = achievements.filter((a) => a.category === key).length;
            const unlocked = achievements.filter(
              (a) => a.category === key && isAchievementUnlocked(a.id)
            ).length;

            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-body text-sm font-semibold transition-all flex-shrink-0 ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${category.color} text-white`
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-70">
                  {unlocked}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {categoryAchievements.map((achievement) => {
            const unlocked = isAchievementUnlocked(achievement.id);
            return (
              <motion.button
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedAchievement(achievement)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  unlocked
                    ? "border-accent bg-accent/20"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-white">
                        {achievement.name}
                      </h3>
                      <p className="text-white/60 text-xs mt-1">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {unlocked ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-accent/30 text-accent text-xs font-semibold">
                            <Star className="w-3 h-3" />
                            Unlocked
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-white/60 text-xs">
                            <Lock className="w-3 h-3" />
                            Locked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-1">
                    <span className="font-display font-bold text-accent">+{achievement.xp}</span>
                    <span className="text-xs text-white/60">XP</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border-2 border-accent rounded-xl p-6 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-4">{selectedAchievement.icon}</div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {selectedAchievement.name}
                </h3>
              </div>

              <p className="text-white/70 text-sm mb-4 text-center">
                {selectedAchievement.description}
              </p>

              <div className="bg-white/10 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">XP Reward</span>
                  <span className="font-display font-bold text-accent text-lg">
                    +{selectedAchievement.xp}
                  </span>
                </div>
              </div>

              {isAchievementUnlocked(selectedAchievement.id) && (
                <div className="bg-accent/20 border border-accent rounded-lg p-3 mb-6 text-center">
                  <p className="text-accent font-semibold text-sm">✓ Unlocked</p>
                </div>
              )}

              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-body font-semibold transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}