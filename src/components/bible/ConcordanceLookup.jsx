import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, BookOpen, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ConcordanceLookup() {
  const [word, setWord] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const cancelledRef = useRef(false);

  const handleCancel = () => { cancelledRef.current = true; setLoading(false); };

  const handleSearch = async () => {
    if (!word.trim()) return;
    cancelledRef.current = false;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("getBibleConcordance", {
        word: word.trim(),
      });
      if (!cancelledRef.current) setResults(res.data);
    } catch (error) {
      if (!cancelledRef.current) setResults({ error: "Error retrieving concordance data. Please try again." });
    }
    if (!cancelledRef.current) setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-foreground">Bible Concordance</h2>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Search for a word and find every occurrence in the Bible with surrounding context.
        </p>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for a word (e.g., 'love', 'faith', 'kingdom')..."
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
          />
          {loading ? (
            <button onClick={handleCancel} className="px-4 py-3 rounded-lg bg-muted text-muted-foreground font-body text-sm font-semibold hover:bg-destructive hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap">
              <X className="w-4 h-4" /> Cancel
            </button>
          ) : (
            <button onClick={handleSearch} disabled={!word.trim()} className="px-4 py-3 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
              <Search className="w-4 h-4" /> Search
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {results.error ? (
            <div className="bg-card rounded-xl border border-border p-6 text-red-500 font-body text-sm">
              {results.error}
            </div>
          ) : results.occurrences && results.occurrences.length > 0 ? (
            <>
              <div className="bg-card rounded-xl border border-border p-4 sticky top-20 z-10">
                <p className="font-body text-sm text-muted-foreground">
                  <strong className="text-accent">{results.occurrences.length}</strong> occurrence{results.occurrences.length !== 1 ? "s" : ""} of <strong className="text-foreground">"{word}"</strong> found
                </p>
              </div>

              <div className="space-y-3">
                {results.occurrences.map((occurrence, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-xl border border-border p-5 hover:border-accent/50 transition-colors"
                  >
                    {/* Verse Reference */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-display text-lg font-bold text-accent">
                        {occurrence.book} {occurrence.chapter}:{occurrence.verse}
                      </p>
                      <span className="text-xs text-muted-foreground font-semibold">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Verse Text with highlighted word */}
                    <p className="font-body text-sm text-foreground leading-relaxed">
                      {occurrence.beforeContext}
                      <span className="bg-accent/20 text-accent font-semibold px-1 rounded">
                        {occurrence.word}
                      </span>
                      {occurrence.afterContext}
                    </p>

                    {/* Full verse for context */}
                    <p className="text-xs text-muted-foreground mt-3 italic pl-3 border-l-2 border-muted">
                      Full: {occurrence.fullText}
                    </p>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 text-muted-foreground font-body text-sm">
              No occurrences found for "{word}". Try a different word or check spelling.
            </div>
          )}

          <button
            onClick={() => { setResults(null); setWord(""); }}
            className="w-full px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors font-body text-sm font-semibold"
          >
            Clear Results
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}