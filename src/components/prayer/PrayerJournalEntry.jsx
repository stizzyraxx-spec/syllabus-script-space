import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const MOODS = ["grateful", "peaceful", "hopeful", "struggling", "joyful", "reflective"];
const MOOD_EMOJIS = {
  grateful: "🙏",
  peaceful: "☮️",
  hopeful: "🌅",
  struggling: "💔",
  joyful: "😊",
  reflective: "🤔",
};

export default function PrayerJournalEntry({ entry, userEmail, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: entry?.title || "",
    content: entry?.content || "",
    mood: entry?.mood || "peaceful",
    associated_verses: entry?.associated_verses || [],
    prayer_requests: entry?.prayer_requests || [],
  });
  const [newRequest, setNewRequest] = useState("");
  const [newVerse, setNewVerse] = useState({ book: "", chapter: "", verse: "", text: "" });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        user_email: userEmail,
        entry_date: entry?.entry_date || new Date().toISOString().split('T')[0],
        title: form.title,
        content: form.content,
        mood: form.mood,
        associated_verses: form.associated_verses,
        prayer_requests: form.prayer_requests,
      };

      if (entry?.id) {
        await base44.entities.PrayerJournal.update(entry.id, data);
      } else {
        await base44.entities.PrayerJournal.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-journal", userEmail] });
      toast.success(entry?.id ? "Entry updated" : "Entry saved");
      onClose();
    },
    onError: (err) => {
      console.error("Error saving entry:", err);
      toast.error("Failed to save entry");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.PrayerJournal.delete(entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-journal", userEmail] });
      toast.success("Entry deleted");
      onClose();
    },
    onError: (err) => {
      console.error("Error deleting entry:", err);
      toast.error("Failed to delete entry");
    },
  });

  const handleAddRequest = () => {
    if (newRequest.trim()) {
      setForm(f => ({
        ...f,
        prayer_requests: [...f.prayer_requests, newRequest.trim()]
      }));
      setNewRequest("");
    }
  };

  const handleRemoveRequest = (idx) => {
    setForm(f => ({
      ...f,
      prayer_requests: f.prayer_requests.filter((_, i) => i !== idx)
    }));
  };

  const handleAddVerse = () => {
    if (newVerse.book && newVerse.chapter && newVerse.verse) {
      setForm(f => ({
        ...f,
        associated_verses: [...f.associated_verses, { ...newVerse }]
      }));
      setNewVerse({ book: "", chapter: "", verse: "", text: "" });
    }
  };

  const handleRemoveVerse = (idx) => {
    setForm(f => ({
      ...f,
      associated_verses: f.associated_verses.filter((_, i) => i !== idx)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-border sticky top-0 bg-card flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            {entry?.id ? "Edit Prayer Entry" : "New Prayer Entry"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="font-body text-sm font-semibold text-muted-foreground mb-1.5 block">
              Prayer Topic
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Thanksgiving for my family..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="font-body text-sm font-semibold text-muted-foreground mb-2 block">
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button
                  key={mood}
                  onClick={() => setForm(f => ({ ...f, mood }))}
                  className={`px-3 py-1.5 rounded-full font-body text-xs font-semibold transition-all ${
                    form.mood === mood
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {MOOD_EMOJIS[mood]} {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="font-body text-sm font-semibold text-muted-foreground mb-1.5 block">
              Prayer Journal
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your prayer, thoughts, and reflections here..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent min-h-[150px] resize-none"
            />
          </div>

          {/* Prayer Requests */}
          <div>
            <label className="font-body text-sm font-semibold text-muted-foreground mb-2 block">
              Prayer Requests
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newRequest}
                onChange={(e) => setNewRequest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRequest()}
                placeholder="Add a prayer request..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={handleAddRequest}
                className="px-3 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {form.prayer_requests.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
                  <p className="font-body text-foreground">📌 {req}</p>
                  <button
                    onClick={() => handleRemoveRequest(idx)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Associated Verses */}
          <div>
            <label className="font-body text-sm font-semibold text-muted-foreground mb-2 block">
              Associated Bible Verses
            </label>
            <div className="space-y-2 mb-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newVerse.book}
                  onChange={(e) => setNewVerse(v => ({ ...v, book: e.target.value }))}
                  placeholder="Book"
                  className="px-2 py-1.5 rounded border border-border bg-background text-foreground font-body text-xs outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                  type="number"
                  value={newVerse.chapter}
                  onChange={(e) => setNewVerse(v => ({ ...v, chapter: parseInt(e.target.value) || "" }))}
                  placeholder="Chapter"
                  className="px-2 py-1.5 rounded border border-border bg-background text-foreground font-body text-xs outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                  type="number"
                  value={newVerse.verse}
                  onChange={(e) => setNewVerse(v => ({ ...v, verse: parseInt(e.target.value) || "" }))}
                  placeholder="Verse"
                  className="px-2 py-1.5 rounded border border-border bg-background text-foreground font-body text-xs outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <textarea
                value={newVerse.text}
                onChange={(e) => setNewVerse(v => ({ ...v, text: e.target.value }))}
                placeholder="Verse text (optional)"
                className="w-full px-2 py-1.5 rounded border border-border bg-background text-foreground font-body text-xs outline-none focus:ring-1 focus:ring-accent min-h-[50px] resize-none"
              />
              <button
                onClick={handleAddVerse}
                className="w-full px-3 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Add Verse
              </button>
            </div>
            <div className="space-y-1.5">
              {form.associated_verses.map((v, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-secondary/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs font-semibold text-foreground">
                        {v.book} {v.chapter}:{v.verse}
                      </p>
                      {v.text && <p className="font-body text-xs text-muted-foreground italic mt-0.5 line-clamp-2">"{v.text}"</p>}
                    </div>
                    <button
                      onClick={() => handleRemoveVerse(idx)}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-card sticky bottom-0 flex gap-2">
          {entry?.id && (
            <button
              onClick={() => {
                if (confirm("Delete this entry?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 font-body text-sm font-semibold"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-border font-body text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!form.title || !form.content || saveMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 font-body text-sm font-semibold"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}