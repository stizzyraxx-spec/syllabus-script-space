import React, { useState, useRef } from "react";
import { db } from "@/api/supabaseClient";
import { Search, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";

const SUGGESTIONS = [
  "forgiveness", "love your enemies", "pray", "God is love", "peace I leave with you",
  "fruit of the Spirit", "the way the truth", "rest for your soul",
  "John 3:16", "Psalm 23", "Romans 8:28", "Philippians 4:13", "Matthew 6:33",
];

export default function BibleSearch({ user }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const cancelledRef = useRef(false);

  const handleCancel = () => {
    cancelledRef.current = true;
    setLoading(false);
  };

  const runSearch = async (term) => {
    const q = (term ?? query).trim();
    if (!q) return;
    cancelledRef.current = false;
    setLoading(true);
    try {
      const res = await db.functions.invoke("searchBibleText", { query: q });
      if (!cancelledRef.current) setResults(res.data ?? { results: [], count: 0 });
    } catch (error) {
      if (!cancelledRef.current) setResults({ error: "Error searching. Please try again." });
    }
    if (!cancelledRef.current) setLoading(false);
  };

  const handleSearch = () => runSearch();
  const handleChip = (s) => { setQuery(s); runSearch(s); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Explore Scripture</h2>
        <p className="font-body text-sm text-muted-foreground mb-4">Ask any question or topic to discover relevant Bible passages and deeper understanding from the King James Bible.</p>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ask a question or describe what you want to understand (e.g., 'What does the Bible say about forgiveness?')..."
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
          />
          {loading ? (
            <button
              onClick={handleCancel}
              className="px-4 py-3 rounded-lg bg-muted text-muted-foreground font-body text-sm font-semibold hover:bg-destructive hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          ) : (
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="px-4 py-3 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          )}
        </div>

        {/* Suggested searches */}
        <div className="mt-4">
          <p className="font-body text-xs text-muted-foreground mb-2">Try a topic, phrase, or reference:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleChip(s)}
                className="px-2.5 py-1 text-xs font-body rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-foreground">Relevant Scripture</h3>
            {Array.isArray(results.results) && results.results.length > 0 && (
              <span className="font-body text-xs text-muted-foreground">
                Showing {results.count}{results.total && results.total > results.count ? ` of ${results.total}` : ''} {results.mode === 'reference' ? 'verses' : 'matches'}
              </span>
            )}
          </div>

          {results.error ? (
            <p className="font-body text-sm text-destructive">{results.error}</p>
          ) : !Array.isArray(results.results) || results.results.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">No verses found for "{query}".</p>
          ) : (
            <div className="space-y-3">
              {results.results.map((v, i) => (
                <div key={`${v.book}-${v.chapter}-${v.verse}-${i}`} className="border-l-2 border-accent/50 pl-3">
                  <p className="font-body text-xs font-semibold text-accent mb-0.5">
                    {v.book} {v.chapter}:{v.verse}
                  </p>
                  <p className="font-body text-sm text-foreground/90 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setResults(null)}
            className="mt-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            Clear
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}