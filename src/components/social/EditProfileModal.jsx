import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { uploadFileToS3 } from "@/lib/uploadToS3";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Camera, Save, Palette, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";
import InterestTagsManager from "@/components/profile/InterestTagsManager";
import BioLinksManager from "@/components/profile/BioLinksManager";
import NotificationPreferencesModal from "@/components/profile/NotificationPreferencesModal";
import CreatorModeToggle from "@/components/profile/CreatorModeToggle";
import TestimonySection from "@/components/profile/TestimonySection";
import LanguagePreference from "@/components/profile/LanguagePreference";

const PRESET_COLORS = [
  "#F5A623", // amber gold (default)
  "#EF4444", // red
  "#3B82F6", // blue
  "#10B981", // emerald
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#F97316", // orange
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#FFFFFF", // white
];

export default function EditProfileModal({ profile, currentUser, onClose }) {
  const queryClient = useQueryClient();
  const { accentColor, setAccentColor } = useTheme();
  const [form, setForm] = useState({
    display_name: profile?.display_name || currentUser?.full_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    phone_number: profile?.phone_number || "",
    tiktok: profile?.tiktok || "",
    instagram: profile?.instagram || "",
    twitter: profile?.twitter || "",
    facebook: profile?.facebook || "",
    youtube: profile?.youtube || "",
    website: profile?.website || "",
    avatar_url: profile?.avatar_url || "",
    interest_tags: profile?.interest_tags || [],
    bio_links: profile?.bio_links || [],
    notification_preferences: profile?.notification_preferences || {},
    is_creator: profile?.is_creator || false,
    testimony: profile?.testimony || "",
    language_preference: profile?.language_preference || "KJV",
    accent_color: profile?.accent_color || accentColor,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [showNotifPrefs, setShowNotifPrefs] = useState(false);

  const handleAvatarChange = async (e) => {
   const file = e.target.files?.[0];
   if (!file) return;
   setAvatarFile(file);
   const preview = URL.createObjectURL(file);
   setAvatarPreview(preview);
   setUploading(true);
   try {
     const avatarUrl = await uploadFileToS3(file);
     console.log("Avatar uploaded:", avatarUrl);
     setForm((f) => ({ ...f, avatar_url: avatarUrl }));
   } catch (error) {
     console.error("Failed to upload avatar:", error);
     setAvatarPreview("");
   } finally {
     setUploading(false);
   }
  };

  const handleRemoveAvatar = () => {
   setAvatarPreview("");
   setAvatarFile(null);
   setForm((f) => ({ ...f, avatar_url: "" }));
  };

  const saveMutation = useMutation({
   mutationFn: async () => {
     // Ensure avatar upload is complete before saving
     if (avatarFile && !form.avatar_url) {
       throw new Error("Avatar still uploading. Please wait.");
     }
     console.log("Saving profile with avatar_url:", form.avatar_url);
     const data = { ...form, user_email: currentUser.email };
     if (profile?.id) {
       await base44.entities.UserProfile.update(profile.id, data);
     } else {
       await base44.entities.UserProfile.create(data);
     }
     // Apply the accent color to theme
     if (form.accent_color) {
       setAccentColor(form.accent_color);
     }
     // Backfill existing posts with updated name and avatar
     const myPosts = await base44.entities.CommunityPost.filter({ author_email: currentUser.email });
     if (myPosts.length > 0) {
       await Promise.all(myPosts.map((p) =>
         base44.entities.CommunityPost.update(p.id, { author_name: form.display_name, author_avatar: form.avatar_url })
       ));
     }
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["profile", currentUser.email] });
     queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
     onClose();
   },
   onError: (error) => {
     console.error("Save profile error:", error);
   },
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-display text-lg font-bold text-foreground">Edit Profile</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-bold text-accent text-2xl">
                    {(form.display_name || "A")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors z-10" title="Change photo">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
              </label>
              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 transition-colors disabled:opacity-50 z-10"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {uploading && <p className="font-body text-xs text-muted-foreground">Uploading photo...</p>}
            {form.avatar_url && !uploading && <p className="font-body text-xs text-green-600">✓ Photo saved</p>}
          </div>

          {/* Basic Info */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Basic Info</p>
            <div className="space-y-3">
              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Display Name</label>
                <Input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} className="font-body text-sm" placeholder="Your name" />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body text-sm">@</span>
                  <Input value={form.username} onChange={(e) => set("username", e.target.value.replace(/\s/g, "").toLowerCase())} className="font-body text-sm pl-7" placeholder="username" />
                </div>
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Bio</label>
                <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} className="font-body text-sm min-h-[72px]" placeholder="Tell the community about yourself..." />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Phone Number</label>
                <Input value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} className="font-body text-sm" placeholder="+1 (555) 000-0000" type="tel" />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Website</label>
                <Input value={form.website} onChange={(e) => set("website", e.target.value)} className="font-body text-sm" placeholder="https://yoursite.com" />
              </div>
            </div>
          </div>

          {/* Theme Color */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Platform Color
            </p>
            <p className="font-body text-xs text-muted-foreground mb-3">Customize your accent color across the entire platform.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => { setAccentColor(color); set("accent_color", color); }}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: form.accent_color === color ? color : "transparent",
                    boxShadow: form.accent_color === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : "none",
                  }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="font-body text-xs text-muted-foreground">Custom color:</label>
              <input
                type="color"
                value={form.accent_color}
                onChange={(e) => { set("accent_color", e.target.value); setAccentColor(e.target.value); }}
                className="w-10 h-8 rounded cursor-pointer border border-border bg-transparent"
              />
              <span className="font-body text-xs text-muted-foreground">{form.accent_color}</span>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Social Media</p>
            <div className="space-y-3">
              {[
                { key: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
                { key: "instagram", label: "Instagram", placeholder: "@yourhandle" },
                { key: "twitter", label: "X / Twitter", placeholder: "@yourhandle" },
                { key: "facebook", label: "Facebook", placeholder: "Facebook name or URL" },
                { key: "youtube", label: "YouTube", placeholder: "@channel or URL" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">{label}</label>
                  <Input value={form[key]} onChange={(e) => set(key, e.target.value)} className="font-body text-sm" placeholder={placeholder} />
                </div>
              ))}
            </div>
          </div>

          {/* Interest Tags */}
          <InterestTagsManager tags={form.interest_tags} onChange={(tags) => set("interest_tags", tags)} />

          {/* Bio Links */}
          <BioLinksManager links={form.bio_links} onChange={(links) => set("bio_links", links)} />

          {/* Testimony */}
          <TestimonySection testimony={form.testimony} onChange={(testimony) => set("testimony", testimony)} isEditing={true} />

          {/* Language Preference */}
          <LanguagePreference preference={form.language_preference} onChange={(lang) => set("language_preference", lang)} />

          {/* Creator Mode */}
          <CreatorModeToggle isCreator={form.is_creator} onChange={(val) => set("is_creator", val)} />

          {/* Notification Preferences */}
          <div>
            <button
              onClick={() => setShowNotifPrefs(true)}
              className="w-full px-4 py-2.5 rounded-lg border border-border font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              Notification Preferences →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border sticky bottom-0 bg-card flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border font-body font-semibold text-foreground hover:bg-secondary transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || uploading}
            className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground font-body font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 text-sm"
          >
            {(saveMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </motion.div>

      {showNotifPrefs && (
        <NotificationPreferencesModal
          preferences={form.notification_preferences}
          onSave={(prefs) => set("notification_preferences", prefs)}
          onClose={() => setShowNotifPrefs(false)}
        />
      )}
    </motion.div>
  );
}