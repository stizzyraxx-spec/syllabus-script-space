import React from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

export default function GameCompletionModal({ character, finalStats, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/50 to-black flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-9xl mb-6"
        >
          👑
        </motion.div>

        <h1 className="font-display text-5xl font-bold text-white mb-4">
          Journey Complete
        </h1>
        <p className="text-white/70 text-lg mb-8">
          {character.name} has ascended to legendary status
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Final Level", value: finalStats.level },
            { label: "Total XP", value: finalStats.xp.toLocaleString() },
            { label: "Faith", value: finalStats.faith_score },
            { label: "Wisdom", value: finalStats.wisdom_score },
            { label: "Obedience", value: finalStats.obedience_score },
            { label: "Integrity", value: finalStats.integrity_score },
            { label: "Moral Score", value: finalStats.total_score },
            { label: "Missions", value: finalStats.completed_missions?.length || 0 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 border border-accent rounded-lg p-3"
            >
              <p className="text-white/60 text-xs mb-1">{stat.label}</p>
              <p className="font-display text-xl font-bold text-accent">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="text-white/60 text-sm mb-8 max-w-xl mx-auto">
          You have tested your faith, conquered every realm, and proven your worth.
          The conditions of man have been revealed through your journey.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="px-8 py-4 rounded-lg bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-display font-bold text-lg transition-all"
        >
          Start New Journey
        </motion.button>
      </motion.div>
    </motion.div>
  );
}