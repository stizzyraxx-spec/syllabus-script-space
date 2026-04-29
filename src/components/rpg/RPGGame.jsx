import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MouseProvider } from "@/lib/MouseContext";
import CursorTrail from "@/components/effects/CursorTrail";
import RPGEntry from "./RPGEntry";
import RPGCharacterSelect from "./RPGCharacterSelect";
import RPGWorld from "./RPGWorld";
import RPGMission from "./RPGMission";
import RPGStats from "./RPGStats";
import RPGLeaderboardView from "./RPGLeaderboardView";

const CHARACTER_DATA = {
  david: {
    name: "David",
    backstory: "From shepherd boy to king, testing faith through temptation and sin",
    traits: ["courage", "faith", "vulnerability"],
    color: "#FF6B6B"
  },
  moses: {
    name: "Moses",
    backstory: "Leading a nation through wilderness, struggling with obedience and doubt",
    traits: ["leadership", "wisdom", "patience"],
    color: "#696969"
  },
  joseph: {
    name: "Joseph",
    backstory: "From pit to palace, maintaining integrity amid injustice and betrayal",
    traits: ["integrity", "faith", "forgiveness"],
    color: "#FFD93D"
  },
  daniel: {
    name: "Daniel",
    backstory: "In foreign lands, choosing conviction over compromise with power",
    traits: ["conviction", "wisdom", "faith"],
    color: "#6BCB77"
  },
  paul: {
    name: "Paul",
    backstory: "From persecutor to apostle, spreading gospel amid persecution and suffering",
    traits: ["redemption", "passion", "obedience"],
    color: "#4D96FF"
  },
  esther: {
    name: "Esther",
    backstory: "Hidden identity revealed, risking everything to save her people",
    traits: ["courage", "sacrifice", "wisdom"],
    color: "#FFB6C1"
  },
  peter: {
    name: "Peter",
    backstory: "From denier to rock, learning faith through failure and restoration",
    traits: ["redemption", "faith", "growth"],
    color: "#FF8C42"
  }
};

export default function RPGGame({ userEmail }) {
  const [gameState, setGameState] = useState("entry"); // entry, character, world, mission, stats, leaderboard
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [playerProgress, setPlayerProgress] = useState(null);
  const [currentMission, setCurrentMission] = useState(null);
  const [theologianMode, settheologianMode] = useState(false);
  const [modernMode, setModernMode] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadProgress = async () => {
      // First try to load from database
      if (selectedCharacter && userEmail) {
        try {
          const existing = await db.entities.RPGPlayerProgress.filter({
            player_email: userEmail,
            character_id: selectedCharacter,
          });
          if (existing && existing.length > 0) {
            setPlayerProgress(existing[0]);
            return;
          }
        } catch (err) {
          console.error("Failed to load progress from database:", err);
        }
      }
      // Fallback to session storage
      const savedProgress = sessionStorage.getItem(`rpg_progress_${selectedCharacter}`);
      if (savedProgress) {
        setPlayerProgress(JSON.parse(savedProgress));
      }
    };
    loadProgress();
  }, [selectedCharacter, userEmail]);

  const handleCharacterSelect = async (charId) => {
    setSelectedCharacter(charId);
    setGameState("world");
    
    try {
      // Check if progress exists in database
      const existing = await db.entities.RPGPlayerProgress.filter({
        player_email: userEmail,
        character_id: charId,
      });

      if (existing && existing.length > 0) {
        // Load existing progress and cache it
        setPlayerProgress(existing[0]);
        sessionStorage.setItem(`rpg_progress_${charId}`, JSON.stringify(existing[0]));
      } else {
        // Create new progress record
        const newProgress = await db.entities.RPGPlayerProgress.create({
          player_email: userEmail,
          character_id: charId,
          level: 1,
          xp: 0,
          faith_score: 0,
          wisdom_score: 0,
          obedience_score: 0,
          integrity_score: 0,
          completed_missions: [],
          play_streak: 0,
          total_score: 0,
        });
        setPlayerProgress(newProgress);
        sessionStorage.setItem(`rpg_progress_${charId}`, JSON.stringify(newProgress));
      }
    } catch (err) {
      console.error("Failed to load/create progress:", err);
      // Fallback to temp progress
      const fallbackProgress = {
        character_id: charId,
        level: 1,
        xp: 0,
        faith_score: 0,
        wisdom_score: 0,
        obedience_score: 0,
        integrity_score: 0,
        completed_missions: [],
        play_streak: 0,
        total_score: 0,
      };
      setPlayerProgress(fallbackProgress);
      sessionStorage.setItem(`rpg_progress_${charId}`, JSON.stringify(fallbackProgress));
    }
  };

  const handleStartMission = (missionId, email, charId, location) => {
    const missionCount = (playerProgress?.completed_missions?.length || 0) + 1;
    const completedThemes = (playerProgress?.completed_missions || [])
      .map(m => m.theme)
      .filter(Boolean);
    setCurrentMission({ id: missionId, missionCount, completedThemes, userEmail: email, characterId: charId, location });
    setGameState("mission");
  };

  const handleMissionComplete = async (scoreData) => {
    // Apply 2x multiplier in Theologian Mode
    const multiplier = theologianMode ? 2 : 1;
    const adjustedData = {
      ...scoreData,
      xp: scoreData.xp * multiplier,
      faith_score: (scoreData.faith_score || 0) * multiplier,
      wisdom_score: (scoreData.wisdom_score || 0) * multiplier,
      obedience_score: (scoreData.obedience_score || 0) * multiplier,
      integrity_score: (scoreData.integrity_score || 0) * multiplier,
    };

    // Ensure level calculation from xp if not provided
    const finalLevel = scoreData.level || Math.floor((playerProgress.xp + scoreData.xp) / 100) + 1;
    
    const updated = {
      ...playerProgress,
      ...adjustedData,
      level: finalLevel,
      completed_missions: [...(playerProgress.completed_missions || []), { ...currentMission, theme: scoreData.missionTitle || currentMission.id }],
    };
    setPlayerProgress(updated);
    sessionStorage.setItem(`rpg_progress_${selectedCharacter}`, JSON.stringify(updated));
    
    // Save to database if ID exists
    if (playerProgress?.id) {
      try {
        await db.entities.RPGPlayerProgress.update(playerProgress.id, updated);
      } catch (err) {
        console.error("Failed to save mission complete:", err);
      }
    }
    
    // Save score to leaderboard after every mission
    try {
      await db.entities.RPGLeaderboard.create({
        session_id: sessionId,
        character_id: selectedCharacter,
        final_score: updated.total_score,
        final_level: updated.level,
        faith_final: updated.faith_score,
        wisdom_final: updated.wisdom_score,
        obedience_final: updated.obedience_score,
        integrity_final: updated.integrity_score,
        missions_completed: updated.completed_missions.length,
        playtime_minutes: 0,
      });
      queryClient.invalidateQueries({ queryKey: ["rpg-leaderboard"] });
    } catch (err) {
      console.error("Failed to save leaderboard entry:", err);
    }
    
    setGameState("world");
  };

  const handleReturnToWorld = () => {
    setGameState("world");
    setCurrentMission(null);
  };

  const handleViewStats = () => {
    setGameState("stats");
  };

  const handleViewLeaderboard = () => {
    setGameState("leaderboard");
  };

  const handleGameReset = () => {
    setGameState("entry");
    setSelectedCharacter(null);
    setPlayerProgress(null);
    setCurrentMission(null);
  };

  return (
    <MouseProvider>
      <div className="min-h-screen bg-black overflow-hidden">
        <CursorTrail />
        <AnimatePresence mode="wait">
        {gameState === "entry" && (
          <RPGEntry key="entry" onEnter={() => setGameState("character")} />
        )}

        {gameState === "character" && (
          <RPGCharacterSelect
            key="character"
            characters={CHARACTER_DATA}
            onSelect={handleCharacterSelect}
            theologianMode={theologianMode}
            ontheologianModeChange={settheologianMode}
            modernMode={modernMode}
            onModernModeChange={setModernMode}
          />
        )}

        {gameState === "world" && playerProgress && (
          <RPGWorld
            key="world"
            character={CHARACTER_DATA[selectedCharacter]}
            progress={playerProgress}
            userEmail={userEmail}
            characterId={selectedCharacter}
            theologianMode={theologianMode}
            modernMode={modernMode}
            onStartMission={handleStartMission}
            onViewStats={handleViewStats}
            onViewLeaderboard={handleViewLeaderboard}
            onReset={handleGameReset}
          />
        )}

        {gameState === "mission" && playerProgress && currentMission && (
          <RPGMission
            key={`mission-${currentMission.id}-${Date.now()}`}
            missionTheme={currentMission}
            character={selectedCharacter}
            characterData={CHARACTER_DATA[selectedCharacter]}
            progress={playerProgress}
            userEmail={userEmail}
            theologianMode={theologianMode}
            modernMode={modernMode}
            onMissionComplete={handleMissionComplete}
            onReturn={handleReturnToWorld}
          />
        )}

        {gameState === "stats" && playerProgress && (
          <RPGStats
            key="stats"
            character={CHARACTER_DATA[selectedCharacter]}
            progress={playerProgress}
            onBack={() => setGameState("world")}
          />
        )}

        {gameState === "leaderboard" && (
          <RPGLeaderboardView
            key="leaderboard"
            onBack={() => setGameState("world")}
          />
        )}
      </AnimatePresence>
      </div>
    </MouseProvider>
  );
}