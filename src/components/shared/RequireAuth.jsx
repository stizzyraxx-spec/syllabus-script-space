import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";

export default function RequireAuth({ children }) {
  const [status, setStatus] = React.useState("checking"); // checking | authed | guest

  React.useEffect(() => {
    base44.auth.me()
      .then(() => setStatus("authed"))
      .catch(() => setStatus("guest"));
  }, []);

  if (status === "checking") {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "guest") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Join Free
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-8 leading-relaxed">
            Create your free account to access forums, Bible study tools, games, live streams, and more — no cost, ever.
          </p>
          <a
            href={`/login?mode=signup&from_url=${encodeURIComponent(window.location.href)}`}
            className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-body font-semibold py-3 rounded-xl hover:bg-accent/90 transition-colors text-sm mb-3"
          >
            <Sparkles className="w-4 h-4" />
            Create Free Account
          </a>
          <a
            href={`/login?from_url=${encodeURIComponent(window.location.href)}`}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors block mb-4"
          >
            Already have an account? Sign in
          </a>
          <a
            href="/"
            className="font-body text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            ← Back to Home
          </a>
        </motion.div>
      </div>
    );
  }

  return children;
}