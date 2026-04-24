import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, TrendingUp, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const MISSION_DETAILS = {
  david_bathsheba: { title: "David and Bathsheba", location: "Jerusalem" },
  peter_denial: { title: "Peter's Denial", location: "Jerusalem" },
  joseph_temptation: { title: "Joseph and Potiphar's Wife", location: "Egypt" },
};

export default function QuestJournal({ playerEmail, character, progress, onBack }) {
  const [expandedMission, setExpandedMission] = useState(null);

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ["mission-decisions", playerEmail],
    queryFn: () => base44.entities.RPGMissionDecision.filter({ player_email: playerEmail }),
    enabled: !!playerEmail,
  });

  // Group decisions by mission
  const decisionsbyMission = decisions.reduce((acc, decision) => {
    if (!acc[decision.mission_id]) acc[decision.mission_id] = [];
    acc[decision.mission_id].push(decision);
    return acc;
  }, {});

  // Calculate cumulative stats from completed missions
  const calculateCumulativeStats = () => {
    let totals = { xp: 0, faith: 0, wisdom: 0, obedience: 0, integrity: 0 };
    decisions.forEach((decision) => {
      totals.xp += decision.xp_earned || 0;
      totals.faith += decision.faith_change || 0;
      totals.wisdom += decision.wisdom_change || 0;
      totals.obedience += decision.obedience_change || 0;
      totals.integrity += decision.integrity_change || 0;
    });
    return totals;
  };

  const cumulativeStats = calculateCumulativeStats();
  const completedMissions = progress.completed_missions || [];

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
            <h1 className="font-display text-4xl font-bold text-white">Quest Journal</h1>
          </div>
          <p className="text-white/60 text-lg">Your journey of faith and growth</p>
        </motion.div>

        {/* Character Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/60 text-sm mb-1">Character</p>
              <h2 className="font-display text-2xl font-bold text-white">
                {character.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm mb-1">Level</p>
              <p className="font-display text-3xl font-bold text-accent">{progress.level}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 pt-6 border-t border-white/10">
            {[
              { label: "Faith", value: progress.faith_score || 0 },
              { label: "Wisdom", value: progress.wisdom_score || 0 },
              { label: "Obedience", value: progress.obedience_score || 0 },
              { label: "Integrity", value: progress.integrity_score || 0 },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-white/50 text-xs mb-2">{stat.label}</p>
                <p className="font-display font-bold text-white text-lg">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Growth Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-display text-lg font-bold text-white">Character Growth</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-xs mb-1">Missions Completed</p>
              <p className="font-display text-3xl font-bold text-accent">{completedMissions.length}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Total XP Earned</p>
              <p className="font-display text-3xl font-bold text-accent">{cumulativeStats.xp}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: "Faith", value: cumulativeStats.faith },
              { label: "Wisdom", value: cumulativeStats.wisdom },
              { label: "Obedience", value: cumulativeStats.obedience },
              { label: "Integrity", value: cumulativeStats.integrity },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-white/50 mb-1">{stat.label}</p>
                <p className={`font-bold ${stat.value >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {stat.value >= 0 ? "+" : ""}{stat.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Missions List */}
        <div className="space-y-3 mb-12">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5" />
            Completed Quests
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : completedMissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-8 text-center"
            >
              <p className="text-white/60">No quests completed yet. Begin your journey!</p>
            </motion.div>
          ) : (
            completedMissions.map((missionId, idx) => (
              <motion.div
                key={missionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() =>
                    setExpandedMission(
                      expandedMission === missionId ? null : missionId
                    )
                  }
                  className="w-full text-left bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-display font-bold text-white">
                        {MISSION_DETAILS[missionId]?.title || missionId}
                      </h4>
                      <p className="text-white/60 text-xs">
                        {MISSION_DETAILS[missionId]?.location}
                      </p>
                    </div>
                    <p className="text-accent font-semibold text-sm">
                      {decisionsbyMission[missionId]?.length || 0} decisions
                    </p>
                  </div>
                </button>

                {/* Expanded Mission Details */}
                <AnimatePresence>
                  {expandedMission === missionId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-2"
                    >
                      {decisionsbyMission[missionId]?.map((decision, dIdx) => (
                        <motion.div
                          key={dIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: dIdx * 0.05 }}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                              decision.moral_alignment === "righteous"
                                ? "bg-green-500"
                                : decision.moral_alignment === "neutral"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`} />
                            <div className="flex-1">
                              <p className="text-white mb-1">{decision.choice_text}</p>
                              <p className="text-white/50 text-xs">
                                {decision.moral_alignment.toUpperCase()} • +{decision.xp_earned || 0} XP
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}