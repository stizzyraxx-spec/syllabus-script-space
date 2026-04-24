import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, Lock, Check } from "lucide-react";
import { toast } from "sonner";

const RARITY_COLORS = {
  common: "text-slate-400 border-slate-400",
  uncommon: "text-green-500 border-green-500",
  rare: "text-blue-500 border-blue-500",
  epic: "text-purple-500 border-purple-500",
  legendary: "text-yellow-500 border-yellow-500",
};

const RARITY_BG = {
  common: "bg-slate-400/10",
  uncommon: "bg-green-500/10",
  rare: "bg-blue-500/10",
  epic: "bg-purple-500/10",
  legendary: "bg-yellow-500/10",
};

export default function RPGItemStore({ playerEmail, coins, progress, onPurchaseSuccess }) {
  const [filter, setFilter] = useState("all"); // all, weapon, armor, consumable
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch all items
  const { data: items = [] } = useQuery({
    queryKey: ["rpg-items"],
    queryFn: async () => {
      const res = await base44.entities.RPGItem.list();
      return res || [];
    },
  });

  // Fetch player inventory
  const { data: playerInventory = [] } = useQuery({
    queryKey: ["player-inventory", playerEmail],
    queryFn: async () => {
      if (!playerEmail) return [];
      const res = await base44.entities.PlayerInventory.filter({ player_email: playerEmail });
      return res || [];
    },
  });

  // Purchase mutation
  const { mutate: purchaseItem, isPending } = useMutation({
    mutationFn: async (itemId) => {
      const item = items.find(i => i.id === itemId);
      if (!item) throw new Error("Item not found");
      if (coins < item.cost_coins) throw new Error("Not enough coins");

      // Add to inventory
      const inventory = await base44.entities.PlayerInventory.create({
        player_email: playerEmail,
        item_id: itemId,
        equipped: false,
        quantity: 1,
      });

      // Deduct coins
      const coinRecord = await base44.entities.PlayerCoins.filter({ player_email: playerEmail });
      if (coinRecord && coinRecord.length > 0) {
        await base44.entities.PlayerCoins.update(coinRecord[0].id, {
          coins: coins - item.cost_coins,
          total_spent: (coinRecord[0].total_spent || 0) + item.cost_coins,
        });
      }

      return { inventory, item };
    },
    onSuccess: (data) => {
      toast.success(`✨ Purchased ${data.item.name}!`);
      setSelectedItem(null);
      onPurchaseSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const owned = playerInventory.map(inv => inv.item_id);
  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "weapon", "armor", "consumable"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f
                ? "bg-accent text-primary"
                : "bg-white/10 hover:bg-white/20 text-white/70"
            }`}
          >
            {f === "all" ? "All Items" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(item => {
          const owned_count = playerInventory.filter(inv => inv.item_id === item.id).length;
          const isOwned = owned_count > 0;
          const canAfford = coins >= item.cost_coins;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              onClick={() => !isPending && setSelectedItem(item.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isOwned ? "bg-green-500/5 border-green-500/30" : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-white text-sm leading-tight">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${RARITY_COLORS[item.rarity]}`}>
                        {item.rarity}
                      </span>
                      {isOwned && <span className="text-xs text-green-400 flex items-center gap-0.5"><Check className="w-3 h-3" /> Owned</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-accent font-bold">{item.cost_coins}</p>
                  <p className="text-white/40 text-xs">coins</p>
                </div>
              </div>

              {/* Stats preview */}
              {(item.faith_boost || item.wisdom_boost || item.obedience_boost || item.integrity_boost) && (
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  {item.faith_boost > 0 && <p className="text-blue-400">+{item.faith_boost} Faith</p>}
                  {item.wisdom_boost > 0 && <p className="text-purple-400">+{item.wisdom_boost} Wisdom</p>}
                  {item.obedience_boost > 0 && <p className="text-green-400">+{item.obedience_boost} Obedience</p>}
                  {item.integrity_boost > 0 && <p className="text-yellow-400">+{item.integrity_boost} Integrity</p>}
                </div>
              )}

              {/* Consumable effect */}
              {item.consumable_effect && (
                <p className="text-xs text-white/50 mt-1 italic">{item.consumable_effect.replace(/_/g, " ")}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 pointer-events-auto p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-sm w-full"
            >
              {(() => {
                const item = items.find(i => i.id === selectedItem);
                if (!item) return null;
                const owned_count = playerInventory.filter(inv => inv.item_id === item.id).length;
                const isOwned = owned_count > 0;
                const canAfford = coins >= item.cost_coins;

                return (
                  <>
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-5xl">{item.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-white">{item.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border inline-block mt-1 ${RARITY_COLORS[item.rarity]}`}>
                          {item.rarity}
                        </span>
                      </div>
                    </div>

                    <p className="text-white/70 text-sm mb-4">{item.description}</p>

                    {/* Stats */}
                    <div className="mb-4 space-y-1 text-sm">
                      {item.faith_boost > 0 && <p className="text-blue-400">+{item.faith_boost} Faith</p>}
                      {item.wisdom_boost > 0 && <p className="text-purple-400">+{item.wisdom_boost} Wisdom</p>}
                      {item.obedience_boost > 0 && <p className="text-green-400">+{item.obedience_boost} Obedience</p>}
                      {item.integrity_boost > 0 && <p className="text-yellow-400">+{item.integrity_boost} Integrity</p>}
                      {item.consumable_effect && <p className="text-white/50 italic">{item.consumable_effect}</p>}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white transition-colors"
                      >
                        Close
                      </button>
                      {!isOwned && (
                        <button
                          onClick={() => purchaseItem(item.id)}
                          disabled={!canAfford || isPending}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                            canAfford
                              ? "bg-accent text-primary hover:bg-accent/90"
                              : "bg-white/5 text-white/40 cursor-not-allowed"
                          }`}
                        >
                          {!canAfford ? (
                            <>
                              <Lock className="w-4 h-4" />
                              {coins < item.cost_coins ? "Not Enough" : "Buy"}
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Buy ({item.cost_coins})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}