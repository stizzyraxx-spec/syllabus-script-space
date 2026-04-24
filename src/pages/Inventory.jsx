import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Backpack, Zap, Check, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Inventory() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Get current user
  React.useEffect(() => {
    const getUser = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  // Fetch inventory items
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventory", user?.email],
    queryFn: () => 
      user?.email 
        ? base44.entities.PlayerInventory.filter({ player_email: user.email })
        : Promise.resolve([]),
    enabled: !!user?.email,
  });

  // Fetch item details
  const { data: allItems = [] } = useQuery({
    queryKey: ["items"],
    queryFn: () => base44.entities.Item.list(),
  });

  // Map inventory with item details
  const inventoryWithDetails = inventoryItems.map(inv => {
    const itemDetails = allItems.find(i => i.id === inv.item_id);
    return { ...inv, ...itemDetails };
  });

  // Toggle equip/unequip
  const equipToggle = useMutation({
    mutationFn: async (inventoryId) => {
      const inv = inventoryItems.find(i => i.id === inventoryId);
      return base44.entities.PlayerInventory.update(inventoryId, {
        equipped: !inv.equipped
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", user?.email] });
    },
  });

  // Delete item
  const deleteItem = useMutation({
    mutationFn: (inventoryId) => 
      base44.entities.PlayerInventory.delete(inventoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", user?.email] });
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to view your inventory.</p>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="px-6 py-2 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90"
        >
          Sign In
        </button>
      </div>
    );
  }

  const equippedItems = inventoryWithDetails.filter(i => i.equipped);
  const unequippedItems = inventoryWithDetails.filter(i => !i.equipped);

  const statBonuses = equippedItems.reduce((acc, item) => {
    if (item.faith_boost) acc.faith = (acc.faith || 0) + item.faith_boost;
    if (item.wisdom_boost) acc.wisdom = (acc.wisdom || 0) + item.wisdom_boost;
    if (item.obedience_boost) acc.obedience = (acc.obedience || 0) + item.obedience_boost;
    if (item.integrity_boost) acc.integrity = (acc.integrity || 0) + item.integrity_boost;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Backpack className="w-8 h-8 text-accent" />
          <h1 className="font-display text-4xl font-bold text-foreground">Inventory</h1>
        </div>
        <p className="text-muted-foreground">Manage your items and equip gear to boost your stats.</p>
      </motion.div>

      {/* Stat Bonuses */}
      {Object.keys(statBonuses).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {Object.entries(statBonuses).map(([stat, value]) => (
            <div key={stat} className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                {stat} Bonus
              </p>
              <p className="text-2xl font-bold text-accent">+{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Equipped Items */}
      {equippedItems.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Check className="w-6 h-6 text-accent" />
            Equipped ({equippedItems.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equippedItems.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                equipped={true}
                onToggle={() => equipToggle.mutate(item.id)}
                onDelete={() => deleteItem.mutate(item.id)}
                loading={equipToggle.isPending || deleteItem.isPending}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unequipped Items */}
      {unequippedItems.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Backpack className="w-6 h-6 text-muted-foreground" />
            Available ({unequippedItems.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unequippedItems.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                equipped={false}
                onToggle={() => equipToggle.mutate(item.id)}
                onDelete={() => deleteItem.mutate(item.id)}
                loading={equipToggle.isPending || deleteItem.isPending}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {inventoryWithDetails.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Backpack className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Your inventory is empty.</p>
          <p className="text-muted-foreground text-sm">Complete missions to collect items!</p>
        </motion.div>
      )}
    </div>
  );
}

function ItemCard({ item, equipped, onToggle, onDelete, loading, index }) {
  const rarityColors = {
    common: "border-gray-400 bg-gray-500/10",
    uncommon: "border-green-400 bg-green-500/10",
    rare: "border-blue-400 bg-blue-500/10",
    epic: "border-purple-400 bg-purple-500/10",
    legendary: "border-yellow-400 bg-yellow-500/10",
  };

  const rarityText = {
    common: "text-gray-400",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-yellow-400",
  };

  const statKeys = ["faith_boost", "wisdom_boost", "obedience_boost", "integrity_boost"];
  const boosts = statKeys.filter(k => item[k] > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-lg border-2 p-4 transition-all ${
        rarityColors[item.rarity] || rarityColors.common
      } ${equipped ? "ring-2 ring-accent" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-display font-bold text-foreground text-lg">{item.name}</p>
          <p className={`text-xs font-semibold uppercase tracking-wider ${rarityText[item.rarity] || rarityText.common}`}>
            {item.rarity}
          </p>
        </div>
        <span className="text-2xl">{item.icon}</span>
      </div>

      <p className="text-muted-foreground text-sm mb-3">{item.description}</p>

      {/* Stat boosts */}
      {boosts.length > 0 && (
        <div className="space-y-1 mb-4 text-xs">
          {boosts.map(key => (
            <div key={key} className="flex items-center gap-1 text-accent">
              <Zap className="w-3 h-3" />
              +{item[key]} {key.replace("_boost", "").toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-white/10">
        <button
          onClick={onToggle}
          disabled={loading}
          className={`flex-1 py-2 rounded text-xs font-semibold transition-colors ${
            equipped
              ? "bg-accent/20 text-accent hover:bg-accent/30"
              : "bg-white/10 text-foreground hover:bg-white/20"
          } disabled:opacity-50`}
        >
          {equipped ? "Unequip" : "Equip"}
        </button>
        <button
          onClick={onDelete}
          disabled={loading}
          className="px-2 py-2 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}