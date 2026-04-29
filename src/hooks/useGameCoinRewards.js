import { useCallback } from "react";
import { db } from "@/api/supabaseClient";
import { toast } from "sonner";

export function useGameCoinRewards(userEmail) {
  const awardCoinsForGameCompletion = useCallback(
    async (gameType, score, difficulty = "normal") => {
      if (!userEmail) return;

      try {
        const res = await db.functions.invoke("awardGameCoins", {
          gameType,
          score,
          difficulty,
        });
        
        toast.success(`+${res.data.coinsAwarded} Coins earned!`, {
          description: `You earned coins for playing ${gameType}`,
        });
        
        return res.data;
      } catch (error) {
        console.error("Failed to award coins:", error);
      }
    },
    [userEmail]
  );

  return { awardCoinsForGameCompletion };
}