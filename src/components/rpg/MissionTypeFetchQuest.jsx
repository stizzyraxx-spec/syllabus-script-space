import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CheckCircle2, Clock } from "lucide-react";

export default function MissionTypeFetchQuest({ mission, onMissionComplete }) {
  const [collectedLocations, setCollectedLocations] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const handleVisitLocation = (idx) => {
    if (!collectedLocations.includes(idx)) {
      setCollectedLocations([...collectedLocations, idx]);
    }
  };

  const isComplete = collectedLocations.length === mission.locations.length;

  const handleComplete = () => {
    if (isComplete) {
      onMissionComplete({
        ...mission.scoreChanges,
        xp: mission.reward_xp,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/80 border border-accent/30 rounded-xl p-6 mb-6"
      >
        <h3 className="font-display text-2xl font-bold text-white mb-2">
          {mission.objective}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed mb-4">
          {mission.narrative}
        </p>
        <div className="flex items-center gap-2 text-accent text-sm">
          <MapPin className="w-4 h-4" />
          Visit all locations to complete the quest
        </div>
      </motion.div>

      {/* Quick narrative only */}

      {/* Complete button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleComplete}
        className="w-full py-3 rounded-xl bg-accent text-primary font-body font-bold hover:bg-accent/90 transition-colors"
      >
        ✓ Complete Quest
      </motion.button>
    </div>
  );
}