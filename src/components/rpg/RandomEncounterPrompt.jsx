import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";

export default function RandomEncounterPrompt({ encounter, onAccept, onDismiss, playerProgress }) {
  const [showFleeConfirm, setShowFleeConfirm] = useState(false);
  const fleeCost = Math.ceil((playerProgress?.level || 1) * 5); // Cost scales with level
  const canAffordFlee = (playerProgress?.xp || 0) >= fleeCost;
  return (
    <AnimatePresence>
      {encounter && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="bg-gradient-to-br from-red-900/80 via-black to-red-900/80 border-2 border-red-600 rounded-xl p-8 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-red-400 text-sm font-semibold mb-1">⚠️ RANDOM ENCOUNTER</p>
                <h2 className="font-display text-2xl font-bold text-white">{encounter.name}</h2>
              </div>
              <button
                onClick={onDismiss}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black/60 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-white/60 text-xs mb-1">Enemy HP</p>
                  <p className="text-red-400 font-display font-bold">{encounter.hp}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Damage</p>
                  <p className="text-orange-400 font-display font-bold">{encounter.damage}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Difficulty</p>
                  <p className="text-yellow-400 font-display font-bold">
                    {(encounter.scaledDifficulty * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            <p className="text-white/70 text-sm mb-6">
              A wild {encounter.name} appears! Test your faith in combat or flee to safety.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFleeConfirm(true)}
                disabled={!canAffordFlee}
                className={`flex-1 px-4 py-2 rounded-lg border font-body font-semibold transition-colors ${
                  canAffordFlee
                    ? "border-white/20 hover:border-white/40 text-white/70 hover:text-white"
                    : "border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                Flee ({fleeCost} XP)
              </button>
              <button
                onClick={onAccept}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-body font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4" />
                Fight
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Flee Confirmation Modal */}
      <AnimatePresence>
        {showFleeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFleeConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gradient-to-br from-yellow-900/80 via-black to-yellow-900/80 border-2 border-yellow-600 rounded-xl p-6 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-xl font-bold text-white mb-3">Flee from Combat?</h3>
              <p className="text-white/70 text-sm mb-4">
                Fleeing will cost you <span className="font-bold text-yellow-400">{fleeCost} XP</span>. Your current XP: <span className="font-bold text-accent">{playerProgress?.xp || 0}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFleeConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-colors font-body text-sm font-semibold"
                >
                  Stay
                </button>
                <button
                  onClick={() => {
                    setShowFleeConfirm(false);
                    onDismiss(fleeCost);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white transition-colors font-body text-sm font-semibold"
                >
                  Flee
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}