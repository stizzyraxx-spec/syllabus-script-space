import React, { useState, useEffect, useRef } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Highlighter, BookOpen, Send, X, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import WordDefinition from "./WordDefinition";
import VerseCommentary from "./VerseCommentary";
import { useAwardPoints } from "@/hooks/useAwardPoints";

// Map book names to their standard Bible book numbers (for getbible.net)
const BOOK_NUMBERS = {
  Genesis:1,Exodus:2,Leviticus:3,Numbers:4,Deuteronomy:5,Joshua:6,Judges:7,Ruth:8,
  "1 Samuel":9,"2 Samuel":10,"1 Kings":11,"2 Kings":12,"1 Chronicles":13,"2 Chronicles":14,
  Ezra:15,Nehemiah:16,Esther:17,Job:18,Psalms:19,Proverbs:20,Ecclesiastes:21,
  Isaiah:23,Jeremiah:24,Lamentations:25,Ezekiel:26,Daniel:27,Hosea:28,Joel:29,
  Amos:30,Obadiah:31,Jonah:32,Micah:33,Nahum:34,Habakkuk:35,Zephaniah:36,
  Haggai:37,Zechariah:38,Malachi:39,Matthew:40,Mark:41,Luke:42,John:43,Acts:44,
  Romans:45,"1 Corinthians":46,"2 Corinthians":47,Galatians:48,Ephesians:49,
  Philippians:50,Colossians:51,"1 Thessalonians":52,"2 Thessalonians":53,
  "1 Timothy":54,"2 Timothy":55,Titus:56,Philemon:57,Hebrews:58,James:59,
  "1 Peter":60,"2 Peter":61,"1 John":62,"2 John":63,"3 John":64,Jude:65,Revelation:66,
};

// Books where Jesus speaks (red-letter only applies here)
const JESUS_SPEAKS_BOOKS = new Set(["Matthew","Mark","Luke","John","Acts","Revelation"]);

export default function BibleViewer({ user, books, currentBook, onBookChange, currentChapter, onChapterChange, initialVerse }) {
  const [selectedWord, setSelectedWord] = useState(null);
  const [postingVerse, setPostingVerse] = useState(null);
  const [postingVerseText, setPostingVerseText] = useState(null);
  const [postCaption, setPostCaption] = useState("");
  const queryClient = useQueryClient();
  const { awardPoints } = useAwardPoints();
  const verseRefs = useRef({});
  const hasScrolledRef = useRef(false);

  const { data: versesData = [], isLoading: versesLoading } = useQuery({
    queryKey: ["bible-verses", currentBook, currentChapter],
    queryFn: async () => {
      const res = await db.functions.invoke("getBibleVerses", {
        book: currentBook,
        chapter: currentChapter,
        version: "KJV",
      });
      return res.data?.verses || [];
    },
  });

  // Fetch Words of Jesus (woj) flags from getbible.net — only for relevant books
  const { data: wojVerses = new Set() } = useQuery({
    queryKey: ["woj", currentBook, currentChapter],
    queryFn: async () => {
      const bookNum = BOOK_NUMBERS[currentBook];
      if (!bookNum) return new Set();
      try {
        const res = await fetch(
          `https://getbible.net/v2/kjv/${bookNum}/${currentChapter}.json`
        );
        if (!res.ok) return new Set();
        const data = await res.json();
        const verseList = data?.book?.[0]?.verses ?? data?.verses ?? [];
        const arr = Array.isArray(verseList) ? verseList : Object.values(verseList);
        const woj = new Set();
        arr.forEach(v => { if (v?.woj) woj.add(Number(v.verse)); });
        return woj;
      } catch {
        return new Set();
      }
    },
    staleTime: Infinity,
    enabled: JESUS_SPEAKS_BOOKS.has(currentBook),
  });

  const verses = versesData;

  // Local-storage backup so highlights and favorites work even if the DB
  // tables (bible_highlights, bible_favorites) aren't provisioned.
  const hlKey = user?.email ? `tcom-highlights-${user.email}` : null;
  const favKey = user?.email ? `tcom-favorites-${user.email}` : null;
  const loadHL = () => { try { return JSON.parse(localStorage.getItem(hlKey) || '[]'); } catch { return []; } };
  const loadFav = () => { try { return JSON.parse(localStorage.getItem(favKey) || '[]'); } catch { return []; } };
  const saveHL = (arr) => { try { localStorage.setItem(hlKey, JSON.stringify(arr)); } catch {} };
  const saveFav = (arr) => { try { localStorage.setItem(favKey, JSON.stringify(arr)); } catch {} };

  const { data: userHighlights = [] } = useQuery({
    queryKey: ["highlights", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      let dbList = [];
      try { dbList = await db.entities.BibleHighlight.filter({ user_email: user.email }); } catch {}
      const local = loadHL();
      const dbIds = new Set(dbList.map(h => h.id));
      return [...dbList, ...local.filter(h => !dbIds.has(h.id))];
    },
    enabled: !!user?.email,
  });

  const { data: userFavorites = [] } = useQuery({
    queryKey: ["favorites", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      let dbList = [];
      try { dbList = await db.entities.BibleFavorite.filter({ user_email: user.email }); } catch {}
      const local = loadFav();
      const dbIds = new Set(dbList.map(f => f.id));
      return [...dbList, ...local.filter(f => !dbIds.has(f.id))];
    },
    enabled: !!user?.email,
  });

  // Scroll to the initial random verse once — only on first load
  useEffect(() => {
    if (!initialVerse || verses.length === 0 || hasScrolledRef.current) return;
    const target = Math.min(initialVerse, verses.length);
    const el = verseRefs.current[target];
    if (el) {
      hasScrolledRef.current = true;
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    }
  }, [verses, initialVerse]);

  const addHighlight = useMutation({
    mutationFn: async (data) => {
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      const localEntry = { ...data, id: localId, _local: true };
      saveHL([...loadHL(), localEntry]);
      try { await db.entities.BibleHighlight.create(data); } catch {}
      try { await awardPoints(user.email, "verse_highlight"); } catch {}
      return localEntry;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["highlights", user?.email] }),
  });

  const deleteHighlight = useMutation({
    mutationFn: async (id) => {
      saveHL(loadHL().filter(h => h.id !== id));
      if (!String(id).startsWith('local-')) {
        try { await db.entities.BibleHighlight.delete(id); } catch {}
      }
      return { id };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["highlights", user?.email] }),
  });

  const deleteAllHighlights = async () => {
    if (!window.confirm('Remove all highlights? This cannot be undone.')) return;
    saveHL([]);
    try {
      const allHighlights = await db.entities.BibleHighlight.filter({ user_email: user.email });
      for (const h of allHighlights) { try { await db.entities.BibleHighlight.delete(h.id); } catch {} }
    } catch {}
    queryClient.invalidateQueries({ queryKey: ["highlights", user?.email] });
  };

  const favoriteMutation = useMutation({
    mutationFn: async (data) => {
      const matchKey = (f) => f.book === data.book && f.chapter === data.chapter && f.start_verse === data.start_verse;
      const isFavorited = userFavorites.some(matchKey);
      if (isFavorited) {
        const fav = userFavorites.find(matchKey);
        saveFav(loadFav().filter(f => f.id !== fav.id));
        if (fav.id && !String(fav.id).startsWith('local-')) {
          try { await db.entities.BibleFavorite.delete(fav.id); } catch {}
        }
        return { id: fav.id };
      }
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      const localEntry = { ...data, id: localId, _local: true };
      saveFav([...loadFav(), localEntry]);
      try { await db.entities.BibleFavorite.create(data); } catch {}
      try { await awardPoints(user.email, "verse_saved"); } catch {}
      return localEntry;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["favorites", user?.email] }),
  });

  const handleFavoriteToggle = (verseNum, text) => {
    if (!user) { db.auth.redirectToLogin(); return; }
    favoriteMutation.mutate({
      user_email: user.email,
      book: currentBook,
      chapter: currentChapter,
      start_verse: verseNum,
      text,
      title: `${currentBook} ${currentChapter}:${verseNum}`,
    });
  };

  const handleWordClick = (word) => setSelectedWord(word);

  // Quick toggle: one tap highlights yellow, second tap removes — no form needed
  const handleHighlight = (verseNum) => {
    if (!user) { db.auth.redirectToLogin(); return; }
    const verseText = verses[verseNum - 1];
    if (!verseText) return; // guard against stale verseNum
    const existing = userHighlights.find(
      h => h.book === currentBook && h.chapter === currentChapter && h.verse === verseNum
    );
    if (existing) {
      deleteHighlight.mutate(existing.id);
    } else {
      addHighlight.mutate({
        user_email: user.email,
        book: currentBook,
        chapter: currentChapter,
        verse: verseNum,
        text: verseText,
        color: "yellow",
        note: null,
      });
    }
  };

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
        return profiles?.[0] || null;
      } catch { return null; }
    },
    enabled: !!user?.email,
  });

  const postVerseMutation = useMutation({
    mutationFn: async () => {
      if (!postingVerse || !user || !postingVerseText) throw new Error("Missing data");
      const verseRef = `${currentBook} ${currentChapter}:${postingVerse}`;
      const authorName = myProfile?.display_name || user.full_name || "Anonymous";
      const authorAvatar = myProfile?.avatar_url || null;
      return db.entities.CommunityPost.create({
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
    },
    onSuccess: async () => {
      await awardPoints(user.email, "verse_post");
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts", user?.email] });
      setPostingVerse(null);
      setPostingVerseText(null);
      setPostCaption("");
    },
    onError: () => alert("Failed to post verse. Please try again."),
  });

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
            const isHighlighted = userHighlights.some(
              h => h.book === currentBook && h.chapter === currentChapter && h.verse === verseNum
            );
            const isFavorited = userFavorites.some(
              f => f.book === currentBook && f.chapter === currentChapter && f.start_verse === verseNum
            );
            const isWOJ = wojVerses.has(verseNum);
            const isTogglingHighlight = addHighlight.isPending || deleteHighlight.isPending;

            return (
              <motion.div
                key={verseNum}
                ref={el => { verseRefs.current[verseNum] = el; }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className={`flex items-start justify-between gap-3 p-2 rounded transition-colors ${
                  isHighlighted ? 'bg-yellow-300' : ''
                }`}>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedWord(verseNum === selectedWord ? null : `verse-${verseNum}`)}
                        className={`font-bold text-sm hover:opacity-70 transition-opacity cursor-pointer flex-shrink-0 ${
                          isHighlighted ? 'text-black' : 'text-accent'
                        }`}
                      >
                        {verseNum}
                      </button>
                      <p className={`font-body leading-relaxed text-sm ${
                        isHighlighted ? 'text-black' : isWOJ ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                      }`}>
                        {words.map((word, i) => (
                          <span
                            key={i}
                            onClick={() => handleWordClick(word.replace(/[,.:;!?]/g, ""))}
                            className={`cursor-pointer transition-colors ${
                              isHighlighted
                                ? 'hover:text-yellow-900'
                                : isWOJ
                                ? 'hover:text-red-800 dark:hover:text-red-300 hover:underline'
                                : 'hover:text-accent hover:underline'
                            }`}
                          >
                            {word}{" "}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleHighlight(verseNum)}
                      disabled={isTogglingHighlight}
                      className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                        isHighlighted
                          ? 'text-yellow-600 hover:text-yellow-800'
                          : 'text-muted-foreground hover:text-accent'
                      }`}
                      title={isHighlighted ? "Remove highlight" : "Highlight verse"}
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
                      {favoriteMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Bookmark className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
                      }
                    </button>
                    <button
                      onClick={() => { setPostingVerse(verseNum); setPostingVerseText(text); }}
                      className="p-1.5 text-muted-foreground hover:text-accent rounded hover:bg-secondary transition-colors"
                      title="Share verse"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
