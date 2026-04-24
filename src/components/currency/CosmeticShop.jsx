import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Zap, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const RARITY_COLORS = {
  common: "from-gray-500 to-gray-600",
  uncommon: "from-green-500 to-green-600",
  rare: "from-blue-500 to-blue-600",
  epic: "from-purple-500 to-purple-600",
  legendary: "from-yellow-500 to-orange-600",
};

export default function CosmeticShop({ userEmail }) {
  const [selectedCategory, setSelectedCategory] = useState("avatar_background");
  const queryClient = useQueryClient();

  const { data: cosmetics = [] } = useQuery({
    queryKey: ["cosmetics", selectedCategory],
    queryFn: () =>
      base44.entities.CosmeticItem.filter({ category: selectedCategory, is_available: true }),
  });

  const { data: playerCoins } = useQuery({
    queryKey: ["player-coins", userEmail],
    queryFn: () =>
      userEmail
        ? base44.entities.PlayerCoins.filter({ player_email: userEmail }).then(
            (d) => d[0] || { coins: 0 }
          )
        : Promise.resolve({ coins: 0 }),
    enabled: !!userEmail,
  });

  const { data: ownedCosmetics = [] } = useQuery({
    queryKey: ["owned-cosmetics", userEmail],
    queryFn: () =>
      userEmail
        ? base44.entities.PlayerCosmeticInventory.filter({ player_email: userEmail })
        : Promise.resolve([]),
    enabled: !!userEmail,
  });

  const purchaseMutation = useMutation({
    mutationFn: (cosmeticId) =>
      base44.functions.invoke("purchaseCosmetic", { cosmeticId }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["player-coins", userEmail] });
      queryClient.invalidateQueries({ queryKey: ["owned-cosmetics", userEmail] });
      toast.success(`Got ${res.data.cosmeticName}!`);
    },
    onError: (err) => {
      if (err.response?.data?.error === "Already own this item") {
        toast.info("You already own this item");
      } else {
        toast.error("Failed to purchase");
      }
    },
  });

  const ownedIds = new Set(ownedCosmetics.map((c) => c.cosmetic_id));

  const categories = [
    { value: "avatar_background", label: "Backgrounds" },
    { value: "avatar_frame", label: "Frames" },
    { value: "profile_theme", label: "Themes" },
    { value: "character_skin", label: "Character Skins" },
    { value: "weapon_skin", label: "Weapon Skins" },
    { value: "particle_effect", label: "Effects" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-bold text-foreground">Cosmetic Shop</h3>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-body text-sm font-bold text-accent">
            {playerCoins?.coins || 0} Coins
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg font-body text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? "bg-accent text-accent-foreground"
                : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cosmetic Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {cosmetics.map((cosmetic) => {
            const isOwned = ownedIds.has(cosmetic.id);
            const canAfford = (playerCoins?.coins || 0) >= cosmetic.cost_coins;

            return (
              <motion.div
                key={cosmetic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl border overflow-hidden transition-all ${
                  isOwned
                    ? "border-accent/50 bg-accent/10"
                    : "border-border hover:border-accent/50"
                }`}
              >
                {/* Rarity Background */}
                <div
                  className={`bg-gradient-to-br ${RARITY_COLORS[cosmetic.rarity]} h-20 flex items-center justify-center text-4xl`}
                >
                  {cosmetic.icon_emoji}
                </div>

                <div className="p-3">
                  <p className="font-body text-xs font-bold text-foreground line-clamp-1">
                    {cosmetic.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground line-clamp-2 mt-1">
                    {cosmetic.description}
                  </p>

                  {isOwned ? (
                    <div className="mt-3 py-1.5 rounded-lg bg-accent/20 text-center">
                      <p className="font-body text-xs font-bold text-accent">✓ Owned</p>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => purchaseMutation.mutate(cosmetic.id)}
                      disabled={
                        purchaseMutation.isPending || !canAfford
                      }
                      className={`w-full mt-3 py-1.5 rounded-lg font-body text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                        canAfford
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
                      }`}
                    >
                      {!canAfford && <Lock className="w-3 h-3" />}
                      <Zap className="w-3 h-3" />
                      {cosmetic.cost_coins}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {cosmetics.length === 0 && (
        <div className="text-center py-12 bg-secondary/30 rounded-xl">
          <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="font-body text-muted-foreground text-sm">
            No items in this category
          </p>
        </div>
      )}
    </div>
  );
}