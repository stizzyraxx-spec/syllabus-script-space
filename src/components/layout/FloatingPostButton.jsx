import React, { useState, useEffect, useRef } from "react";
import { Plus, X, PenLine, NotebookPen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CreatePost from "@/components/social/CreatePost";
import NotebookModal from "@/components/notebook/NotebookModal";

export default function FloatingPostButton() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [activeSection, setActiveSection] = useState("notes");
  const [sections, setSections] = useState({ notes: "", reflections: "", prayer: "", scripture: "" });
  const [profileId, setProfileId] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveTimer = React.useRef(null);

  const SECTIONS = [
    { id: "notes", label: "📝 Notes", placeholder: "Write your general notes here..." },
    { id: "reflections", label: "💭 Reflections", placeholder: "Personal reflections and thoughts..." },
    { id: "prayer", label: "🙏 Prayer Points", placeholder: "Write your prayer requests and praises..." },
    { id: "scripture", label: "📖 Scripture", placeholder: "Favorite verses and passages..." },
  ];
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        // Load notebook from profile
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (profiles && profiles.length > 0) {
          setProfileId(profiles[0].id);
          try {
            const saved = JSON.parse(profiles[0].notebook || "{}");
            setSections(prev => ({ ...prev, ...saved }));
          } catch {
            // legacy plain text — put into notes
            setSections(prev => ({ ...prev, notes: profiles[0].notebook || "" }));
          }
        }
      }
    });
  }, []);

  if (!user) return null;

  const handlePost = () => {
    setOpen(false);
    setShowPost(true);
  };

  const handleNotebook = () => {
    setOpen(false);
    setShowNotebook(true);
  };

  const saveSection = (sectionId, val) => {
    const updated = { ...sections, [sectionId]: val };
    setSections(updated);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const jsonVal = JSON.stringify(updated);
      if (profileId) {
        await base44.entities.UserProfile.update(profileId, { notebook: jsonVal });
      } else if (user) {
        const created = await base44.entities.UserProfile.create({ user_email: user.email, notebook: jsonVal });
        setProfileId(created.id);
      }
      setSaving(false);
    }, 1000);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu items */}
      <AnimatePresence>
        {open && (
          <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="font-body text-xs font-semibold bg-card border border-border text-foreground px-3 py-1.5 rounded-full shadow-md">My Notebook</span>
              <button
                onClick={handleNotebook}
                className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition-colors"
              >
                <NotebookPen className="w-5 h-5" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ delay: 0 }}
              className="flex items-center gap-2"
            >
              <span className="font-body text-xs font-semibold bg-card border border-border text-foreground px-3 py-1.5 rounded-full shadow-md">New Post</span>
              <button
                onClick={handlePost}
                className="w-12 h-12 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center shadow-lg transition-colors"
              >
                <PenLine className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg hover:bg-accent/90 transition-colors"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showPost && (
          <CreatePost currentUser={user} onClose={() => setShowPost(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotebook && user && (
          <NotebookModal userEmail={user.email} onClose={() => setShowNotebook(false)} />
        )}
      </AnimatePresence>
    </>
  );
}