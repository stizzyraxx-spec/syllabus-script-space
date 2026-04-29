import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CompleteProfileModal({ currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    display_name: currentUser?.full_name || "",
    username: "",
    bio: "",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = await db.entities.UserProfile.filter({ user_email: currentUser.email });
      const data = {
        user_email: currentUser.email,
        display_name: form.display_name,
        username: form.username.replace(/^@/, "").toLowerCase(),
        bio: form.bio,
        followers: [],
        following: [],
        post_count: 0,
      };
      if (existing.length > 0) {
        await db.entities.UserProfile.update(existing[0].id, data);
      } else {
        await db.entities.UserProfile.create(data);
      }
      // Backfill existing posts with updated name
      const myPosts = await db.entities.CommunityPost.filter({ author_email: currentUser.email });
      await Promise.all(myPosts.map((p) =>
        db.entities.CommunityPost.update(p.id, { author_name: form.display_name })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", currentUser.email] });
      onClose();
    },
  });

  const handleSave = () => {
    if (!form.display_name.trim()) return;
    saveMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-card rounded-2xl border border-border overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Welcome! 👋</h2>
              <p className="font-body text-xs text-primary-foreground/70">Let's set up your profile</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="font-body text-sm text-muted-foreground">
            Complete your profile so others can find and follow you in the community.
          </p>

          <div className="space-y-1">
            <label className="font-body text-xs font-semibold text-foreground">Display Name *</label>
            <Input
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Your name"
              className="font-body text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="font-body text-xs font-semibold text-foreground">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-muted-foreground">@</span>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.replace(/^@/, "").toLowerCase() })}
                placeholder="yourhandle"
                className="font-body text-sm pl-7"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-body text-xs font-semibold text-foreground">Bio</label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell the community a little about yourself..."
              className="font-body text-sm min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 font-body text-sm text-muted-foreground border border-border hover:border-accent/40 py-2.5 rounded-lg transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || !form.display_name.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground font-body text-sm font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Profile
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}