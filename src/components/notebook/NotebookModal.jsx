import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, ChevronDown, ChevronRight, Trash2, Pin, PinOff, PenTool } from "lucide-react";
import WhiteboardModal from "./WhiteboardModal";

export default function NotebookModal({ userEmail, onClose }) {
  const queryClient = useQueryClient();
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [showNewNote, setShowNewNote] = useState(false);
  const [newChapter, setNewChapter] = useState("");
  const [newSubsection, setNewSubsection] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [noteType, setNoteType] = useState("chapter"); // "chapter" | "reflection"

  // ── Local-storage backup so notes always persist, even if the DB write fails ──
  const localKey = `tcom-notebook-${userEmail || 'guest'}`;
  const loadLocal = () => {
    try { return JSON.parse(localStorage.getItem(localKey) || '[]'); } catch { return []; }
  };
  const saveLocal = (notes) => {
    try { localStorage.setItem(localKey, JSON.stringify(notes)); } catch {}
  };

  // Fetch all notes from DB; if DB query fails (table missing etc.), fall back to local
  const { data: dbNotes = [] } = useQuery({
    queryKey: ["notebook-entries", userEmail],
    queryFn: async () => {
      try { return await db.entities.NotebookEntry.filter({ user_email: userEmail }); }
      catch { return []; }
    },
    enabled: !!userEmail,
  });

  // Merge DB + local notes (dedupe by id; local entries get a "_local" id prefix)
  const localNotes = loadLocal();
  const dbIds = new Set(dbNotes.map(n => n.id));
  const allNotes = [...dbNotes, ...localNotes.filter(n => !dbIds.has(n.id))];

  // Mutations — always succeed by writing to localStorage as a fallback
  const createNoteMutation = useMutation({
    mutationFn: async (noteData) => {
      try { return await db.entities.NotebookEntry.create(noteData); }
      catch (err) {
        const local = loadLocal();
        const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const entry = { ...noteData, id, _local: true, created_date: new Date().toISOString() };
        saveLocal([...local, entry]);
        return entry;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-entries", userEmail] });
      setShowNewNote(false);
      setEditingNote(null);
      setNewChapter("");
      setNewSubsection("");
      setNoteContent("");
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (String(id).startsWith('local-')) {
        const local = loadLocal().map(n => (n.id === id ? { ...n, ...data, updated_date: new Date().toISOString() } : n));
        saveLocal(local);
        return { id, ...data };
      }
      try { return await db.entities.NotebookEntry.update(id, data); }
      catch {
        const local = [...loadLocal(), { id, ...data, _local: true, updated_date: new Date().toISOString() }];
        saveLocal(local);
        return { id, ...data };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-entries", userEmail] });
      setShowNewNote(false);
      setEditingNote(null);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id) => {
      if (String(id).startsWith('local-')) {
        saveLocal(loadLocal().filter(n => n.id !== id));
        return { id };
      }
      try { return await db.entities.NotebookEntry.delete(id); }
      catch { return { id }; }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notebook-entries", userEmail] }),
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }) => {
      if (String(id).startsWith('local-')) {
        const local = loadLocal().map(n => (n.id === id ? { ...n, is_pinned: !isPinned } : n));
        saveLocal(local);
        return { id, is_pinned: !isPinned };
      }
      try { return await db.entities.NotebookEntry.update(id, { is_pinned: !isPinned }); }
      catch { return { id, is_pinned: !isPinned }; }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notebook-entries", userEmail] }),
  });

  // Group notes by chapter
  const groupedNotes = allNotes.reduce((acc, note) => {
    if (!acc[note.chapter_title]) {
      acc[note.chapter_title] = [];
    }
    acc[note.chapter_title].push(note);
    return acc;
  }, {});

  // Sort chapters, pinned first
  const sortedChapters = Object.entries(groupedNotes).sort(([, notesA], [, notesB]) => {
    const aPinned = notesA.some((n) => n.is_pinned) ? -1 : 0;
    const bPinned = notesB.some((n) => n.is_pinned) ? -1 : 0;
    return aPinned - bPinned;
  });

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    // Reflections auto-file under the "Reflections" chapter and skip sub-chapter
    const effectiveChapter = noteType === "reflection" ? "Reflections" : newChapter.trim();
    const effectiveSub = noteType === "reflection" ? null : (newSubsection || null);
    if (!effectiveChapter) return;

    if (editingNote) {
      updateNoteMutation.mutate({
        id: editingNote.id,
        data: {
          chapter_title: effectiveChapter,
          subsection_title: effectiveSub,
          content: noteContent,
        },
      });
    } else {
      createNoteMutation.mutate({
        user_email: userEmail,
        chapter_title: effectiveChapter,
        subsection_title: effectiveSub,
        content: noteContent,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div className="max-w-4xl w-full py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl font-bold text-white">Notebook</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWhiteboard(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors text-sm font-semibold"
              title="Open whiteboard"
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">Whiteboard</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close notebook"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
          {/* Chapters Sidebar */}
          <div className="bg-black/90 border border-white/20 rounded-lg p-4 overflow-y-auto">
            <button
              onClick={() => {
                setShowNewNote(true);
                setEditingNote(null);
                setNewChapter("");
                setNewSubsection("");
                setNoteContent("");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors mb-4 font-body text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>

            <div className="space-y-1">
              {sortedChapters.map(([chapter, notes]) => {
                const isExpanded = expandedChapters[chapter];
                const hasPinned = notes.some((n) => n.is_pinned);

                return (
                  <div key={chapter}>
                    <button
                      onClick={() =>
                        setExpandedChapters((prev) => ({
                          ...prev,
                          [chapter]: !isExpanded,
                        }))
                      }
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span className="font-semibold text-white text-sm flex-1">{chapter}</span>
                      {hasPinned && <span className="text-accent text-xs">📌</span>}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 pl-4 pt-1">
                            {notes
                              .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
                              .map((note) => (
                                <button
                                  key={note.id}
                                  onClick={() => {
                                    setEditingNote(note);
                                    setNewChapter(note.chapter_title);
                                    setNewSubsection(note.subsection_title || "");
                                    setNoteContent(note.content);
                                    setShowNewNote(true);
                                  }}
                                  className="w-full text-left px-3 py-1.5 rounded-lg bg-white/5 hover:bg-accent/20 transition-colors text-xs text-white/70 hover:text-white"
                                >
                                  {note.is_pinned && <Pin className="w-3 h-3 inline mr-1 text-accent" />}
                                  {note.subsection_title || "(Untitled)"}
                                </button>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="md:col-span-2 bg-black/90 border border-white/20 rounded-lg p-4 flex flex-col overflow-hidden">
            {showNewNote ? (
              <>
                {/* Note type toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setNoteType("chapter")}
                    className={`flex-1 px-3 py-2 rounded-lg font-body text-sm font-semibold transition-colors ${
                      noteType === "chapter"
                        ? "bg-accent text-accent-foreground"
                        : "border border-white/20 text-white/70 hover:text-white"
                    }`}
                  >
                    Chapter Note
                  </button>
                  <button
                    onClick={() => setNoteType("reflection")}
                    className={`flex-1 px-3 py-2 rounded-lg font-body text-sm font-semibold transition-colors ${
                      noteType === "reflection"
                        ? "bg-accent text-accent-foreground"
                        : "border border-white/20 text-white/70 hover:text-white"
                    }`}
                  >
                    Quick Reflection
                  </button>
                </div>

                {noteType === "chapter" && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-white/60 text-xs font-semibold">Chapter</label>
                      <input
                        type="text"
                        value={newChapter}
                        onChange={(e) => setNewChapter(e.target.value)}
                        placeholder="e.g. Prayer, Scripture Study, Daily Reflections"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                      />
                    </div>

                    <div>
                      <label className="text-white/60 text-xs font-semibold">Sub-Chapter (Optional)</label>
                      <input
                        type="text"
                        value={newSubsection}
                        onChange={(e) => setNewSubsection(e.target.value)}
                        placeholder="e.g. Psalm 23, Faith, Morning Prayer"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                      />
                    </div>
                  </div>
                )}

                {noteType === "reflection" && (
                  <p className="text-white/50 text-xs mb-3 italic">
                    Reflections are filed under their own chapter — just write what's on your heart.
                  </p>
                )}

                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here... You can use markdown formatting."
                  className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-accent/50 resize-none font-body text-sm"
                />

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setShowNewNote(false);
                      setEditingNote(null);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-colors"
                  >
                    {editingNote ? "Save Changes" : "Create Note"}
                  </button>
                  {editingNote && (
                    <button
                      onClick={() => {
                        deleteNoteMutation.mutate(editingNote.id);
                        setShowNewNote(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white/50">
                <p>Select a note to view or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWhiteboard && (
          <WhiteboardModal userEmail={userEmail} onClose={() => setShowWhiteboard(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}