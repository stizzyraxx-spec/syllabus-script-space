import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Feed from "../components/social/Feed";
import ProfileView from "../components/social/ProfileView";
import MessagesView from "../components/social/MessagesView";
import CreatePost from "../components/social/CreatePost";
import CompleteProfileModal from "../components/shared/CompleteProfileModal";
import PeopleSearch from "../components/forums/PeopleSearch";
import BiblePlansSection from "../components/social/BiblePlansSection";
import MultiChannelGroupChat from "../components/forums/MultiChannelGroupChat";
import Prayer from "../pages/Prayer";
import { Home as HomeIcon, MessageCircle, PlusSquare, User, Users, BookOpen, MessageSquare, Heart } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function Social() {
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "feed";
  const [viewingProfile, setViewingProfile] = useState(null);

  const setTab = (t) => {
    setSearchParams((prev) => { prev.set("tab", t); return prev; });
  };
  const [showCreate, setShowCreate] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  useEffect(() => {
    db.auth.isAuthenticated().then(async (isAuthed) => {
      setAuthed(isAuthed);
      if (isAuthed) {
        const me = await db.auth.me();
        setUser(me);

        // Only show the "complete profile" prompt if the user has neither
        // saved a profile (DB or local cache) nor explicitly skipped it.
        const localProfile = (() => {
          try { return localStorage.getItem(`tcom-profile-${me.email}`); } catch { return null; }
        })();
        const skipped = (() => {
          try { return localStorage.getItem(`tcom-profile-skipped-${me.email}`); } catch { return null; }
        })();

        if (!localProfile && !skipped) {
          // Try DB; if the query throws (table missing) treat it as "no profile yet"
          let dbProfiles = [];
          try { dbProfiles = await db.entities.UserProfile.filter({ user_email: me.email }); } catch {}
          if (dbProfiles.length === 0) {
            setShowCompleteProfile(true);
          }
        }

        // Check if we should navigate to a specific profile (from notifications)
        const profileEmail = sessionStorage.getItem("viewProfileEmail");
        if (profileEmail) {
          setViewingProfile(profileEmail);
          sessionStorage.removeItem("viewProfileEmail");
        }
      }
    });
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <User className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Sign In to Access Community
          </h2>
          <p className="font-body text-muted-foreground text-sm mb-6">
            Connect with believers, share reflections, and follow others on their faith journey.
          </p>
          <button
            onClick={() => db.auth.redirectToLogin()}
            className="bg-accent text-accent-foreground font-body font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Page Header */}
      <div className="bg-primary text-primary-foreground pt-16 pb-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Community</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-accent text-accent-foreground font-body text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
          >
            <PlusSquare className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Tabs */}
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          {[
            { id: "feed", label: "Feed", TabIcon: HomeIcon },
            { id: "chat", label: "Group Chat", TabIcon: MessageSquare },
            { id: "plans", label: "Bible Plans", TabIcon: BookOpen },
            { id: "prayer", label: "Prayer Wall", TabIcon: Heart },
            { id: "messages", label: "Messages", TabIcon: MessageCircle },
            { id: "people", label: "People", TabIcon: Users },
            { id: "profile", label: "My Profile", TabIcon: User },
          ].map(({ id, label, TabIcon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setViewingProfile(null); }}
              className={`flex items-center gap-2 px-4 py-3 font-body text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
           {viewingProfile ? (
             <ProfileView
               key="profile-view"
               profileEmail={viewingProfile}
               currentUser={user}
               onBack={() => setViewingProfile(null)}
             />
           ) : tab === "feed" ? (
             <Feed key="feed" currentUser={user} onViewProfile={setViewingProfile} />
           ) : tab === "chat" ? (
             <MultiChannelGroupChat key="chat" currentUser={user} />
           ) : tab === "plans" ? (
             <BiblePlansSection key="plans" currentUser={user} />
           ) : tab === "prayer" ? (
             <Prayer key="prayer" />
           ) : tab === "messages" ? (
             <MessagesView key="messages" currentUser={user} onViewProfile={setViewingProfile} />
           ) : tab === "people" ? (
             <PeopleSearch key="people" currentUser={user} onViewProfile={setViewingProfile} />
           ) : (
             <ProfileView key="my-profile" profileEmail={user?.email} currentUser={user} onBack={null} />
           )}
         </AnimatePresence>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreatePost currentUser={user} onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>

      {/* Complete Profile Modal for new users */}
      <AnimatePresence>
        {showCompleteProfile && user && (
          <CompleteProfileModal
            currentUser={user}
            onClose={() => setShowCompleteProfile(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}