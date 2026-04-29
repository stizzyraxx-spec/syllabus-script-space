import React, { useState, useEffect, useRef } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Heart, MessageCircle, Trash2, Archive, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function GroupChat({ currentUser }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["group-chat-messages"],
    queryFn: () => db.entities.GroupChatMessage.list("-created_date", 100),
    refetchInterval: 2000,
  });

  useEffect(() => {
    const unsubscribe = db.entities.GroupChatMessage.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ["group-chat-messages"] });
    });
    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!currentUser) return;
      const userProfile = await db.entities.UserProfile.filter({
        user_email: currentUser.email,
      });
      const profile = userProfile[0];

      await db.entities.GroupChatMessage.create({
        author_email: currentUser.email,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        content,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["group-chat-messages"] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (msg) => {
      const alreadyLiked = msg.liked_by?.includes(currentUser.email);
      const newLikedBy = alreadyLiked
        ? (msg.liked_by || []).filter((e) => e !== currentUser.email)
        : [...(msg.liked_by || []), currentUser.email];

      await db.entities.GroupChatMessage.update(msg.id, {
        likes: newLikedBy.length,
        liked_by: newLikedBy,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-chat-messages"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (messageId) => {
      const res = await db.functions.invoke("deleteGroupChatMessage", { message_id: messageId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-chat-messages"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await db.functions.invoke("archiveGroupChat", {});
      return res.data;
    },
    onSuccess: () => {
      setShowArchiveConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["group-chat-messages"] });
    },
  });

  const handleSend = () => {
    if (message.trim() && currentUser) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentUser) {
    return (
      <div className="p-8 rounded-xl border border-border bg-card text-center">
        <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-body text-sm text-muted-foreground mb-4">
          Sign in to join the group chat discussion.
        </p>
        <button
          onClick={() => db.auth.redirectToLogin()}
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="flex flex-col h-[600px] rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-foreground mb-0.5">Faith Discussion</h3>
          <p className="font-body text-xs text-muted-foreground">
            {messages.length} messages • Public community chat
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowArchiveConfirm(true)}
            disabled={archiveMutation.isPending || messages.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground font-body text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Archive conversations to S3"
          >
            {archiveMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Archive className="w-3.5 h-3.5" />
            )}
            Archive
          </button>
        )}
      </div>

      <AnimatePresence>
        {showArchiveConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900 flex items-center justify-between"
          >
            <p className="font-body text-xs text-amber-900 dark:text-amber-200">
              Archive {messages.length} messages to S3?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="px-2.5 py-1 text-xs font-medium rounded bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => archiveMutation.mutate()}
                className="px-2.5 py-1 text-xs font-medium rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="font-body text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isAuthor = msg.author_email === currentUser.email;
              const isLiked = msg.liked_by?.includes(currentUser.email);

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isAuthor ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {msg.author_avatar ? (
                      <img src={msg.author_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-body text-xs font-bold text-accent">
                        {(msg.author_name || msg.author_email)[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={`flex-1 min-w-0 ${isAuthor ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-body text-xs font-semibold text-foreground">
                        {msg.author_name || msg.author_email}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {msg.created_date ? format(new Date(msg.created_date), "h:mm a") : ""}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        isAuthor
                          ? "bg-accent text-accent-foreground rounded-br-none"
                          : "bg-secondary text-foreground rounded-bl-none"
                      }`}
                    >
                      <p className="font-body text-sm leading-relaxed break-words">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 pl-2">
                      <button
                        onClick={() => likeMutation.mutate(msg)}
                        disabled={likeMutation.isPending}
                        className={`flex items-center gap-1 font-body text-xs transition-colors ${
                          isLiked
                            ? "text-red-500"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                        {msg.likes > 0 ? msg.likes : ""}
                      </button>
                      {(msg.author_email === currentUser.email || isAdmin) && (
                        <button
                          onClick={() => deleteMutation.mutate(msg.id)}
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-secondary/30">
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your faith thoughts..."
            rows="2"
            className="flex-1 p-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mt-auto"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}