import React, { useState, useRef } from "react";
import { db } from "@/api/supabaseClient";
import { Search, Loader2, BookOpen, X } from "lucide-react";
import { motion } from "framer-motion";

export default function EtymologyLookup() {
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
      const res = await db.functions.invoke("getWordEtymology", {
        word: word.trim(),
      });
      if (!cancelledRef.current) setResults(res.data);
    } catch (error) {
      if (!cancelledRef.current) setResults({ error: "Error retrieving etymology data. Please try again." });
    }
    if (!cancelledRef.current) setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-foreground">Word Etymology</h2>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Discover the origin and historical evolution of biblical and spiritual words in English.
        </p>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter a word (e.g., 'gospel', 'blessing', 'salvation')..."
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
          className="bg-card rounded-xl border border-border p-6"
        >
          {results.error ? (
            <div className="text-red-500 font-body text-sm">{results.error}</div>
          ) : results.found ? (
            <div className="space-y-6">
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">English Word</p>
                <p className="font-display text-2xl font-bold text-foreground">{results.word}</p>
              </div>

              <div className="border-l-2 border-accent pl-4 py-2">
                <p className="font-body text-xs uppercase tracking-wider text-accent mb-2">Timeline</p>
                {results.timeline && results.timeline.map((period, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="font-body text-sm font-semibold text-foreground mb-1">{period.era}</p>
                    <p className="font-body text-sm text-foreground/80 mb-1">{period.form}</p>
                    <p className="font-body text-xs text-muted-foreground italic">{period.description}</p>
                  </div>
                ))}
              </div>

              {results.meaning && (
                <div className="bg-secondary/50 rounded p-4">
                  <p className="font-body text-sm font-semibold text-foreground mb-2">Modern Meaning:</p>
                  <p className="font-body text-sm text-foreground/80">{results.meaning}</p>
                </div>
              )}

              {results.biblicalContext && (
                <div className="bg-secondary/50 rounded p-4">
                  <p className="font-body text-sm font-semibold text-foreground mb-2">Biblical Context:</p>
                  <p className="font-body text-sm text-foreground/80">{results.biblicalContext}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground font-body text-sm">
              No etymology data found for "{word}". Try another word or check spelling.
            </div>
          )}

          <button
            onClick={() => { setResults(null); setWord(""); }}
            className="mt-6 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            Clear
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}