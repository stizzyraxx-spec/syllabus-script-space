import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Unlock, Zap } from "lucide-react";

const SKILL_TREE = {
  faith_path: {
    title: "Faith Path",
    color: "from-red-500 to-red-600",
    nodes: [
      { id: "faith_1", name: "Divine Insight", cost: 50, type: "ability", description: "+20% to Faith attacks" },
      { id: "faith_2", name: "Blessing", cost: 100, type: "ability", description: "Heal 20 HP, +10 Faith boost", prereq: "faith_1" },
      { id: "faith_3", name: "Holy Aura", cost: 150, type: "passive", description: "+15 Faith permanently", prereq: "faith_2" },
      { id: "faith_4", name: "Divine Judgment", cost: 200, type: "ability", description: "Deal massive damage to evil", prereq: "faith_3" },
    ],
  },
  wisdom_path: {
    title: "Wisdom Path",
    color: "from-blue-500 to-blue-600",
    nodes: [
      { id: "wisdom_1", name: "Insight", cost: 50, type: "ability", description: "See enemy weaknesses" },
      { id: "wisdom_2", name: "Strategic Mind", cost: 100, type: "passive", description: "+15 Wisdom permanently", prereq: "wisdom_1" },
      { id: "wisdom_3", name: "Foresight", cost: 150, type: "ability", description: "Predict enemy moves", prereq: "wisdom_2" },
      { id: "wisdom_4", name: "Omniscience", cost: 200, type: "passive", description: "+30 Wisdom permanently", prereq: "wisdom_3" },
    ],
  },
  obedience_path: {
    title: "Obedience Path",
    color: "from-green-500 to-green-600",
    nodes: [
      { id: "obedience_1", name: "Discipline", cost: 50, type: "ability", description: "Steadfast defense" },
      { id: "obedience_2", name: "Unwavering Will", cost: 100, type: "passive", description: "+15 Obedience permanently", prereq: "obedience_1" },
      { id: "obedience_3", name: "Fortress", cost: 150, type: "ability", description: "Block all damage for 1 turn", prereq: "obedience_2" },
      { id: "obedience_4", name: "Iron Resolve", cost: 200, type: "passive", description: "+30 Obedience permanently", prereq: "obedience_3" },
    ],
  },
  integrity_path: {
    title: "Integrity Path",
    color: "from-yellow-500 to-yellow-600",
    nodes: [
      { id: "integrity_1", name: "Truthseeker", cost: 50, type: "ability", description: "Cleanse deceptions" },
      { id: "integrity_2", name: "Honor Code", cost: 100, type: "passive", description: "+15 Integrity permanently", prereq: "integrity_1" },
      { id: "integrity_3", name: "Righteous Path", cost: 150, type: "ability", description: "Double damage against corruption", prereq: "integrity_2" },
      { id: "integrity_4", name: "Perfect Truth", cost: 200, type: "passive", description: "+30 Integrity permanently", prereq: "integrity_3" },
    ],
  },
};

export default function SkillTreeView({ playerEmail, progress, onBack }) {
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState(null);
  const [activePathTab, setActivePathTab] = useState("faith_path");

  const { data: unlockedNodes } = useQuery({
    queryKey: ["skill-tree", playerEmail],
    queryFn: () =>
      db.entities.PlayerSkillTree.filter({
        player_email: playerEmail,
      }),
  });

  const unlockMutation = useMutation({
    mutationFn: async (node) => {
      if (progress.xp < node.cost) throw new Error("Insufficient XP");

      const existingNode = unlockedNodes?.find((n) => n.node_id === node.id);
      if (existingNode) throw new Error("Already unlocked");

      // Check prerequisites
      if (node.prereq) {
        const prereqUnlocked = unlockedNodes?.find((n) => n.node_id === node.prereq && n.unlocked);
        if (!prereqUnlocked) throw new Error("Prerequisite not met");
      }

      await db.entities.PlayerSkillTree.create({
        player_email: playerEmail,
        node_id: node.id,
        node_name: node.name,
        unlocked: true,
      });

      // Deduct XP
      await db.entities.RPGPlayerProgress.update(progress.id, {
        xp: progress.xp - node.cost,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-tree", playerEmail] });
      queryClient.invalidateQueries({ queryKey: ["player-progress", playerEmail] });
      setSelectedNode(null);
    },
  });

  const isNodeUnlocked = (nodeId) => unlockedNodes?.some((n) => n.node_id === nodeId && n.unlocked);
  const canUnlockNode = (node) => {
    if (isNodeUnlocked(node.id)) return false;
    if (progress.xp < node.cost) return false;
    if (node.prereq && !isNodeUnlocked(node.prereq)) return false;
    return true;
  };

  const currentPath = SKILL_TREE[activePathTab];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div className="max-w-4xl w-full py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Skill Tree</h2>
            <p className="text-white/60 text-sm">Available XP: {progress.xp}</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Path Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {Object.entries(SKILL_TREE).map(([key, path]) => (
            <button
              key={key}
              onClick={() => setActivePathTab(key)}
              className={`px-4 py-2 rounded-lg font-body text-sm font-semibold transition-all flex-shrink-0 ${
                activePathTab === key
                  ? `bg-gradient-to-r ${path.color} text-white`
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {path.title}
            </button>
          ))}
        </div>

        {/* Skill Tree Nodes */}
        <motion.div
          key={activePathTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {currentPath.nodes.map((node, idx) => {
            const unlocked = isNodeUnlocked(node.id);
            const canUnlock = canUnlockNode(node);
            const prereqMet = !node.prereq || isNodeUnlocked(node.prereq);

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {node.prereq && !prereqMet && (
                  <div className="text-xs text-white/40 mb-2 ml-4">↳ Requires: {SKILL_TREE[activePathTab].nodes.find(n => n.id === node.prereq)?.name}</div>
                )}
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    unlocked
                      ? "border-accent bg-accent/20"
                      : canUnlock
                      ? "border-white/30 bg-white/5 hover:border-accent hover:bg-white/10"
                      : "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {unlocked ? (
                        <Unlock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      ) : (
                        <Lock className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h3 className="font-display font-bold text-white">{node.name}</h3>
                        <p className="text-white/60 text-xs mt-1">{node.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">
                            {node.type}
                          </span>
                          {unlocked && (
                            <span className="text-xs px-2 py-1 rounded bg-accent/30 text-accent">
                              Unlocked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-accent font-semibold">
                        <Zap className="w-4 h-4" />
                        {node.cost}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Node Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNode(null)}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border-2 border-accent rounded-xl p-6 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-2xl font-bold text-white mb-2">{selectedNode.name}</h3>
              <p className="text-white/60 text-sm mb-4">{selectedNode.description}</p>

              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <p className="text-white/70 text-xs mb-1">Type</p>
                <p className="text-white font-semibold">{selectedNode.type.toUpperCase()}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/70 text-xs mb-1">Cost</p>
                  <p className="text-accent font-display font-bold text-lg flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {selectedNode.cost}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/70 text-xs mb-1">Available</p>
                  <p className="text-white font-display font-bold text-lg">{progress.xp}</p>
                </div>
              </div>

              {isNodeUnlocked(selectedNode.id) ? (
                <button
                  disabled
                  className="w-full py-3 rounded-lg bg-accent/20 text-accent font-body font-semibold cursor-not-allowed"
                >
                  ✓ Unlocked
                </button>
              ) : (
                <button
                  onClick={() => {
                    unlockMutation.mutate(selectedNode);
                  }}
                  disabled={!canUnlockNode(selectedNode) || unlockMutation.isPending}
                  className={`w-full py-3 rounded-lg font-body font-semibold transition-all ${
                    canUnlockNode(selectedNode)
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                  }`}
                >
                  {unlockMutation.isPending ? "Unlocking..." : "Unlock Skill"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}