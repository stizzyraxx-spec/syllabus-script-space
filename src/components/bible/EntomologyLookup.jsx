import React, { useState, useRef } from "react";
import { db } from "@/api/supabaseClient";
import { Search, Loader2, Bug, X } from "lucide-react";
import { motion } from "framer-motion";

export default function EntomologyLookup() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const cancelledRef = useRef(false);

  const handleCancel = () => { cancelledRef.current = true; setLoading(false); };

  const handleSearch = async () => {
    if (!query.trim()) return;
    cancelledRef.current = false;
    setLoading(true);
    try {
      const res = await db.functions.invoke("getBibleInsects", {
        query: query.trim(),
      });
      if (!cancelledRef.current) setResults(res.data);
    } catch (error) {
      if (!cancelledRef.current) setResults({ error: "Error retrieving insect data. Please try again." });
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
          <Bug className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-foreground">Insects in the Bible</h2>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Explore insects and creatures mentioned in Scripture and their biblical significance.
        </p>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search insects (e.g., 'locust', 'ant', 'bee', 'worm')..."
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
          />
          {loading ? (
            <button onClick={handleCancel} className="px-4 py-3 rounded-lg bg-muted text-muted-foreground font-body text-sm font-semibold hover:bg-destructive hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap">
              <X className="w-4 h-4" /> Cancel
            </button>
          ) : (
            <button onClick={handleSearch} disabled={!query.trim()} className="px-4 py-3 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
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
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{results.emoji}</span>
                  <div>
                    <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Insect</p>
                    <p className="font-display text-2xl font-bold text-foreground">{results.name}</p>
                  </div>
                </div>
              </div>

              {results.scientificName && (
                <div className="text-muted-foreground font-body text-sm italic">
                  <strong>Scientific Name:</strong> {results.scientificName}
                </div>
              )}

              {results.description && (
                <div className="bg-secondary/50 rounded p-4">
                  <p className="font-body text-sm font-semibold text-foreground mb-2">Description:</p>
                  <p className="font-body text-sm text-foreground/80">{results.description}</p>
                </div>
              )}

              {results.biblicalReferences && results.biblicalReferences.length > 0 && (
                <div className="border-l-2 border-accent pl-4">
                  <p className="font-body text-sm font-semibold text-foreground mb-3">Biblical References:</p>
                  <ul className="space-y-2">
                    {results.biblicalReferences.map((ref, idx) => (
                      <li key={idx} className="font-body text-sm text-foreground/90">
                        <strong>{ref.verse}</strong> - {ref.context}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.spiritualSignificance && (
                <div className="bg-secondary/50 rounded p-4">
                  <p className="font-body text-sm font-semibold text-foreground mb-2">Spiritual Significance:</p>
                  <p className="font-body text-sm text-foreground/80">{results.spiritualSignificance}</p>
                </div>
              )}

              {results.symbolism && (
                <div className="bg-secondary/50 rounded p-4">
                  <p className="font-body text-sm font-semibold text-foreground mb-2">Symbolism in Scripture:</p>
                  <p className="font-body text-sm text-foreground/80">{results.symbolism}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground font-body text-sm">
              No results found for "{query}". Try searching for common biblical insects like locust, ant, bee, or fly.
            </div>
          )}

          <button
            onClick={() => { setResults(null); setQuery(""); }}
            className="mt-6 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            Clear
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}