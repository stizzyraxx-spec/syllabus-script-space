import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { X, Upload, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AVATAR_EMOJIS = ["👤", "😊", "🧑", "👨", "👩", "🧔", "👴", "👵", "🧒", "👦", "👧", "🤠", "🎓", "🧑‍🎨", "⛪"];

export default function AvatarCustomizer({ user, profile, onClose }) {
  const [selectedEmoji, setSelectedEmoji] = useState(profile?.avatar_emoji || "👤");
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const currentAvatarUrl = profile?.avatar_url;

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      const existing = profiles[0];
      if (existing) {
        await db.entities.UserProfile.update(existing.id, data);
      } else {
        await db.entities.UserProfile.create({ user_email: user.email, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user.email] });
      toast.success("Avatar saved!");
      onClose();
    },
    onError: (err) => {
      console.error("Error updating profile:", err);
      toast.error("Failed to save avatar");
    },
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const res = await db.integrations.Core.UploadFile({ file });
      setUploadedUrl(res.url);
      setSelectedEmoji(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveUpload = () => {
    setUploadedUrl(null);
    setPreviewUrl(null);
    setSelectedEmoji(profile?.avatar_emoji || "👤");
  };

  const handleDeleteCurrentPhoto = () => {
    updateProfileMutation.mutate({ avatar_url: null, avatar_emoji: "👤" });
  };

  const handleSave = () => {
    if (uploadedUrl) {
      updateProfileMutation.mutate({ avatar_url: uploadedUrl, avatar_emoji: null });
    } else if (selectedEmoji) {
      updateProfileMutation.mutate({ avatar_url: null, avatar_emoji: selectedEmoji });
    } else {
      toast.error("Please select an emoji or upload a photo");
    }
  };

  const displaySrc = previewUrl || (uploadedUrl ? uploadedUrl : null);
  const displayEmoji = !displaySrc ? (selectedEmoji || profile?.avatar_emoji || "👤") : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-bold text-foreground">Profile Photo</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-5xl border-4 border-accent/20 overflow-hidden">
            {displaySrc ? (
              <img src={displaySrc} alt="preview" className="w-full h-full object-cover" />
            ) : (
              displayEmoji
            )}
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading…
            </div>
          )}
        </div>

        {/* Current photo actions */}
        {currentAvatarUrl && !previewUrl && (
          <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={currentAvatarUrl} alt="current" className="w-10 h-10 rounded-full object-cover border border-border" />
              <span className="font-body text-sm text-foreground">Current photo</span>
            </div>
            <button
              onClick={handleDeleteCurrentPhoto}
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}

        {/* Upload */}
        <div className="mb-4">
          <p className="font-body text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Upload Photo</p>
          {uploadedUrl ? (
            <div className="flex items-center justify-between bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-2.5 rounded-xl">
              <p className="font-body text-xs font-semibold">✓ Photo ready to save</p>
              <button onClick={handleRemoveUpload} className="hover:opacity-70 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 cursor-pointer transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">Tap to choose a photo</span>
              </div>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Emoji Selector */}
        {!uploadedUrl && (
          <div className="mb-5">
            <p className="font-body text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Or choose an emoji</p>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-2 rounded-lg text-2xl transition-all ${
                    selectedEmoji === emoji
                      ? "bg-accent text-accent-foreground scale-110 shadow-md"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={updateProfileMutation.isPending || uploading || (!uploadedUrl && !selectedEmoji)}
          className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
        </button>
      </motion.div>
    </motion.div>
  );
}
