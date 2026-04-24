import React, { useState } from "react";

import { base44 } from "@/api/base44Client";
import { uploadFileToS3 } from "@/lib/uploadToS3";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Image, Video, Type, Loader2, Upload, BookOpen, FileText, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import MentionInput, { parseMentions } from "./MentionInput";
import { filterProfanity } from "@/lib/profanityFilter";
import { useAwardPoints } from "@/hooks/useAwardPoints";

export default function CreatePost({ currentUser, onClose }) {
  const queryClient = useQueryClient();
  const { awardPoints } = useAwardPoints();
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("text");
  const [mediaFiles, setMediaFiles] = useState([]); // Array of {file, preview, type}
  const [uploading, setUploading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [verseSearch, setVerseSearch] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles-mention"],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 60000,
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: currentUser.email }),
    select: (data) => data[0],
    enabled: !!currentUser?.email,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      let media_urls = [];
      if (mediaFiles.length > 0) {
        setUploading(true);
        for (const item of mediaFiles) {
          const url = await uploadFileToS3(item.file);
          media_urls.push({
            url,
            type: item.type,
            aspect_ratio: item.aspect_ratio || "auto",
          });
        }
        setUploading(false);
      }
      const authorName = myProfile?.display_name || currentUser.full_name || "Anonymous";
      const authorAvatar = myProfile?.avatar_url || null;
      const versePrefix = selectedVerse ? `📖 ${selectedVerse.reference}\n\n"${selectedVerse.text}"\n\n` : "";
      const post = await base44.entities.CommunityPost.create({
        author_email: currentUser.email,
        author_name: authorName,
        author_avatar: authorAvatar,
        caption: filterProfanity(versePrefix + caption),
        media_urls,
        likes: 0,
        liked_by: [],
        comment_count: 0,
      });
      
      // Check if user reached 10 posts for creator mode unlock
      const userPosts = await base44.entities.CommunityPost.filter({ author_email: currentUser.email });
      if (userPosts.length === 10 && !myProfile?.is_creator) {
        // Unlock creator mode
        if (myProfile?.id) {
          await base44.entities.UserProfile.update(myProfile.id, { is_creator: true });
        }
        // Send notification
        await base44.entities.Notification.create({
          recipient_email: currentUser.email,
          actor_name: "The Condition of Man",
          actor_email: "system",
          type: "follow",
          message: "🎉 Welcome to Creator Mode! You can now go live and build your audience. Visit your profile to enable streaming.",
          link_path: "/community",
          read: false,
        });
      }
      
      // Notify tagged users
      const tagged = parseMentions(caption, profiles);
      for (const email of tagged) {
        if (email !== currentUser.email) {
          await base44.entities.Notification.create({
            recipient_email: email,
            actor_name: currentUser.full_name || "Someone",
            actor_email: currentUser.email,
            type: "reply",
            message: `${currentUser.full_name || "Someone"} mentioned you in a post.`,
            link_path: "/community",
            read: false,
          });
        }
      }
      return post;
    },
    onSuccess: async () => {
      // Award point for posting with verse
      if (selectedVerse) {
        await awardPoints(currentUser.email, "verse_post");
      }
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts", currentUser.email] });
      setSelectedVerse(null);
      setVerseSearch("");
      setMediaFiles([]);
      onClose();
    },
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      let type = "photo";
      let aspect_ratio = "auto";

      if (file.type.startsWith("video")) {
        type = "video";
        const vid = document.createElement("video");
        vid.preload = "metadata";
        vid.onloadedmetadata = () => {
          const ratio = vid.videoWidth / vid.videoHeight;
          aspect_ratio = ratio < 1 ? "9:16" : "16:9";
          URL.revokeObjectURL(vid.src);
        };
        vid.src = objectUrl;
      } else if (file.type === "application/pdf") {
        type = "pdf";
      }

      setMediaFiles((prev) => [
        ...prev,
        { file, preview: objectUrl, type, aspect_ratio },
      ]);
    });
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="w-full max-w-lg bg-card rounded-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display text-lg font-bold text-foreground">New Post</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Media upload buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { type: "photo", icon: Image, label: "Photo", accept: "image/*" },
              { type: "video", icon: Video, label: "Video", accept: "video/*" },
              { type: "pdf", icon: FileText, label: "PDF", accept: ".pdf" },
            ].map(({ type, icon: Icon, label, accept }) => (
              <label
                key={type}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-colors border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <input
                  type="file"
                  multiple
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ))}
          </div>

          {/* Media previews */}
          {mediaFiles.length > 0 && (
            <div className="space-y-3">
              <p className="font-body text-xs font-semibold text-muted-foreground">
                {mediaFiles.length} file{mediaFiles.length > 1 ? "s" : ""} attached
              </p>
              <div className="grid grid-cols-2 gap-2">
                {mediaFiles.map((item, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden group">
                    {item.type === "photo" ? (
                      <img src={item.preview} alt="" className="w-full h-20 object-cover" />
                    ) : item.type === "video" ? (
                      <video
                        src={item.preview}
                        className="w-full h-20 object-cover bg-black"
                      />
                    ) : (
                      <div className="w-full h-20 bg-secondary rounded flex items-center justify-center">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(idx)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verse selector */}
          {selectedVerse && (
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs font-semibold text-accent mb-1">Verse Selected</p>
                  <p className="font-display text-sm italic text-foreground line-clamp-2">"{selectedVerse.text}"</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">— {selectedVerse.reference}</p>
                </div>
                <button
                  onClick={() => setSelectedVerse(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <label className="block font-body text-xs font-semibold text-muted-foreground mb-2">Add a Verse (optional)</label>
            <input
              type="text"
              placeholder="Search: John 3:16, Psalm 23:1..."
              value={verseSearch}
              onChange={(e) => setVerseSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            />
            {verseSearch && !selectedVerse && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-card border border-border rounded-lg shadow-lg z-20 max-h-32 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedVerse({ reference: verseSearch, text: "Loading verse..." });
                    setVerseSearch("");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors font-body text-xs text-foreground flex items-center gap-2"
                >
                  <BookOpen className="w-3 h-3 flex-shrink-0" />
                  {verseSearch}
                </button>
              </div>
            )}
          </div>

          {/* Caption */}
          <MentionInput
            multiline
            placeholder="Add thoughts… use @ to tag someone"
            value={caption}
            onChange={setCaption}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px] font-body resize-none"
          />

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Cancel
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || uploading || (!caption.trim() && !selectedVerse && mediaFiles.length === 0)}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {(createMutation.isPending || uploading) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Share
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}