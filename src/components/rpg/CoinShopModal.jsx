import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ShoppingCart, Sparkles } from "lucide-react";
import { db } from "@/api/supabaseClient";

const COIN_PACKAGES = [
  { id: "100", coins: 100, price: 0.99, bonus: 0, label: "Starter" },
  { id: "600", coins: 600, price: 4.95, bonus: 10, label: "Bonus 10%" },
  { id: "1300", coins: 1300, price: 9.90, bonus: 20, label: "Bonus 20%" },
  { id: "3000", coins: 3000, price: 19.80, bonus: 30, label: "Bonus 30%" },
  { id: "6500", coins: 6500, price: 39.60, bonus: 40, label: "Bonus 40%" },
  { id: "13000", coins: 13000, price: 79.20, bonus: 50, label: "Bonus 50%" },
  { id: "20000", coins: 20000, price: 118.80, bonus: 60, label: "Bonus 60%" },
];

export default function CoinShopModal({ playerEmail, onClose, onCoinsAdded }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const handlePurchase = async (pkg) => {
    if (typeof window !== "undefined" && window.self !== window.top) {
      alert("Checkout works only from the published app, not from preview mode.");
      return;
    }

    setLoading(pkg.id);
    setError(null);

    try {
      const response = await db.functions.invoke("createCoinCheckout", {
        packageId: pkg.id,
        playerEmail,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err) {
      setError(err.message || "Purchase failed");
      setLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-black border border-white/20 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-accent" />
            <h2 className="font-display text-3xl font-bold text-white">Coin Shop</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {COIN_PACKAGES.map((pkg) => (
            <motion.button
              key={pkg.id}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePurchase(pkg)}
              disabled={loading !== null}
              className="relative group text-left"
            >
              {pkg.bonus > 0 && (
                <div className="absolute -top-3 -right-3 z-10">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-accent text-primary px-2 py-1 rounded-full text-xs font-bold"
                  >
                    +{pkg.bonus}%
                  </motion.div>
                </div>
              )}

              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 group-hover:border-accent/50 rounded-xl p-6 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white">{pkg.coins}</h3>
                    <p className="text-white/60 text-xs font-semibold">{pkg.label}</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>

                <div className="mb-4">
                  <p className="text-accent font-bold text-lg">${pkg.price.toFixed(2)}</p>
                  <p className="text-white/40 text-xs">{(pkg.coins / pkg.price).toFixed(0)} coins/USD</p>
                </div>

                <button
                  disabled={loading !== null}
                  className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    loading === pkg.id
                      ? "bg-white/20 text-white/50 cursor-not-allowed"
                      : "bg-accent hover:bg-accent/90 text-primary"
                  }`}
                >
                  {loading === pkg.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </>
                  )}
                </button>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-white/40 text-xs text-center">
          💡 Tip: Buy larger packages to get more coins per dollar!
        </p>
      </motion.div>
    </motion.div>
  );
}