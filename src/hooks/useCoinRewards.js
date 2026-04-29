import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/api/supabaseClient";

export function useCoinRewards(userEmail) {
  const queryClient = useQueryClient();

  const awardCoinsForGame = useMutation({
    mutationFn: async ({ gameType, score, difficulty = "normal" }) => {
      const res = await db.functions.invoke("awardGameCoins", {
        gameType,
        score,
        difficulty,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-coins", userEmail] });
    },
  });

  return { awardCoinsForGame };
}