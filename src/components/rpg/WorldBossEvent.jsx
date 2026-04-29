import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Heart, Users } from "lucide-react";

export default function WorldBossEvent({ playerEmail, playerName, playerLevel }) {
  const [contributionDamage, setContributionDamage] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const queryClient = useQueryClient();

  // Fetch active world boss
  const { data: activeBoss } = useQuery({
    queryKey: ["active-world-boss"],
    queryFn: () =>
      db.entities.WorldBoss.filter({
        is_active: true,
      }).then((bosses) => (bosses.length > 0 ? bosses[0] : null)),
    refetchInterval: 3000,
  });

  // Fetch player's damage contribution
  const { data: playerDamageLog } = useQuery({
    queryKey: ["boss-damage-log", activeBoss?.id, playerEmail],
    queryFn: () =>
      db.entities.BossDamageLog.filter({
        boss_id: activeBoss?.id,
        player_email: playerEmail,
      }).then((logs) => (logs.length > 0 ? logs[0] : null)),
    refetchInterval: 2000,
    enabled: !!activeBoss,
  });

  // Fetch top contributors
  const { data: topContributors } = useQuery({
    queryKey: ["boss-top-contributors", activeBoss?.id],
    queryFn: () =>
      db.entities.BossDamageLog.filter({
        boss_id: activeBoss?.id,
      }),
    refetchInterval: 3000,
    enabled: !!activeBoss,
  });

  // Deal damage mutation
  const dealDamageMutation = useMutation({
    mutationFn: async () => {
      const baseDamage = Math.floor(10 + playerLevel * 3);
      const randomDamage = Math.floor(Math.random() * (baseDamage * 0.5));
      const totalDamage = baseDamage + randomDamage;

      // Check if player already has a log
      const existingLog = await db.entities.BossDamageLog.filter({
        boss_id: activeBoss.id,
        player_email: playerEmail,
      });

      if (existingLog.length > 0) {
        const log = existingLog[0];
        await db.entities.BossDamageLog.update(log.id, {
          damage_dealt: (log.damage_dealt || 0) + totalDamage,
        });
      } else {
        await db.entities.BossDamageLog.create({
          boss_id: activeBoss.id,
          player_email: playerEmail,
          player_name: playerName,
          damage_dealt: totalDamage,
        });
      }

      // Update boss health and total damage
      const newHealth = Math.max(0, activeBoss.health - totalDamage);
      const newTotalDamage = (activeBoss.total_damage || 0) + totalDamage;

      await db.entities.WorldBoss.update(activeBoss.id, {
        health: newHealth,
        total_damage: newTotalDamage,
        is_active: newHealth > 0,
      });

      setContributionDamage(totalDamage);

      // Refetch data
      queryClient.invalidateQueries({ queryKey: ["active-world-boss"] });
      queryClient.invalidateQueries({
        queryKey: ["boss-damage-log", activeBoss.id, playerEmail],
      });
      queryClient.invalidateQueries({
        queryKey: ["boss-top-contributors", activeBoss.id],
      });

      return totalDamage;
    },
  });

  if (!activeBoss) return null;

  const healthPercent = (activeBoss.health / activeBoss.max_health) * 100;
  const isDefeated = activeBoss.health <= 0;

  const sortedContributors = topContributors
    ? [...topContributors].sort((a, b) => (b.damage_dealt || 0) - (a.damage_dealt || 0))
    : [];

  const BOSS_EMOJIS = {
    demon: "👿",
    leviathan: "🐉",
    legion: "💀",
    abyss: "🌑",
  };

  return (
    <AnimatePresence>
      {activeBoss && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
        >
          <div className="bg-gradient-to-b from-destructive/20 to-destructive/10 border-2 border-destructive/50 rounded-xl p-6 backdrop-blur-sm">
            {/* Boss Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-5xl drop-shadow-lg">
                  {BOSS_EMOJIS[activeBoss.boss_type] || "👿"}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    {activeBoss.boss_name}
                  </h2>
                  <p className="text-white/60 text-sm">
                    {sortedContributors.length} players fighting
                  </p>
                </div>
              </div>
              {isDefeated && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  🏆
                </motion.div>
              )}
            </div>

            {/* Health Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Health</span>
                <span>
                  {Math.floor(activeBoss.health)} / {activeBoss.max_health}
                </span>
              </div>
              <div className="h-4 bg-black/50 rounded-full border border-destructive/50 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-red-500"
                  initial={{ width: `${healthPercent}%` }}
                  animate={{ width: `${healthPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Zap className="w-4 h-4 text-accent" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60">Total Damage</p>
                  <p className="text-white font-bold truncate">
                    {activeBoss.total_damage.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Users className="w-4 h-4 text-accent" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60">Participants</p>
                  <p className="text-white font-bold">
                    {sortedContributors.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Your Contribution */}
            {playerDamageLog && (
              <div className="mb-4 p-3 rounded-lg bg-accent/20 border border-accent/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white font-semibold">Your Contribution</p>
                  <p className="text-accent font-bold">
                    {((playerDamageLog.damage_dealt / (activeBoss.total_damage || 1)) * 100).toFixed(
                      1
                    )}
                  %
                  </p>
                </div>
                <p className="text-xs text-white/70">
                  Damage: {playerDamageLog.damage_dealt.toLocaleString()}
                </p>
              </div>
            )}

            {/* Top Contributors */}
            {sortedContributors.length > 0 && (
              <div className="mb-4 space-y-1">
                <p className="text-xs text-white/60 font-semibold">Top Contributors</p>
                {sortedContributors.slice(0, 3).map((contributor, idx) => (
                  <div
                    key={contributor.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-accent">#{idx + 1}</span>
                      <span className="text-white truncate">
                        {contributor.player_name}
                      </span>
                    </div>
                    <span className="text-white/70 font-bold">
                      {contributor.damage_dealt.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dealDamageMutation.mutate()}
              disabled={isDefeated || dealDamageMutation.isPending}
              className={`w-full py-3 rounded-lg font-display font-bold text-lg transition-all ${
                isDefeated
                  ? "bg-white/20 text-white/50 cursor-not-allowed"
                  : "bg-accent hover:bg-accent/90 text-accent-foreground"
              }`}
            >
              {isDefeated ? "Boss Defeated!" : "Attack Boss"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}