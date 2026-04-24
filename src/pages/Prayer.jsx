import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HandHeart, Plus, X, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PrayerCard from "@/components/prayer/PrayerCard";
import NewPrayerForm from "@/components/prayer/NewPrayerForm";
import PrayerJournalView from "@/components/prayer/PrayerJournalView";
import SignInPrompt from "@/components/shared/SignInPrompt";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "health", label: "🩺 Health" },
  { value: "family", label: "👨‍👩‍👧 Family" },
  { value: "finances", label: "💼 Finances" },
  { value: "guidance", label: "🧭 Guidance" },
  { value: "salvation", label: "✝️ Salvation" },
  { value: "gratitude", label: "🙏 Gratitude" },
  { value: "other", label: "💬 Other" },
];

export default function Prayer() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("wall");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
    });
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["prayer-requests"],
    queryFn: () => base44.entities.PrayerRequest.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PrayerRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
      setShowForm(false);
    },
  });

  const prayMutation = useMutation({
    mutationFn: async (request) => {
      const alreadyPrayed = request.prayed_by?.includes(user.email);
      const newPrayedBy = alreadyPrayed
        ? request.prayed_by.filter((e) => e !== user.email)
        : [...(request.prayed_by || []), user.email];
      return base44.entities.PrayerRequest.update(request.id, {
        prayer_count: newPrayedBy.length,
        prayed_by: newPrayedBy,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prayer-requests"] }),
  });

  const handlePray = (request) => {
    if (!user) { setShowSignIn(true); return; }
    prayMutation.mutate(request);
  };

  const handleNewRequest = (formData) => {
    createMutation.mutate({
      ...formData,
      author_email: formData.is_anonymous ? null : user?.email,
      author_name: formData.is_anonymous ? "Anonymous" : (user?.full_name || "Anonymous"),
    });
  };

  const filtered = activeCategory === "all"
    ? requests
    : requests.filter((r) => r.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showSignIn && (
          <SignInPrompt
            onClose={() => setShowSignIn(false)}
            message="Sign in to post prayer requests, track your journal, and show support for others."
          />
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="bg-primary text-primary-foreground pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <HandHeart className="w-6 h-6 text-accent" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Prayer</h1>
          </div>
          <p className="font-body text-primary-foreground/70 text-sm mt-1">
            Pray with the community and track your spiritual journey privately.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("wall")}
            className={`px-4 py-3 font-body text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "wall"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <HandHeart className="w-4 h-4 inline mr-1.5" /> Prayer Wall
          </button>
          <button
            onClick={() => { if (!user) { setShowSignIn(true); return; } setActiveTab("journal"); }}
            className={`px-4 py-3 font-body text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "journal"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-1.5" /> My Journal
          </button>
        </div>
        {activeTab === "wall" && (
        <>
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg font-body text-sm font-medium transition-all whitespace-nowrap border ${
                activeCategory === cat.value
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* New Request Button */}
        <button
          onClick={() => { if (!user) { setShowSignIn(true); return; } setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 mb-6 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Prayer Request
        </button>

        <AnimatePresence>
          {showForm && (
            <NewPrayerForm
              onSubmit={handleNewRequest}
              onCancel={() => setShowForm(false)}
              isPending={createMutation.isPending}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <HandHeart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-body text-muted-foreground text-sm">No prayer requests yet. Be the first to share.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => (
              <PrayerCard
                key={req.id}
                request={req}
                user={user}
                onPray={handlePray}
              />
            ))}
          </div>
        )}
        </>
        )}

        {activeTab === "journal" && user && (
          <PrayerJournalView userEmail={user.email} />
        )}
      </div>
    </div>
  );
}