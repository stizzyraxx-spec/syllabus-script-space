import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function DailyVerseSettings({ profile }) {
  const [enabled, setEnabled] = useState(profile?.daily_verse_enabled || false);
  const [time, setTime] = useState(profile?.daily_verse_time || "09:00");
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      return db.auth.updateMe({
        daily_verse_enabled: enabled,
        daily_verse_time: time,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6 space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-5 h-5 text-accent" />
        <h3 className="font-display font-bold text-foreground">Daily Verse Email</h3>
      </div>

      <div className="space-y-3">
        {/* Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-border cursor-pointer accent-accent"
          />
          <span className="font-body text-sm text-foreground">
            Receive a random encouraging Bible verse each day
          </span>
        </label>

        {/* Time selector */}
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-7 pt-2 space-y-2"
          >
            <label className="block font-body text-sm text-foreground">
              Preferred time (Eastern Time)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="font-body text-xs text-muted-foreground">
              You'll receive your daily verse around this time each morning
            </p>
          </motion.div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 mt-4"
      >
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </button>
    </motion.div>
  );
}