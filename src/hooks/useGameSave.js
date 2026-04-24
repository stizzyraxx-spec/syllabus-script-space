import { useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useGameSave(playerEmail, progress) {
  // Save to database when component unmounts or progress changes
  useEffect(() => {
    return () => {
      // Save on unmount
      if (playerEmail && progress?.id) {
        const saveData = {
          level: progress.level,
          xp: progress.xp,
          faith_score: progress.faith_score,
          wisdom_score: progress.wisdom_score,
          obedience_score: progress.obedience_score,
          integrity_score: progress.integrity_score,
          completed_missions: progress.completed_missions || [],
          current_mission: progress.current_mission,
          total_score: progress.total_score,
        };
        // Fire and forget - don't await
        base44.entities.RPGPlayerProgress.update(progress.id, saveData).catch(err => 
          console.error("Save on unmount failed:", err)
        );
      }
    };
  }, [playerEmail, progress?.id]);

  // Auto-save every 15 seconds
  useEffect(() => {
    if (!playerEmail || !progress?.id) return;

    const interval = setInterval(() => {
      base44.entities.RPGPlayerProgress.update(progress.id, {
        level: progress.level,
        xp: progress.xp,
        faith_score: progress.faith_score,
        wisdom_score: progress.wisdom_score,
        obedience_score: progress.obedience_score,
        integrity_score: progress.integrity_score,
        completed_missions: progress.completed_missions || [],
        current_mission: progress.current_mission,
        total_score: progress.total_score,
      }).catch(err => console.error("Auto-save failed:", err));
    }, 15000);

    return () => clearInterval(interval);
  }, [playerEmail, progress]);

  // Manual save
  const manualSave = useCallback(async () => {
    if (!playerEmail || !progress?.id) return;

    try {
      await base44.entities.RPGPlayerProgress.update(progress.id, {
        level: progress.level,
        xp: progress.xp,
        faith_score: progress.faith_score,
        wisdom_score: progress.wisdom_score,
        obedience_score: progress.obedience_score,
        integrity_score: progress.integrity_score,
        completed_missions: progress.completed_missions || [],
        current_mission: progress.current_mission,
        total_score: progress.total_score,
      });
      return true;
    } catch (err) {
      console.error("Manual save failed:", err);
      return false;
    }
  }, [playerEmail, progress]);

  return { manualSave };
}