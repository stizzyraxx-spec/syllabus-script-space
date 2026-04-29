import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Bookmark, Highlighter, X, Loader2, BookMarked, Heart, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import BibleViewer from "@/components/bible/BibleViewer";
import BibleSearch from "@/components/bible/BibleSearch";
import BibleFavorites from "@/components/bible/BibleFavorites";
import BibleHighlights from "@/components/bible/BibleHighlights";
import BibleJournal from "@/components/bible/BibleJournal";
import OriginalLanguageLookup from "@/components/bible/OriginalLanguageLookup";
import EtymologyLookup from "@/components/bible/EtymologyLookup";
import EntomologyLookup from "@/components/bible/EntomologyLookup";
import ConcordanceLookup from "@/components/bible/ConcordanceLookup";
import SignInPrompt from "@/components/shared/SignInPrompt";

const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

// Chapter counts per book (KJV)
const BOOK_CHAPTERS = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
  Ecclesiastes: 12, Isaiah: 66, Jeremiah: 52, Lamentations: 5, Ezekiel: 48,
  Daniel: 12, Hosea: 14, Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7,
  Nahum: 3, Habakkuk: 3, Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28, Romans: 16,
  "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6, Ephesians: 6,
  Philippians: 4, Colossians: 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, Titus: 3, Philemon: 1, Hebrews: 13,
  James: 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1,
  "3 John": 1, Jude: 1, Revelation: 22,
};

function randomBibleLocation() {
  const book = BOOKS[Math.floor(Math.random() * BOOKS.length)];
  const chapters = BOOK_CHAPTERS[book] ?? 1;
  const chapter = Math.floor(Math.random() * chapters) + 1;
  // verse count unknown until fetch — pick a number; viewer will clamp if needed
  const verse = Math.floor(Math.random() * 20) + 1;
  return { book, chapter, verse };
}

const INTERACTIVE_TABS = ["search", "favorites", "highlights", "journal", "original-language", "etymology", "entomology", "concordance"];

export default function Bible() {
  const [user, setUser] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Pick a random location on every fresh open (no URL params)
  const [randomLocation] = useState(() => {
    if (!searchParams.get("book") && !searchParams.get("chapter")) {
      return randomBibleLocation();
    }
    return null;
  });

  const [currentBook, setCurrentBook] = useState(
    searchParams.get("book") || randomLocation?.book || "John"
  );
  const [currentChapter, setCurrentChapter] = useState(
    parseInt(searchParams.get("chapter") || String(randomLocation?.chapter ?? 1))
  );
  const [initialVerse] = useState(randomLocation?.verse ?? null);

  const activeTab = searchParams.get("tab") || "viewer";
  const queryClient = useQueryClient();

  const setActiveTab = (tab) => {
    if (INTERACTIVE_TABS.includes(tab) && !user) {
      setShowSignIn(true);
      return;
    }
    setSearchParams((prev) => { prev.set("tab", tab); return prev; });
  };

  const handleBookChange = (book) => {
    setCurrentBook(book);
    setSearchParams((prev) => { prev.set("book", book); return prev; });
  };

  const handleChapterChange = (ch) => {
    setCurrentChapter(ch);
    setSearchParams((prev) => { prev.set("chapter", String(ch)); return prev; });
  };

  React.useEffect(() => {
    db.auth.me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showSignIn && (
          <SignInPrompt
            onClose={() => setShowSignIn(false)}
            message="Sign in to save verses, highlights, and search the Bible."
          />
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl font-bold text-foreground">King James Bible</h1>
            {user && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`p-2 rounded-lg transition-colors ${
                    activeTab === "favorites" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveTab("highlights")}
                  className={`p-2 rounded-lg transition-colors ${
                    activeTab === "highlights" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Highlighter className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Tab navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: "viewer", label: "Read" },
              { id: "search", label: "Search" },
              { id: "original-language", label: "Original Language" },
              { id: "etymology", label: "Etymology" },
              { id: "concordance", label: "Concordance" },
              { id: "favorites", label: "Saved" },
              { id: "highlights", label: "Highlights" },
              { id: "journal", label: "Journal" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-body text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "viewer" && (
            <BibleViewer
              key="viewer"
              user={user}
              books={BOOKS}
              currentBook={currentBook}
              onBookChange={handleBookChange}
              currentChapter={currentChapter}
              onChapterChange={handleChapterChange}
              initialVerse={initialVerse}
            />
          )}

          {activeTab === "search" && (
            <BibleSearch key="search" user={user} />
          )}

          {activeTab === "favorites" && (
            <BibleFavorites key="favorites" user={user} onSelectVerse={(book, ch) => {
              handleBookChange(book);
              handleChapterChange(ch);
              setActiveTab("viewer");
            }} />
          )}

          {activeTab === "highlights" && (
            <BibleHighlights key="highlights" user={user} />
          )}

          {activeTab === "journal" && (
            user ? (
              <BibleJournal key="journal" user={user} onClose={() => setActiveTab("viewer")} />
            ) : (
              <SignInPrompt
                onClose={() => setActiveTab("viewer")}
                message="Sign in to access your Bible journal."
              />
            )
          )}

          {activeTab === "original-language" && (
            <OriginalLanguageLookup key="original-language" />
          )}

          {activeTab === "etymology" && (
            <EtymologyLookup key="etymology" />
          )}

          {activeTab === "entomology" && (
            <EntomologyLookup key="entomology" />
          )}

          {activeTab === "concordance" && (
            <ConcordanceLookup key="concordance" />
          )}
          </AnimatePresence>
          </div>
          </div>
          );
          }