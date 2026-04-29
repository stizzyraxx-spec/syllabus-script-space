import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/api/supabaseClient";
// canvas-confetti removed for performance

const tiers = [];

const impacts = [
  { emoji: "📚", title: "Educational Content", desc: "Create resources showing Biblical morality", link: "/forums", linkText: "Explore Topics" },
  { emoji: "🌍", title: "Reach More People", desc: "Expand our message globally", link: "/community", linkText: "Join Community" },
  { emoji: "⚖️", title: "Promote Justice", desc: "Advocate for Biblical principles in society", link: "/forums", linkText: "Current Events" },
];

export default function DonationSection() {
  const [loadingAmount, setLoadingAmount] = useState(null);

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

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-destructive" />
            <span className="font-body text-sm font-semibold text-destructive tracking-[0.1em] uppercase">
              Support Our Mission
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Help Spread <span className="text-accent">Biblical Morality</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            In a world confused about right and wrong, we're committed to showing
            how the Bible's moral system offers the clearest path to justice,
            compassion, and human flourishing. Your donation helps us reach more
            people.
          </p>
        </motion.div>



        {/* Impact cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {impacts.map(({ emoji, title, desc, link, linkText }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-4 p-5 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <h4 className="font-body font-semibold text-sm text-foreground mb-1">{title}</h4>
                  <p className="font-body text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Link
                to={link}
                className="text-accent hover:text-accent/80 font-body text-xs font-semibold transition-colors self-start"
              >
                {linkText} →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}