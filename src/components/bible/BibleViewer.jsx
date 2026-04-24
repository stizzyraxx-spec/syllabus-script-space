import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Highlighter, BookOpen, Send, X, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import WordDefinition from "./WordDefinition";
import VerseCommentary from "./VerseCommentary";
import { useAwardPoints } from "@/hooks/useAwardPoints";

export default function BibleViewer({ user, books, currentBook, onBookChange, currentChapter, onChapterChange }) {
  const [selectedWord, setSelectedWord] = useState(null);
  const [note, setNote] = useState("");
  const [highlightingVerse, setHighlightingVerse] = useState(null);
  const [postingVerse, setPostingVerse] = useState(null);
  const [postingVerseText, setPostingVerseText] = useState(null);
  const [postCaption, setPostCaption] = useState("");
  const queryClient = useQueryClient();
  const { awardPoints } = useAwardPoints();

  const { data: versesData = [], isLoading: versesLoading } = useQuery({
    queryKey: ["bible-verses", currentBook, currentChapter],
    queryFn: async () => {
      const res = await base44.functions.invoke("getBibleVerses", {
        book: currentBook,
        chapter: currentChapter,
      });
      return res.data?.verses || [];
    },
  });

  const verses = versesData;

  const { data: userHighlights = [] } = useQuery({
    queryKey: ["highlights", user?.email],
    queryFn: () => user?.email 
      ? base44.entities.BibleHighlight.filter({ user_email: user.email })
      : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const { data: userFavorites = [] } = useQuery({
    queryKey: ["favorites", user?.email],
    queryFn: () => user?.email 
      ? base44.entities.BibleFavorite.filter({ user_email: user.email })
      : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const addHighlight = useMutation({
    mutationFn: (data) => base44.entities.BibleHighlight.create(data),
    onSuccess: async () => {
      await awardPoints(user.email, "verse_highlight");
      queryClient.invalidateQueries({ queryKey: ["highlights", user?.email] });
      setHighlightingVerse(null);
      setNote("");
    },
  });

  const deleteHighlight = useMutation({
    mutationFn: (id) => base44.entities.BibleHighlight.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["highlights", user?.email] });
      setHighlightingVerse(null);
      setNote("");
    },
  });

  const deleteAllHighlights = async () => {
    if (!window.confirm('Remove all highlights? This cannot be undone.')) return;
    try {
      const allHighlights = await base44.entities.BibleHighlight.filter({ user_email: user.email });
      for (const h of allHighlights) {
        await base44.entities.BibleHighlight.delete(h.id);
      }
      queryClient.invalidateQueries({ queryKey: ["highlights", user?.email] });
      setHighlightingVerse(null);
      setNote("");
    } catch (error) {
      console.error('Error deleting all highlights:', error);
    }
  };

  const favoriteMutation = useMutation({
    mutationFn: async (data) => {
      const isFavorited = userFavorites.some(f => f.book === data.book && f.chapter === data.chapter && f.start_verse === data.start_verse);
      if (isFavorited) {
        const fav = userFavorites.find(f => f.book === data.book && f.chapter === data.chapter && f.start_verse === data.start_verse);
        return base44.entities.BibleFavorite.delete(fav.id);
      } else {
        await awardPoints(user.email, "verse_saved");
        return base44.entities.BibleFavorite.create(data);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", user?.email] }),
  });

  const handleFavoriteToggle = (verseNum, text) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    favoriteMutation.mutate({
      user_email: user.email,
      book: currentBook,
      chapter: currentChapter,
      start_verse: verseNum,
      text,
      title: `${currentBook} ${currentChapter}:${verseNum}`,
    });
  };

  const handleWordClick = (word) => {
    setSelectedWord(word);
  };

  const handleHighlight = (verseNum) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    setHighlightingVerse(verseNum);
  };

  const submitHighlight = () => {
    if (!highlightingVerse) return;
    const verseText = verses[highlightingVerse - 1];
    addHighlight.mutate({
      user_email: user.email,
      book: currentBook,
      chapter: currentChapter,
      verse: highlightingVerse,
      text: verseText,
      color: "yellow",
      note: note.trim() || null,
    });
  };

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        return profiles?.[0] || null;
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        return null;
      }
    },
    enabled: !!user?.email,
  });

  const postVerseMutation = useMutation({
    mutationFn: async () => {
      if (!postingVerse || !user || !postingVerseText) throw new Error("Missing data");
      const verseRef = `${currentBook} ${currentChapter}:${postingVerse}`;
      const authorName = myProfile?.display_name || user.full_name || "Anonymous";
      const authorAvatar = myProfile?.avatar_url || null;
      
      const post = await base44.entities.CommunityPost.create({
        author_email: user.email,
        author_name: authorName,
        author_avatar: authorAvatar,
        caption: `📖 ${verseRef}\n\n"${postingVerseText}"\n\n${postCaption}`,
        media_url: null,
        media_type: "text",
        likes: 0,
        liked_by: [],
        comment_count: 0,
      });
      return post;
    },
    onSuccess: async () => {
      await awardPoints(user.email, "verse_post");
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts", user?.email] });
      setPostingVerse(null);
      setPostingVerseText(null);
      setPostCaption("");
    },
    onError: (error) => {
      console.error("Failed to post verse:", error);
      alert("Failed to post verse. Please try again.");
    },
  });

  const handlePostVerse = (verseNum) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    setPostingVerse(verseNum);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2"
      >
        <div className="mb-6 space-y-3">
          <select
            value={currentBook}
            onChange={(e) => onBookChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground font-body"
          >
            {books.map((book) => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>

          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">{currentBook} {currentChapter}</h2>
            <div className="flex items-center gap-2">
              {userHighlights.length > 0 && (
                <button
                  onClick={deleteAllHighlights}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => onChapterChange(Math.max(1, currentChapter - 1))}
                disabled={currentChapter === 1}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <input
                type="number"
                min="1"
                value={currentChapter}
                onChange={(e) => onChapterChange(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 rounded border border-border bg-card text-center"
              />
              <button
                onClick={() => onChapterChange(currentChapter + 1)}
                className="p-2 rounded-lg hover:bg-secondary"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-card rounded-xl border border-border p-6">
          {versesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : verses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No verses found for this chapter.</p>
          ) : verses.map((text, idx) => {
            const verseNum = idx + 1;
            const words = text.split(/\s+/);
            const isHighlighted = userHighlights.some(h => h.book === currentBook && h.chapter === currentChapter && h.verse === verseNum);
            const highlightData = userHighlights.find(h => h.book === currentBook && h.chapter === currentChapter && h.verse === verseNum);
            const isFavorited = userFavorites.some(f => f.book === currentBook && f.chapter === currentChapter && f.start_verse === verseNum);

            return (
              <motion.div
                key={verseNum}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="space-y-2"
              >
                <div className={`flex items-start justify-between gap-3 p-2 rounded ${
                  isHighlighted && highlightData 
                    ? highlightData.color === 'yellow' ? 'bg-yellow-100' 
                    : highlightData.color === 'green' ? 'bg-green-100'
                    : highlightData.color === 'blue' ? 'bg-blue-100'
                    : highlightData.color === 'pink' ? 'bg-pink-100'
                    : 'bg-orange-100'
                    : ''
                }`}>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedWord(verseNum === selectedWord ? null : `verse-${verseNum}`)} className="font-bold text-accent text-sm hover:opacity-70 transition-opacity cursor-pointer">{verseNum}</button>
                      <p className="font-body text-foreground leading-relaxed text-sm">
                        {words.map((word, i) => (
                          <span
                            key={i}
                            onClick={() => handleWordClick(word.replace(/[,.:;!?]/g, ""))}
                            className="hover:text-accent cursor-pointer hover:underline transition-colors"
                          >
                            {word}{" "}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleHighlight(verseNum)}
                      className={`p-1.5 rounded transition-colors ${isHighlighted ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                      title="Highlight verse"
                    >
                      <Highlighter className="w-4 h-4" fill={isHighlighted ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => setSelectedWord(`verse-${verseNum}`)}
                      className="p-1.5 text-muted-foreground hover:text-accent rounded hover:bg-secondary transition-colors"
                      title="Read commentary"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFavoriteToggle(verseNum, text)}
                      disabled={favoriteMutation.isPending}
                      className={`p-1.5 rounded transition-colors ${isFavorited ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                      title={isFavorited ? "Remove from favorites" : "Save verse"}
                    >
                      {favoriteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />}
                    </button>
                    <button
                      onClick={() => handlePostVerse(verseNum)}
                      className="p-1.5 text-muted-foreground hover:text-accent rounded hover:bg-secondary transition-colors"
                      title="Share verse"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {highlightingVerse === verseNum && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-secondary rounded p-3 space-y-2 ml-6"
                  >
                    {!isHighlighted ? (
                      <>
                        <textarea
                          placeholder="Add a note (optional)..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-border bg-background text-foreground font-body text-xs outline-none focus:ring-1 focus:ring-accent"
                          rows="2"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setHighlightingVerse(null); setNote(""); }}
                            className="px-3 py-1.5 rounded text-xs font-semibold text-muted-foreground hover:bg-card transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={submitHighlight}
                            disabled={addHighlight.isPending}
                            className="px-3 py-1.5 rounded bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
                          >
                            {addHighlight.isPending ? 'Saving...' : 'Save Highlight'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-body text-xs text-foreground"><strong>Note:</strong> {highlightData?.note || 'No note'}</p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setHighlightingVerse(null)}
                            className="px-3 py-1.5 rounded text-xs font-semibold text-muted-foreground hover:bg-card transition-colors"
                          >
                            Close
                          </button>
                          <button
                            onClick={() => deleteHighlight.mutate(highlightData.id)}
                            disabled={deleteHighlight.isPending}
                            className="px-3 py-1.5 rounded bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                          >
                            {deleteHighlight.isPending ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {postingVerse && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="lg:col-span-1"
        >
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">Share Verse</h3>
              <button 
                onClick={() => { setPostingVerse(null); setPostingVerseText(null); setPostCaption(""); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="font-body text-xs text-muted-foreground mb-1">Verse:</p>
              <p className="font-display text-sm italic text-foreground">"{postingVerseText}"</p>
              <p className="font-body text-xs text-accent mt-1">— {currentBook} {currentChapter}:{postingVerse}</p>
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-muted-foreground mb-2 block">Add your thoughts (optional)</label>
              <textarea
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                placeholder="Share why this verse speaks to you..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent min-h-[80px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setPostingVerse(null); setPostingVerseText(null); setPostCaption(""); }}
                className="flex-1 px-3 py-2 rounded-lg border border-border font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => postVerseMutation.mutate()}
                disabled={postVerseMutation.isPending}
                className="flex-1 px-3 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {postVerseMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Post
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {selectedWord && !postingVerse && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="lg:col-span-1"
        >
          {selectedWord.startsWith('verse-') ? (
            <VerseCommentary 
              book={currentBook} 
              chapter={currentChapter} 
              verse={parseInt(selectedWord.split('-')[1])} 
              text={verses[parseInt(selectedWord.split('-')[1]) - 1]}
              onClose={() => setSelectedWord(null)}
            />
          ) : (
            <WordDefinition word={selectedWord} onClose={() => setSelectedWord(null)} />
          )}
        </motion.div>
      )}

    </div>
  );
}