import React, { useState } from "react";
import { X, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

export default function NotificationPreferencesModal({ preferences = {}, onSave, onClose }) {
  const [prefs, setPrefs] = useState(preferences);

  const handleToggle = (key) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Notification Preferences
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {[
            { key: "replies", label: "Replies to my posts" },
            { key: "likes", label: "Likes on my content" },
            { key: "follows", label: "New followers" },
            { key: "new_subscriber_content", label: "New content from creators I subscribe to" },
            { key: "mentions", label: "Mentions (@)" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <span className="font-body text-sm text-foreground">{label}</span>
              <Switch
                checked={prefs[key] ?? true}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => { onSave(prefs); onClose(); }}
          className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          Save Preferences
        </button>
      </motion.div>
    </motion.div>
  );
}