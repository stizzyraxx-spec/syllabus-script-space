import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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

const INTERACTIVE_TABS = ["search", "favorites", "highlights", "journal", "original-language", "etymology", "entomology", "concordance"];

export default function Bible() {
  const [user, setUser] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentBook, setCurrentBook] = useState(searchParams.get("book") || "John");
  const [currentChapter, setCurrentChapter] = useState(parseInt(searchParams.get("chapter") || "1"));
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
    base44.auth.me()
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
              { id: "entomology", label: "Insects" },
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