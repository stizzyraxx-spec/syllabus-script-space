import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Sparkles, Flame } from "lucide-react";
import { db } from "@/api/supabaseClient";
import RPGItemStore from "./RPGItemStore";

const COSMETIC_ITEMS = [
  {
    id: "xp_boost_1000",
    name: "+1000 XP Boost",
    description: "Gain 1000 experience points instantly",
    cost: 100,
    icon: Zap,
    effect: { xp: 1000 },
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "level_up",
    name: "Instant Level Up",
    description: "Increase your level by 1",
    cost: 500,
    icon: TrendingUp,
    effect: { level: 1 },
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "stat_boost_50",
    name: "All Stats +50",
    description: "Boost all stats by 50 points",
    cost: 250,
    icon: Sparkles,
    effect: { faith_score: 50, wisdom_score: 50, obedience_score: 50, integrity_score: 50 },
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "combat_shield",
    name: "Combat Shield (5 Uses)",
    description: "Reduce combat damage by 25% for 5 encounters",
    cost: 300,
    icon: Flame,
    effect: { combatShield: 5 },
    color: "from-red-500 to-yellow-500",
  },
];

export default function CoinStoreItems({ playerEmail, coins, progress, onPurchase }) {
  const [tab, setTab] = useState("combat"); // combat, cosmetic
  const [purchasingId, setPurchasingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handlePurchase = async (item) => {
    if (coins < item.cost) {
      setFeedback({ type: "error", message: "Insufficient coins" });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setPurchasingId(item.id);

    try {
      await db.functions.invoke("spendCoins", {
        playerEmail,
        coinsCost: item.cost,
        itemType: item.id,
      });

      setFeedback({ type: "success", message: `Purchased ${item.name}!` });
      onPurchase?.(item);
    } catch (err) {
      setFeedback({ type: "error", message: "Purchase failed" });
    } finally {
      setPurchasingId(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setTab("combat")}
          className={`px-4 py-2 text-xs font-semibold transition-colors ${
            tab === "combat" ? "text-accent border-b-2 border-accent" : "text-white/60 hover:text-white"
          }`}
        >
          Combat Items
        </button>
        <button
          onClick={() => setTab("cosmetic")}
          className={`px-4 py-2 text-xs font-semibold transition-colors ${
            tab === "cosmetic" ? "text-accent border-b-2 border-accent" : "text-white/60 hover:text-white"
          }`}
        >
          Boosts
        </button>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-lg text-sm font-bold ${
            feedback.type === "success"
              ? "bg-green-500/20 text-green-200 border border-green-500/50"
              : "bg-red-500/20 text-red-200 border border-red-500/50"
          }`}
        >
          {feedback.message}
        </motion.div>
      )}

      {/* Combat Items Tab */}
      {tab === "combat" && (
        <RPGItemStore
          playerEmail={playerEmail}
          coins={coins}
          progress={progress}
          onPurchaseSuccess={() => onPurchase?.()}
        />
      )}

      {/* Cosmetic/Boost Tab */}
      {tab === "cosmetic" && (
        <div className="grid grid-cols-1 gap-3">
          {COSMETIC_ITEMS.map((item, idx) => {
            const canAfford = coins >= item.cost;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-r ${item.color} p-4 rounded-lg overflow-hidden group relative`}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="p-2 bg-black/30 rounded-lg">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <p className="text-white/80 text-xs leading-tight">{item.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford || purchasingId === item.id}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 whitespace-nowrap ml-3 transition-all ${
                      canAfford
                        ? "bg-white/20 hover:bg-white/30 text-white hover:scale-110"
                        : "bg-black/30 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    {purchasingId === item.id ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        {item.cost}
                      </>
                    )}
                  </button>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}