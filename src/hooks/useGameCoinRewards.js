import { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export function useGameCoinRewards(userEmail) {
  const awardCoinsForGameCompletion = useCallback(
    async (gameType, score, difficulty = "normal") => {
      if (!userEmail) return;

      try {
        const res = await base44.functions.invoke("awardGameCoins", {
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