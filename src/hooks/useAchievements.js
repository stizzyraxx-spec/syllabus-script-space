import { useEffect, useCallback } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ACHIEVEMENT_DEFINITIONS = [
  // Combat achievements
  {
    id: "first_victory",
    name: "First Blood",
    description: "Win your first combat encounter",
    icon: "⚔️",
    category: "combat",
    xp: 50,
    condition: (stats) => stats.combatWins >= 1,
  },
  {
    id: "veteran_warrior",
    name: "Veteran Warrior",
    description: "Win 10 combat encounters",
    icon: "🛡️",
    category: "combat",
    xp: 150,
    condition: (stats) => stats.combatWins >= 10,
  },
  {
    id: "combat_master",
    name: "Combat Master",
    description: "Win 50 combat encounters",
    icon: "👑",
    category: "combat",
    xp: 500,
    condition: (stats) => stats.combatWins >= 50,
  },

  // Exploration achievements
  {
    id: "explorer",
    name: "Explorer",
    description: "Visit every location in the realm",
    icon: "🗺️",
    category: "exploration",
    xp: 200,
    condition: (stats) => stats.locationsVisited >= 5,
  },
  {
    id: "world_traveler",
    name: "World Traveler",
    description: "Complete missions in every location",
    icon: "✈️",
    category: "exploration",
    xp: 300,
    condition: (stats) => stats.missionsCompletedPerLocation >= 5,
  },

  // Progression achievements
  {
    id: "rising_seeker",
    name: "Rising Seeker",
    description: "Reach level 5",
    icon: "📈",
    category: "progression",
    xp: 100,
    condition: (stats) => stats.level >= 5,
  },
  {
    id: "legendary_prophet",
    name: "Legendary Prophet",
    description: "Reach level 20",
    icon: "🌟",
    category: "progression",
    xp: 500,
    condition: (stats) => stats.level >= 20,
  },
  {
    id: "faith_seeker",
    name: "Faith Seeker",
    description: "Reach 200 Faith score",
    icon: "✨",
    category: "progression",
    xp: 150,
    condition: (stats) => stats.faith >= 200,
  },
  {
    id: "wisdom_keeper",
    name: "Wisdom Keeper",
    description: "Reach 200 Wisdom score",
    icon: "🧠",
    category: "progression",
    xp: 150,
    condition: (stats) => stats.wisdom >= 200,
  },
  {
    id: "obedient_soul",
    name: "Obedient Soul",
    description: "Reach 200 Obedience score",
    icon: "🙏",
    category: "progression",
    xp: 150,
    condition: (stats) => stats.obedience >= 200,
  },
  {
    id: "righteous_heart",
    name: "Righteous Heart",
    description: "Reach 200 Integrity score",
    icon: "❤️",
    category: "progression",
    xp: 150,
    condition: (stats) => stats.integrity >= 200,
  },

  // Skill achievements
  {
    id: "skill_master",
    name: "Skill Master",
    description: "Unlock 10 skills in the skill tree",
    icon: "🎯",
    category: "skills",
    xp: 250,
    condition: (stats) => stats.skillsUnlocked >= 10,
  },
  {
    id: "path_ascender",
    name: "Path Ascender",
    description: "Max out one complete skill path",
    icon: "🔱",
    category: "skills",
    xp: 300,
    condition: (stats) => stats.maxedPaths >= 1,
  },
];

export function useAchievements(playerEmail, playerStats) {
  const queryClient = useQueryClient();

  // Fetch player achievements
  const { data: playerAchievements } = useQuery({
    queryKey: ["player-achievements", playerEmail],
    queryFn: () =>
      db.entities.PlayerAchievement.filter({
        player_email: playerEmail,
      }),
  });

  // Mutation to unlock achievement
  const unlockMutation = useMutation({
    mutationFn: async (achievementId) => {
      const existing = playerAchievements?.find(
        (a) => a.achievement_id === achievementId && a.is_unlocked
      );
      if (existing) return; // Already unlocked

      const achievement = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
      if (!achievement) return;

      const existingRecord = playerAchievements?.find(
        (a) => a.achievement_id === achievementId
      );

      if (existingRecord) {
        await db.entities.PlayerAchievement.update(existingRecord.id, {
          is_unlocked: true,
          unlocked_date: new Date().toISOString(),
          progress: 100,
        });
      } else {
        await db.entities.PlayerAchievement.create({
          player_email: playerEmail,
          achievement_id: achievementId,
          is_unlocked: true,
          unlocked_date: new Date().toISOString(),
          progress: 100,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-achievements", playerEmail] });
    },
  });

  // Check and unlock achievements
  useEffect(() => {
    if (!playerStats) return;

    const stats = {
      level: playerStats.level || 0,
      faith: playerStats.faith_score || 0,
      wisdom: playerStats.wisdom_score || 0,
      obedience: playerStats.obedience_score || 0,
      integrity: playerStats.integrity_score || 0,
      combatWins: playerStats.combatWins || 0,
      locationsVisited: playerStats.locationsVisited || 0,
      missionsCompletedPerLocation: playerStats.missionsCompletedPerLocation || 0,
      skillsUnlocked: playerStats.skillsUnlocked || 0,
      maxedPaths: playerStats.maxedPaths || 0,
    };

    ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
      const isUnlocked = playerAchievements?.find(
        (a) => a.achievement_id === achievement.id && a.is_unlocked
      );

      if (!isUnlocked && achievement.condition(stats)) {
        unlockMutation.mutate(achievement.id);
      }
    });
  }, [playerStats, playerAchievements, unlockMutation]);

  // Get achievement details
  const getAchievementDetails = useCallback((achievementId) => {
    return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
  }, []);

  // Get unlocked achievements
  const unlockedAchievements = playerAchievements?.filter((a) => a.is_unlocked) || [];

  return {
    achievements: ACHIEVEMENT_DEFINITIONS,
    unlockedAchievements,
    getAchievementDetails,
    unlockAchievement: (id) => unlockMutation.mutate(id),
  };
}