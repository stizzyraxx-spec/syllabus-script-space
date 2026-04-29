import React, { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { db } from "@/api/supabaseClient";

const tiers = [];

const impacts = [
  { emoji: "📚", title: "Educational Content", desc: "Create resources showing Biblical morality" },
  { emoji: "🌍", title: "Reach More People", desc: "Expand our message globally" },
  { emoji: "⚖️", title: "Promote Justice", desc: "Advocate for Biblical principles in society" },
];

export default function Donate() {
  const [customAmount, setCustomAmount] = useState("");
  const [loadingAmount, setLoadingAmount] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success");
  const cancelled = urlParams.get("cancelled");

  const handleDonate = async (amount) => {
    if (window.self !== window.top) {
      alert("Checkout only works from the published app. Please open the site directly.");
      return;
    }
    setLoadingAmount(amount);
    const response = await db.functions.invoke("createCheckout", {
      amount,
      description: `$${amount} Donation — The Condition of Man`,
    });
    setLoadingAmount(null);
    if (response.data?.url) {
      window.location.href = response.data.url;
    }
  };

  const handleCustomDonate = () => {
    const amt = parseFloat(customAmount);
    if (!amt || amt < 1) return;
    handleDonate(amt);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-accent" />
            <span className="font-body text-xs font-semibold text-accent tracking-[0.15em] uppercase">
              Support Our Mission
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5">
            Help Spread <span className="text-accent italic">Biblical Morality</span>
          </h1>
          <p className="font-body text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
            In a world confused about right and wrong, we're committed to showing
            how the Bible's moral system offers the clearest path to justice,
            compassion, and human flourishing. Your donation helps us reach more
            people.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Success / Cancel banners */}
        {success && (
          <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 font-body text-sm text-center">
            🙏 Thank you for your generous donation! God bless you.
          </div>
        )}
        {cancelled && (
          <div className="mb-8 p-4 rounded-xl bg-secondary border border-border text-muted-foreground font-body text-sm text-center">
            Donation cancelled. Feel free to give whenever you're ready.
          </div>
        )}



        {/* Custom amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl border border-border bg-card mb-14"
        >
          <h3 className="font-display text-lg font-bold mb-4 text-foreground">
            Or give a custom amount
          </h3>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0"
                className="pl-7 font-body"
                min="1"
              />
            </div>
            <button
              onClick={handleCustomDonate}
              disabled={loadingAmount !== null || !customAmount || parseFloat(customAmount) < 1}
              className="px-6 py-2.5 bg-accent text-accent-foreground rounded-lg font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loadingAmount === parseFloat(customAmount) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Donate"
              )}
            </button>
          </div>
        </motion.div>

        {/* Impact */}
        <div className="grid sm:grid-cols-3 gap-6">
          {impacts.map(({ emoji, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border"
            >
              <span className="text-2xl">{emoji}</span>
              <div>
                <h4 className="font-body font-semibold text-sm text-foreground mb-1.5">{title}</h4>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}