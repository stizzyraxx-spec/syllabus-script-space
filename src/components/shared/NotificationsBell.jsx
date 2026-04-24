import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, X, UserPlus, MessageCircle, Heart, AtSign, Zap, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_ICON = {
  follow: UserPlus,
  comment: MessageCircle,
  reply: AtSign,
  like: Heart,
  creator: Zap,
  verse: BookOpen,
};

export default function NotificationsBell({ currentUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", currentUser?.email],
    queryFn: () =>
      base44.entities.Notification.filter(
        { recipient_email: currentUser.email },
        "-created_date",
        30
      ),
    enabled: !!currentUser?.email,
    refetchInterval: 20000,
  });

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => base44.entities.Notification.update(n.id, { read: true }))
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", currentUser?.email] }),
  });

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unread > 0) markAllRead.mutate();
  };

  const handleNotificationTap = (n) => {
    setOpen(false);
    if (n.type === "follow" && n.actor_email) {
      sessionStorage.setItem("viewProfileEmail", n.actor_email);
      navigate("/community");
    } else if (n.link_path) {
      navigate(n.link_path);
    }
  };

  const handleActorClick = (e, n) => {
    e.stopPropagation();
    if (n.actor_email) {
      setOpen(false);
      sessionStorage.setItem("viewProfileEmail", n.actor_email);
      navigate("/community");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-1.5 text-primary-foreground/70 hover:text-accent transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed sm:absolute right-0 sm:right-0 top-14 sm:top-full sm:mt-2 
                       left-0 sm:left-auto
                       w-full sm:w-96 
                       bg-card border border-border rounded-none sm:rounded-xl shadow-2xl z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card sticky top-0">
              <div className="flex items-center gap-2">
                <span className="font-body text-sm font-semibold text-foreground">Notifications</span>
                {unread > 0 && (
                  <span className="font-body text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{unread} new</span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto divide-y divide-border" style={{ maxHeight: "min(70vh, 480px)" }}>
              {notifications.length === 0 ? (
                <p className="font-body text-xs text-muted-foreground text-center py-12">
                  No notifications yet
                </p>
              ) : (
                notifications.map((n) => {
                  const Icon = TYPE_ICON[n.type] || Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationTap(n)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3.5 hover:bg-secondary/60 transition-colors active:bg-secondary ${
                        !n.read ? "bg-accent/5" : ""
                      }`}
                    >
                      {/* Icon badge */}
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        n.type === "follow" ? "bg-accent/10 text-accent" :
                        n.type === "creator" ? "bg-yellow-100 text-yellow-600" :
                        n.type === "like" ? "bg-red-100 text-red-500" :
                        n.type === "verse" ? "bg-purple-100 text-purple-600" :
                        "bg-blue-100 text-blue-500"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-foreground leading-snug">
                          {n.actor_name ? (
                            <>
                              <button
                                onClick={(e) => handleActorClick(e, n)}
                                className="font-semibold text-accent hover:underline transition-colors"
                              >
                                {n.actor_name}
                              </button>{" "}
                              {n.type === "follow"
                                ? "started following you."
                                : n.message.replace(n.actor_name, "").trimStart().replace(/^[,\s]+/, "")}
                            </>
                          ) : (
                            n.message
                          )}
                        </p>
                        <p className="font-body text-[11px] text-muted-foreground mt-1">
                          {n.created_date ? format(new Date(n.created_date), "MMM d, h:mm a") : ""}
                        </p>
                      </div>

                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}