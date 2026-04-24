import { useState, useEffect, useCallback } from "react";

const ENCOUNTER_TABLE = {
  jerusalem: [
    { name: "Roman Soldier", type: "soldier", difficulty: 1 },
    { name: "Tempter Spirit", type: "demon", difficulty: 1.5 },
    { name: "Pharisaical Legalist", type: "legalist", difficulty: 1.8 },
    { name: "False Prophet", type: "false_prophet", difficulty: 2.0 },
  ],
  egypt: [
    { name: "Oppressor Spirit", type: "oppressor", difficulty: 1.3 },
    { name: "Plague Spirit", type: "demon", difficulty: 2 },
    { name: "Pagan Priest", type: "priest", difficulty: 1.6 },
    { name: "Syncretist Spirit", type: "syncretist", difficulty: 1.9 },
  ],
  babylon: [
    { name: "Pagan Priest", type: "priest", difficulty: 1.4 },
    { name: "Arch-Heretic", type: "heretic", difficulty: 2.5 },
    { name: "Prosperity Spirit", type: "prosperity_spirit", difficulty: 2.0 },
    { name: "Temple Guard", type: "guard", difficulty: 1.8 },
  ],
  wilderness: [
    { name: "Wild Beast", type: "beast", difficulty: 1.2 },
    { name: "Specter of Doubt", type: "doubt_specter", difficulty: 1.8 },
    { name: "Gnostic Deceiver", type: "gnostic", difficulty: 2.0 },
    { name: "Bandit", type: "outlaw", difficulty: 1.1 },
  ],
  rome: [
    { name: "Roman Soldier", type: "soldier", difficulty: 2.5 },
    { name: "Nihilist Spirit", type: "nihilist", difficulty: 2.3 },
    { name: "Syncretist Spirit", type: "syncretist", difficulty: 2.2 },
    { name: "Fallen Angel", type: "fallen_angel", difficulty: 2.8 },
  ],
  default: [
    { name: "Demon of Temptation", type: "demon", difficulty: 1.5 },
    { name: "Specter of Doubt", type: "doubt_specter", difficulty: 1.6 },
    { name: "Gnostic Deceiver", type: "gnostic", difficulty: 1.8 },
    { name: "False Prophet", type: "false_prophet", difficulty: 2.0 },
    { name: "Spirit of Nihilism", type: "nihilist", difficulty: 2.1 },
  ],
};

export function useRandomEncounter(playerLevel, currentLocation) {
  const [encounter, setEncounter] = useState(null);
  const [encounterActive, setEncounterActive] = useState(false);

  // Determine encounter chance based on level (increases with progression)
  const getEncounterChance = useCallback(() => {
    // Early game: 15% every 30-60 sec
    // Late game: 35% every 30-60 sec
    const baseChance = 0.15 + Math.min(playerLevel * 0.015, 0.2);
    return Math.random() < baseChance;
  }, [playerLevel]);

  // Get random enemy from current location with exponential scaling
  const getRandomEnemy = useCallback(() => {
    const enemies = ENCOUNTER_TABLE[currentLocation] || ENCOUNTER_TABLE.wilderness;
    const baseEnemy = enemies[Math.floor(Math.random() * enemies.length)];

    // Exponential difficulty scaling (gets MUCH harder late game)
    const difficultyMultiplier = Math.pow(playerLevel / 3, 2.1);
    const scaledDifficulty = baseEnemy.difficulty * difficultyMultiplier;

    return {
      ...baseEnemy,
      scaledDifficulty,
      hp: Math.floor(60 + playerLevel * 20 + scaledDifficulty * 30),
      damage: Math.floor(12 + playerLevel * 7 + scaledDifficulty * 12),
    };
  }, [currentLocation, playerLevel]);

  // Trigger encounter check every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!encounterActive && getEncounterChance()) {
        const enemy = getRandomEnemy();
        setEncounter(enemy);
        setEncounterActive(true);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [encounterActive, getEncounterChance, getRandomEnemy]);

  const dismissEncounter = useCallback(() => {
    setEncounterActive(false);
    setEncounter(null);
  }, []);

  const acceptEncounter = useCallback(() => {
    // Keep encounter active for combat
    return encounter;
  }, [encounter]);

  return { encounter, encounterActive, dismissEncounter, acceptEncounter };
}