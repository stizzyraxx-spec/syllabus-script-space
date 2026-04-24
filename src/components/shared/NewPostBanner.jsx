import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";

export default function NewPostBanner({ onOpenPost }) {
  const [notification, setNotification] = useState(null);
  const seenIds = useRef(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    // Pre-seed existing post IDs so we don't show banners for old posts
    base44.entities.ForumPost.list("-created_date", 50).then((posts) => {
      posts.forEach((p) => seenIds.current.add(p.id));
    });

    const unsubscribe = base44.entities.ForumPost.subscribe((event) => {
      if (event.type === "create" && !seenIds.current.has(event.id)) {
        seenIds.current.add(event.id);
        const post = event.data;
        setNotification({ id: event.id, title: post?.title || "New discussion", post });
        // Auto-dismiss after 6 seconds
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setNotification(null), 6000);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timerRef.current);
    };
  }, []);

  const dismiss = () => {
    clearTimeout(timerRef.current);
    setNotification(null);
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto max-w-md w-full bg-primary text-primary-foreground rounded-xl shadow-xl border border-accent/30 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs text-primary-foreground/70 font-semibold uppercase tracking-wider">New Discussion</p>
              <p className="font-body text-sm font-semibold text-primary-foreground truncate">{notification.title}</p>
            </div>
            <button
              onClick={dismiss}
              className="text-primary-foreground/50 hover:text-primary-foreground transition-colors flex-shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}