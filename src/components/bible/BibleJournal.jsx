import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, X, Loader2, Heart, Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function BibleJournal({ user, onClose }) {
  const [view, setView] = useState("list"); // list, create, view, edit
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    book: "",
    chapter: "",
    verse: "",
    verse_text: "",
    notes: "",
    reflection: "",
    tags: "",
    is_favorite: false,
  });
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["bible-journal", user?.email],
    queryFn: () => user?.email 
      ? db.entities.BibleJournal.filter({ user_email: user.email }, "-created_date")
      : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.BibleJournal.create({
      user_email: user.email,
      ...data,
      tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(t => t) : [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-journal", user?.email] });
      resetForm();
      setView("list");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => db.entities.BibleJournal.update(selectedEntry.id, {
      notes: data.notes,
      reflection: data.reflection,
      tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(t => t) : [],
      is_favorite: data.is_favorite,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-journal", user?.email] });
      resetForm();
      setView("list");
      setSelectedEntry(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.BibleJournal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-journal", user?.email] });
      setSelectedEntry(null);
      setView("list");
    },
  });

  const resetForm = () => {
    setFormData({
      book: "",
      chapter: "",
      verse: "",
      verse_text: "",
      notes: "",
      reflection: "",
      tags: "",
      is_favorite: false,
    });
  };

  const handleCreateEntry = () => {
    if (!formData.book || !formData.chapter || !formData.verse || !formData.verse_text) {
      alert("Please fill in verse details");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdateEntry = () => {
    updateMutation.mutate(formData);
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      book: entry.book,
      chapter: entry.chapter,
      verse: entry.verse,
      verse_text: entry.verse_text,
      notes: entry.notes || "",
      reflection: entry.reflection || "",
      tags: entry.tags ? entry.tags.join(", ") : "",
      is_favorite: entry.is_favorite,
    });
    setView("edit");
  };

  const filteredEntries = entries.filter(entry =>
    entry.book.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const favoriteEntries = filteredEntries.filter(e => e.is_favorite);
  const otherEntries = filteredEntries.filter(e => !e.is_favorite);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="lg:col-span-1 space-y-4"
    >
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <h3 className="font-display text-lg font-bold text-foreground">My Journal</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {view === "list" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search journal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm"
              />
              <button
                onClick={() => setView("create")}
                className="px-3 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No journal entries yet</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {favoriteEntries.length > 0 && (
                  <div>
                    <p className="font-body text-xs font-semibold text-accent mb-2">FAVORITES</p>
                    <div className="space-y-2">
                      {favoriteEntries.map(entry => (
                        <button
                          key={entry.id}
                          onClick={() => {
                            setSelectedEntry(entry);
                            setView("view");
                          }}
                          className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors border border-accent/20"
                        >
                          <p className="font-body text-xs font-semibold text-accent flex items-center gap-1 mb-1">
                            <Heart className="w-3 h-3 fill-current" />
                            {entry.book} {entry.chapter}:{entry.verse}
                          </p>
                          <p className="font-body text-xs text-foreground line-clamp-2">{entry.notes || entry.verse_text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {otherEntries.length > 0 && (
                  <div>
                    {favoriteEntries.length > 0 && <p className="font-body text-xs font-semibold text-muted-foreground mt-4 mb-2">ALL ENTRIES</p>}
                    <div className="space-y-2">
                      {otherEntries.map(entry => (
                        <button
                          key={entry.id}
                          onClick={() => {
                            setSelectedEntry(entry);
                            setView("view");
                          }}
                          className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors"
                        >
                          <p className="font-body text-xs font-semibold text-accent mb-1">{entry.book} {entry.chapter}:{entry.verse}</p>
                          <p className="font-body text-xs text-foreground line-clamp-2">{entry.notes || entry.verse_text}</p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {entry.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-accent/20 text-accent">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === "create" && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleCreateEntry(); }}>
            <input
              type="text"
              placeholder="Book (e.g., John)"
              value={formData.book}
              onChange={(e) => setFormData({ ...formData, book: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Chapter"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
              />
              <input
                type="number"
                placeholder="Verse"
                value={formData.verse}
                onChange={(e) => setFormData({ ...formData, verse: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <Textarea
              placeholder="Verse text"
              value={formData.verse_text}
              onChange={(e) => setFormData({ ...formData, verse_text: e.target.value })}
              className="font-body text-sm min-h-[60px]"
            />
            <Textarea
              placeholder="Your notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="font-body text-sm min-h-[60px]"
            />
            <Textarea
              placeholder="Personal reflection or prayer (optional)"
              value={formData.reflection}
              onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
              className="font-body text-sm min-h-[50px]"
            />
            <input
              type="text"
              placeholder="Tags (comma-separated, optional)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setView("list"); resetForm(); }}
                className="flex-1 px-3 py-2 rounded-lg border border-border font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 px-3 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </form>
        )}

        {view === "view" && selectedEntry && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="font-body text-xs text-muted-foreground mb-1">Verse</p>
              <p className="font-display text-sm font-bold text-accent mb-2">{selectedEntry.book} {selectedEntry.chapter}:{selectedEntry.verse}</p>
              <p className="font-body text-sm italic text-foreground">"{selectedEntry.verse_text}"</p>
            </div>

            {selectedEntry.notes && (
              <div>
                <p className="font-body text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                <p className="font-body text-sm text-foreground">{selectedEntry.notes}</p>
              </div>
            )}

            {selectedEntry.reflection && (
              <div>
                <p className="font-body text-xs font-semibold text-muted-foreground mb-1">Reflection</p>
                <p className="font-body text-sm text-foreground italic">{selectedEntry.reflection}</p>
              </div>
            )}

            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selectedEntry.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded text-xs bg-accent/20 text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setView("list")}
                className="flex-1 px-3 py-2 rounded-lg border border-border font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => handleEditEntry(selectedEntry)}
                className="flex-1 px-3 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedEntry.id)}
                disabled={deleteMutation.isPending}
                className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {view === "edit" && selectedEntry && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleUpdateEntry(); }}>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="font-body text-xs text-muted-foreground mb-1">Verse</p>
              <p className="font-body text-sm text-foreground">{selectedEntry.book} {selectedEntry.chapter}:{selectedEntry.verse}</p>
            </div>

            <Textarea
              placeholder="Your notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="font-body text-sm min-h-[60px]"
            />

            <Textarea
              placeholder="Personal reflection or prayer (optional)"
              value={formData.reflection}
              onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
              className="font-body text-sm min-h-[50px]"
            />

            <input
              type="text"
              placeholder="Tags (comma-separated, optional)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_favorite}
                onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <span className="font-body text-sm text-foreground">Mark as favorite</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView("view")}
                className="flex-1 px-3 py-2 rounded-lg border border-border font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 px-3 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}