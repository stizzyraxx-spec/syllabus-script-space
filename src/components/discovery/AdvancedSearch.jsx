import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Save, Loader2, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdvancedSearch({ userProfile, user }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    contentType: "all",
    author: "",
    minLikes: 0,
    sortBy: "relevance",
  });
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);

  const { data: posts = [] } = useQuery({
    queryKey: ["all-posts-search"],
    queryFn: () => base44.entities.CommunityPost.list(),
  });

  const { data: forums = [] } = useQuery({
    queryKey: ["all-forum-posts-search"],
    queryFn: () => base44.entities.ForumPost.list(),
  });

  const performSearch = () => {
    setSearching(true);
    const queryLower = query.toLowerCase();
    let searchResults = [];

    if (filters.contentType === "all" || filters.contentType === "post") {
      searchResults = posts.filter((p) => {
        const matchesQuery =
          p.caption?.toLowerCase().includes(queryLower) ||
          p.author_name?.toLowerCase().includes(queryLower);
        const matchesAuthor = !filters.author || p.author_name?.includes(filters.author);
        const matchesLikes = !filters.minLikes || (p.likes || 0) >= filters.minLikes;
        return matchesQuery && matchesAuthor && matchesLikes;
      });
    }

    if (filters.contentType === "all" || filters.contentType === "forum") {
      const forumResults = forums.filter((p) => {
        const matchesQuery =
          p.title?.toLowerCase().includes(queryLower) ||
          p.content?.toLowerCase().includes(queryLower) ||
          p.author_name?.toLowerCase().includes(queryLower);
        const matchesAuthor = !filters.author || p.author_name?.includes(filters.author);
        return matchesQuery && matchesAuthor;
      });
      searchResults = [...searchResults, ...forumResults];
    }

    // Sort results
    if (filters.sortBy === "recent") {
      searchResults.sort(
        (a, b) => new Date(b.created_date) - new Date(a.created_date)
      );
    } else if (filters.sortBy === "popular") {
      searchResults.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setResults(searchResults);
    setSearching(false);

    // Update search history
    if (user?.email && query) {
      const newHistory = [query, ...(userProfile?.search_history || [])].slice(0, 10);
      base44.entities.UserProfile.update(userProfile.id, {
        search_history: newHistory,
      }).catch(console.error);
    }
  };

  const saveSearchMutation = useMutation({
    mutationFn: () =>
      base44.entities.UserProfile.update(userProfile.id, {
        saved_searches: [...(userProfile?.saved_searches || []), searchName],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setShowSaveSearch(false);
      setSearchName("");
    },
  });

  const deleteSearchMutation = useMutation({
    mutationFn: (searchToDelete) =>
      base44.entities.UserProfile.update(userProfile.id, {
        saved_searches: (userProfile?.saved_searches || []).filter(
          (s) => s !== searchToDelete
        ),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && performSearch()}
              placeholder="Search posts, forums, people..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <button
            onClick={performSearch}
            disabled={!query || searching}
            className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {/* Search history & saved searches */}
        <div className="flex flex-wrap gap-2">
          {(userProfile?.search_history || []).slice(0, 3).map((search) => (
            <button
              key={search}
              onClick={() => {
                setQuery(search);
                setFilters({ contentType: "all", author: "", minLikes: 0, sortBy: "relevance" });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors font-body text-xs"
            >
              <Clock className="w-3 h-3" />
              {search}
            </button>
          ))}
          {query && (
            <button
              onClick={() => {
                setShowSaveSearch(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-accent text-accent hover:bg-accent/10 transition-colors font-body text-xs"
            >
              <Save className="w-3 h-3" />
              Save Search
            </button>
          )}
        </div>
      </div>

      {/* Saved searches */}
      {(userProfile?.saved_searches || []).length > 0 && (
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Saved Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {userProfile.saved_searches.map((search) => (
              <div
                key={search}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border"
              >
                <button
                  onClick={() => {
                    setQuery(search);
                    performSearch();
                  }}
                  className="font-body text-xs text-foreground hover:text-accent transition-colors"
                >
                  {search}
                </button>
                <button
                  onClick={() => deleteSearchMutation.mutate(search)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <motion.div
        animate={{ height: showFilters ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Content Type
            </label>
            <select
              value={filters.contentType}
              onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Content</option>
              <option value="post">Posts Only</option>
              <option value="forum">Forum Only</option>
            </select>
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="relevance">Relevance</option>
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Author
            </label>
            <input
              type="text"
              value={filters.author}
              onChange={(e) => setFilters({ ...filters, author: e.target.value })}
              placeholder="Filter by author name"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Minimum Likes: {filters.minLikes}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minLikes}
              onChange={(e) => setFilters({ ...filters, minLikes: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <button
            onClick={performSearch}
            className="w-full px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="text-accent font-body text-sm font-semibold hover:text-accent/80 transition-colors"
      >
        {showFilters ? "Hide" : "Show"} Filters
      </button>

      {/* Save search modal */}
      <AnimatePresence>
        {showSaveSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowSaveSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border p-4 w-full max-w-sm"
            >
              <h4 className="font-display font-bold text-foreground mb-3">Save Search</h4>
              <input
                autoFocus
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Give this search a name..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveSearch(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border font-body text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveSearchMutation.mutate()}
                  disabled={!searchName || saveSearchMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {saveSearchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p className="font-body text-sm text-muted-foreground mb-3">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-3 rounded-lg border border-border bg-card hover:border-accent/30 transition-colors cursor-pointer"
              >
                <p className="font-body text-xs text-muted-foreground mb-1">
                  {result.author_name || "Anonymous"}
                </p>
                <p className="font-body text-sm text-foreground line-clamp-2">
                  {result.caption || result.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}