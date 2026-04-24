import { useCallback } from "react";

export function useGameDifficulty(playerLevel, missionCount = 0) {
  // Exponential difficulty scaling
  const getEncounterDifficulty = useCallback(() => {
    // Difficulty multiplier increases exponentially with level
    // Level 1-5: 0.8-1.2x
    // Level 10: 2.5x
    // Level 20: 6x
    // Level 30: 15x
    const baseDifficulty = Math.pow(playerLevel / 5, 2.2);
    const missionScaling = 1 + missionCount * 0.1; // Each mission adds 10% difficulty
    return baseDifficulty * missionScaling;
  }, [playerLevel, missionCount]);

  // Enemy stat scaling
  const getEnemyStats = useCallback((baseHP, baseDamage) => {
    const difficulty = getEncounterDifficulty();
    return {
      hp: Math.floor(baseHP * (1 + difficulty * 1.5)),
      damage: Math.floor(baseDamage * (1 + difficulty * 0.8)),
      xpReward: Math.floor(50 * difficulty),
    };
  }, [getEncounterDifficulty]);

  // XP requirements scale exponentially
  const getXpRequiredForLevel = useCallback((level) => {
    return Math.floor(100 * Math.pow(level, 1.8));
  }, []);

  // Total XP to reach level
  const getTotalXpForLevel = useCallback((level) => {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += getXpRequiredForLevel(i);
    }
    return total;
  }, [getXpRequiredForLevel]);

  return {
    difficulty: getEncounterDifficulty(),
    getEnemyStats,
    getXpRequiredForLevel,
    getTotalXpForLevel,
  };
}