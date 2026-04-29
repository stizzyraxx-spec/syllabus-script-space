import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Shield } from "lucide-react";

const RARITY_COLORS = {
  common: "border-gray-400 bg-gray-400/10",
  uncommon: "border-green-400 bg-green-400/10",
  rare: "border-blue-400 bg-blue-400/10",
  epic: "border-purple-400 bg-purple-400/10",
  legendary: "border-yellow-400 bg-yellow-400/10",
};

const RARITY_TEXT = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};

export default function InventoryView({ playerEmail, character, progress, onBack }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch player inventory
  const { data: inventoryItems } = useQuery({
    queryKey: ["inventory", playerEmail],
    queryFn: () =>
      db.entities.PlayerInventory.filter({
        player_email: playerEmail,
      }),
  });

  // Fetch all items
  const { data: allItems } = useQuery({
    queryKey: ["items"],
    queryFn: () => db.entities.Item.list(),
  });

  // Toggle equip mutation
  const toggleEquipMutation = useMutation({
    mutationFn: async (inventoryId) => {
      const inventory = inventoryItems.find((inv) => inv.id === inventoryId);
      await db.entities.PlayerInventory.update(inventoryId, {
        equipped: !inventory.equipped,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", playerEmail] });
    },
  });

  if (!inventoryItems || !allItems) {
    return null;
  }

  // Map inventory to detailed items
  const inventory = inventoryItems.map((inv) => {
    const item = allItems.find((i) => i.id === inv.item_id);
    return { ...inv, itemData: item };
  });

  // Calculate total equipped stat boosts
  const equippedBoosts = inventory
    .filter((inv) => inv.equipped && inv.itemData)
    .reduce(
      (acc, inv) => {
        acc.faith += inv.itemData.faith_boost || 0;
        acc.wisdom += inv.itemData.wisdom_boost || 0;
        acc.obedience += inv.itemData.obedience_boost || 0;
        acc.integrity += inv.itemData.integrity_boost || 0;
        return acc;
      },
      { faith: 0, wisdom: 0, obedience: 0, integrity: 0 }
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div className="max-w-2xl w-full py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              Inventory
            </h2>
            <p className="text-white/60 text-sm">
              {inventory.length} items • {inventory.filter((i) => i.equipped).length} equipped
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Stat Boosts Summary */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-4 gap-3 mb-8 p-4 rounded-lg border border-accent/30 bg-accent/10"
        >
          {[
            { label: "Faith", value: equippedBoosts.faith, color: "from-red-500" },
            { label: "Wisdom", value: equippedBoosts.wisdom, color: "from-blue-500" },
            { label: "Obedience", value: equippedBoosts.obedience, color: "from-green-500" },
            { label: "Integrity", value: equippedBoosts.integrity, color: "from-yellow-500" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-white/60 text-xs mb-1">{stat.label}</p>
              <p className={`font-display text-xl font-bold ${stat.value > 0 ? "text-accent" : "text-white/50"}`}>
                {stat.value > 0 ? "+" : ""}{stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Inventory Grid */}
        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 font-body">Your inventory is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {inventory.map((inv, idx) => {
                const item = inv.itemData;
                if (!item) return null;

                return (
                  <motion.button
                    key={inv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => toggleEquipMutation.mutate(inv.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      inv.equipped
                        ? `${RARITY_COLORS[item.rarity]} ring-2 ring-accent`
                        : `${RARITY_COLORS[item.rarity]} hover:ring-2 hover:ring-accent/50`
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <h3 className="font-display font-bold text-white">
                            {item.name}
                          </h3>
                          <p className={`text-xs font-semibold ${RARITY_TEXT[item.rarity]}`}>
                            {item.rarity.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {inv.equipped && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-accent text-accent-foreground">
                          EQUIPPED
                        </span>
                      )}
                    </div>

                    <p className="text-white/70 text-xs mb-3">{item.description}</p>

                    {/* Item Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: "faith_boost", label: "Faith" },
                        { key: "wisdom_boost", label: "Wisdom" },
                        { key: "obedience_boost", label: "Obedience" },
                        { key: "integrity_boost", label: "Integrity" },
                      ].map((stat) => {
                        const value = item[stat.key] || 0;
                        return value > 0 ? (
                          <div key={stat.key} className="flex items-center gap-1 text-accent">
                            <Zap className="w-3 h-3" />
                            <span>
                              +{value} {stat.label}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    <button
                      className="mt-3 w-full py-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-white font-body text-xs font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {inv.equipped ? "Unequip" : "Equip"}
                    </button>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}