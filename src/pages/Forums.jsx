import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, MessageSquare, Rss, BookMarked, Sparkles, Gamepad2, Newspaper } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { AnimatePresence } from "framer-motion";
import SignInPrompt from "../components/shared/SignInPrompt";
import ForumPostCard from "../components/forums/ForumPostCard";
import ForumPostDetail from "../components/forums/ForumPostDetail";
import NewPostForm from "../components/forums/NewPostForm";
import FeedTab from "../components/forums/FeedTab";
import BibleStudyHelper from "../components/forums/BibleStudyHelper";
import DidYouKnow from "../components/forums/DidYouKnow";
import NewPostBanner from "../components/shared/NewPostBanner";
import CurrentEventsTab from "../components/forums/CurrentEventsTab";
import GamesHub from "../components/forums/GamesHub";

const categories = [
  { value: "all", label: "All", icon: "💬" },
  { value: "general", label: "General Discussion", icon: "💬" },
  { value: "bible_study", label: "Bible Study", icon: "📖" },
  { value: "justice_ethics", label: "Justice & Ethics", icon: "⚖️" },
  { value: "testimonies", label: "Personal Testimonies", icon: "✨" },
];

export default function Forums() {
  const [user, setUser] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "forums";
  const activeCategory = searchParams.get("category") || "all";
  const selectedPostId = searchParams.get("post") || null;

  const setActiveTab = (t) => {
    setSearchParams((prev) => { prev.set("tab", t); prev.delete("post"); return prev; });
  };

  const setActiveCategory = (cat) => {
    setSearchParams((prev) => { prev.set("category", cat); return prev; });
  };

  const setSelectedPost = (post) => {
    if (post) {
      setSearchParams((prev) => { prev.set("post", post.id); return prev; });
    } else {
      setSearchParams((prev) => { prev.delete("post"); return prev; });
    }
  };

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostInitialData, setNewPostInitialData] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
      }
    });
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ["forum-posts"],
    queryFn: () => base44.entities.ForumPost.list("-created_date", 50),
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user.email }),
    select: (data) => data[0],
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setShowNewPost(false);
    },
  });

  const handleCreatePost = ({ isAnonymous, ...formData }) => {
    const authorName = isAnonymous ? "Anonymous" : (myProfile?.display_name || user?.full_name || "Anonymous");
    const authorAvatar = isAnonymous ? null : (myProfile?.avatar_url || null);
    createMutation.mutate({
      ...formData,
      author_email: isAnonymous ? null : user?.email,
      author_name: authorName,
      author_avatar: authorAvatar,
      reply_count: 0,
    });
    setNewPostInitialData(null);
  };

  const handleDiscussEvent = (event) => {
    setActiveTab("forums");
    setNewPostInitialData({
      title: event.headline,
      content: `${event.summary}\n\n📖 ${event.verse_reference}: "${event.verse}"\n\n${event.biblical_perspective}\n\n---\nWhat are your thoughts on this event from a Biblical perspective?`,
      category: "justice_ethics",
      attachedEvent: event.headline,
    });
    setShowNewPost(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  // Keep selectedPost in sync with latest data from server
  const liveSelectedPost = selectedPostId
    ? posts.find((p) => p.id === selectedPostId)
    : null;

  if (liveSelectedPost) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-background min-h-screen">
        <div className="max-w-3xl mx-auto">
          <ForumPostDetail
            post={liveSelectedPost}
            user={user}
            onBack={() => setSearchParams((prev) => { prev.delete("post"); return prev; })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NewPostBanner />
      {/* Hero */}
      <div className="bg-primary text-primary-foreground pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-accent" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold">
              Explore
            </h1>
          </div>
          <p className="font-body text-primary-foreground/70 text-sm mt-1">
            Forums, games, Bible study, and more — all in one place
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main tabs */}
        <div className="flex border-b border-border mb-8 overflow-x-auto scrollbar-none">
          {[
            { id: "forums", label: "Forums", Icon: MessageSquare },
            { id: "events", label: "Current Events", Icon: Newspaper },
            { id: "feed", label: "Feed", Icon: Rss },
            { id: "bible", label: "Bible Study", Icon: BookMarked },
            { id: "didyouknow", label: "Did You Know?", Icon: Sparkles },
            { id: "games", label: "Games", Icon: Gamepad2 },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setShowNewPost(false); }}
              className={`flex items-center gap-2 px-4 py-3 font-body text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Forums Tab */}
         {activeTab === "forums" && (
           <>
             {/* Category filter */}
             <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.value
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-border"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => { if (!user) { setShowSignIn(true); return; } setShowNewPost(true); }}
              className="flex items-center gap-2 px-5 py-2.5 mb-6 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Start Discussion
            </button>

            <AnimatePresence>
              {showNewPost && (
                <NewPostForm
                  onSubmit={handleCreatePost}
                  onCancel={() => { setShowNewPost(false); setNewPostInitialData(null); }}
                  isPending={createMutation.isPending}
                  initialData={newPostInitialData}
                  userProfile={myProfile}
                  user={user}
                />
              )}
            </AnimatePresence>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-body text-muted-foreground text-sm mb-1">No discussions yet in this category</p>
                <p className="font-body text-muted-foreground/60 text-xs">Be the first to start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    onSelect={setSelectedPost}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Current Events Tab */}
        {activeTab === "events" && <CurrentEventsTab onDiscuss={handleDiscussEvent} />}

        {/* Feed Tab */}
        {activeTab === "feed" && <FeedTab user={user} searchParams={searchParams} setSearchParams={setSearchParams} />}

        {/* Bible Study Helper Tab */}
        {activeTab === "bible" && <BibleStudyHelper />}

        {/* Did You Know Tab */}
        {activeTab === "didyouknow" && <DidYouKnow />}

        {/* Games Hub */}
        {activeTab === "games" && (
          user
            ? <GamesHub user={user} searchParams={searchParams} setSearchParams={setSearchParams} />
            : <div className="py-16 text-center">
                <p className="font-body text-muted-foreground text-sm mb-4">Sign in to play games and track your scores.</p>
                <button
                  onClick={() => setShowSignIn(true)}
                  className="bg-accent text-accent-foreground font-body font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Sign In to Play
                </button>
              </div>
        )}
      </div>

      <AnimatePresence>
        {showSignIn && (
          <SignInPrompt
            onClose={() => setShowSignIn(false)}
            message="Sign in or create a free account to participate in discussions, play games, and more."
          />
        )}
      </AnimatePresence>
    </div>
  );
}