import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, ShoppingCart } from "lucide-react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import CoinShopModal from "./CoinShopModal";

export default function CoinBalance({ playerEmail, onCoinsUpdated }) {
  const [showShop, setShowShop] = useState(false);

  const { data: coinsData, refetch } = useQuery({
    queryKey: ["player-coins", playerEmail],
    queryFn: () => db.functions.invoke("getPlayerCoins", { playerEmail }),
    enabled: !!playerEmail,
    refetchInterval: 30000,
    staleTime: 20000,
  });

  const coins = coinsData?.data?.coins || 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("coins_success")) {
      setTimeout(() => refetch(), 1000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refetch]);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setShowShop(true)}
        className="fixed top-24 right-8 z-30 flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent/80 to-accent hover:from-accent hover:to-accent/90 text-primary font-display font-bold transition-all hover:scale-105"
      >
        <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Zap className="w-5 h-5" />
        </motion.div>
        <span className="text-lg">{coins}</span>
        <ShoppingCart className="w-4 h-4 opacity-70" />
      </motion.button>

      {showShop && (
        <CoinShopModal
          playerEmail={playerEmail}
          onClose={() => setShowShop(false)}
          onCoinsAdded={() => {
            refetch();
            onCoinsUpdated?.();
          }}
        />
      )}
    </>
  );
}