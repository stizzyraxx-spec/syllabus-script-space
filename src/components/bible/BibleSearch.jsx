import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";

export default function BibleSearch({ user }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const cancelledRef = useRef(false);

  const handleCancel = () => {
    cancelledRef.current = true;
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    cancelledRef.current = false;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("searchBibleText", {
        query: query.trim(),
      });
      if (!cancelledRef.current) setResults(res.data.results || "No results found");
    } catch (error) {
      if (!cancelledRef.current) setResults("Error searching. Please try again.");
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
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 space-y-4"
        >
          <h3 className="font-display font-bold text-foreground">Relevant Scripture</h3>
          <div className="font-body text-sm text-foreground/90 leading-relaxed space-y-4 whitespace-pre-wrap">
            {results}
          </div>
          <button
            onClick={() => setResults(null)}
            className="mt-4 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            Clear
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}