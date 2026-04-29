import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/supabaseClient";

export default function RPGLeaderboardView({ onBack }) {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["rpg-leaderboard"],
    queryFn: () => db.entities.RPGLeaderboard.list("-final_score", 50),
    refetchInterval: 30000,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black overflow-y-auto py-8 px-4"
    >
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="max-w-3xl mx-auto pt-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Trophy className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="font-display text-5xl font-bold text-white">Leaderboard</h1>
          <p className="text-white/60 text-lg mt-2">Top moral achievers across all journeys</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-12 text-center"
          >
            <p className="text-white/60 text-lg">No scores yet. Play to be ranked!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                      {idx === 0 ? (
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      ) : idx === 1 ? (
                        <Medal className="w-5 h-5 text-gray-300" />
                      ) : idx === 2 ? (
                        <Medal className="w-5 h-5 text-orange-400" />
                      ) : (
                        <span className="font-display font-bold text-white/60">#{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <p className="font-display text-lg font-bold text-white">
                        {entry.player_name || "Anonymous Seeker"}
                      </p>
                      <p className="text-white/60 text-sm">
                        {entry.character_id} • Level {entry.final_level}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-white">
                      {entry.final_score.toLocaleString()}
                    </p>
                    <p className="text-white/60 text-xs">points</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
                  {[
                    { label: "Faith", value: entry.faith_final },
                    { label: "Wisdom", value: entry.wisdom_final },
                    { label: "Obedience", value: entry.obedience_final },
                    { label: "Integrity", value: entry.integrity_final },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-white/50 text-xs mb-1">{stat.label}</p>
                      <p className="font-display font-bold text-white text-sm">{stat.value || 0}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}