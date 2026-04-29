import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Flame, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DailyBonusCard({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: todayBonus } = useQuery({
    queryKey: ["daily-bonus", userEmail],
    queryFn: () =>
      userEmail
        ? db.entities.DailyBonus.filter({
            player_email: userEmail,
            bonus_date: new Date().toISOString().split("T")[0],
          })
        : Promise.resolve([]),
    enabled: !!userEmail,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: lastBonus } = useQuery({
    queryKey: ["last-bonus", userEmail],
    queryFn: () =>
      userEmail
        ? db.entities.DailyBonus.filter(
            { player_email: userEmail },
            "-created_date",
            1
          )
        : Promise.resolve([]),
    enabled: !!userEmail,
  });

  const claimMutation = useMutation({
    mutationFn: () => db.functions.invoke("claimDailyBonus", {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["daily-bonus", userEmail] });
      queryClient.invalidateQueries({ queryKey: ["player-coins", userEmail] });
      toast.success(`+${res.data.coinsEarned} Coins! Streak: ${res.data.streakDays} 🔥`);
    },
    onError: (err) => {
      if (err.response?.status === 400) {
        toast.info("Already claimed today! Come back tomorrow.");
      } else {
        toast.error("Failed to claim bonus");
      }
    },
  });

  const isClaimed = todayBonus && todayBonus.length > 0;
  const streak = lastBonus && lastBonus.length > 0 ? lastBonus[0].streak_days || 0 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 p-4 transition-all ${
        isClaimed
          ? "border-accent/30 bg-accent/10"
          : "border-accent bg-gradient-to-br from-accent/20 to-transparent hover:border-accent/80"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-accent" />
          <h3 className="font-display text-sm font-bold text-foreground">Daily Bonus</h3>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5 text-yellow-500" />
            <span className="font-body text-xs font-bold text-yellow-600">{streak}</span>
          </div>
        )}
      </div>

      {isClaimed ? (
        <div className="text-center py-4">
          <Lock className="w-6 h-6 text-accent/50 mx-auto mb-2" />
          <p className="font-body text-xs text-muted-foreground">Claimed today</p>
          <p className="font-body text-xs text-accent font-semibold mt-1">
            +{todayBonus[0].coins_earned} Coins
          </p>
        </div>
      ) : (
        <>
          <p className="font-body text-xs text-muted-foreground mb-3">
            {streak > 0
              ? `${50 + streak * 5} coins + ${streak * 5} streak bonus`
              : "50 coins + streak bonuses"}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
            className="w-full py-2 rounded-lg bg-accent text-accent-foreground font-body text-xs font-bold hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {claimMutation.isPending ? "Claiming..." : "Claim Now"}
          </motion.button>
        </>
      )}
    </motion.div>
  );
}