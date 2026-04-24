import React from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export default function SignInPrompt({ onClose, message = "Sign in to use this feature" }) {
  const signupUrl = `/login?mode=signup&from_url=${encodeURIComponent(window.location.href)}`;
  const signinUrl = `/login?from_url=${encodeURIComponent(window.location.href)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
      >
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-accent" />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground mb-1">It's Free to Join</h3>
        <p className="font-body text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex flex-col gap-3">
          <a
            href={signupUrl}
            className="w-full block bg-accent text-accent-foreground font-body font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors text-sm"
          >
            Create Free Account
          </a>
          <a
            href={signinUrl}
            className="w-full block font-body text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Already have an account? Sign in
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
