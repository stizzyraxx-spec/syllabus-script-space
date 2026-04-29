import React, { useState, useEffect, useRef, useCallback } from "react";
import { db, supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

function makeConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join("__");
}

function loadLocal(convoId) {
  try { return JSON.parse(localStorage.getItem(`tcom-dm-${convoId}`) || '[]'); } catch { return []; }
}
function saveLocal(convoId, messages) {
  try { localStorage.setItem(`tcom-dm-${convoId}`, JSON.stringify(messages.slice(-200))); } catch {}
}

export default function DirectMessageModal({ currentUser, recipientEmail, recipientName, recipientAvatar, onClose }) {
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const channelRef = useRef(null);

  const convoId = makeConversationId(currentUser.email, recipientEmail);

  const { data: recipientProfile } = useQuery({
    queryKey: ["user-profile", recipientEmail],
    queryFn: async () => {
      try { return await db.entities.UserProfile.filter({ user_email: recipientEmail }); }
      catch { return []; }
    },
    select: (data) => data?.[0],
  });

  // Pull DB messages (best effort) and merge with local ones
  const { data: dbMessages = [] } = useQuery({
    queryKey: ["convo", convoId],
    queryFn: async () => {
      try { return await db.entities.DirectMessage.filter({ conversation_id: convoId }, "created_date", 100); }
      catch { return []; }
    },
    refetchInterval: 3000,
  });

  // On mount, hydrate from localStorage
  useEffect(() => {
    setLocalMessages(loadLocal(convoId));
  }, [convoId]);

  // Realtime subscription — receive messages from the other user live
  useEffect(() => {
    const channel = supabase
      .channel(`dm:${convoId}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setLocalMessages(prev => {
          const next = [...prev, payload];
          saveLocal(convoId, next);
          return next;
        });
      })
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [convoId]);

  // Merge DB + local, dedupe by id, sort by created_date
  const allMessagesById = new Map();
  for (const m of dbMessages) allMessagesById.set(m.id, m);
  for (const m of localMessages) if (!allMessagesById.has(m.id)) allMessagesById.set(m.id, m);
  const convoMessages = [...allMessagesById.values()].sort((a, b) =>
    new Date(a.created_date || 0) - new Date(b.created_date || 0)
  );

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convoMessages.length]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const msg = {
        id,
        from_email: currentUser.email,
        to_email: recipientEmail,
        content: newMessage,
        conversation_id: convoId,
        created_date: new Date().toISOString(),
        read: false,
        _local: true,
      };
      // 1) Append to local + persist
      setLocalMessages(prev => {
        const next = [...prev, msg];
        saveLocal(convoId, next);
        return next;
      });
      // 2) Broadcast over Realtime so the recipient receives it instantly
      if (channelRef.current) {
        try { await channelRef.current.send({ type: 'broadcast', event: 'message', payload: msg }); } catch {}
      }
      // 3) Best-effort DB write (works once direct_messages table is provisioned)
      try {
        await db.entities.DirectMessage.create({
          from_email: currentUser.email,
          to_email: recipientEmail,
          content: newMessage,
          conversation_id: convoId,
          read: false,
        });
      } catch {}
      return msg;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["convo", convoId] });
      queryClient.invalidateQueries({ queryKey: ["dms-sent", currentUser.email] });
      setNewMessage("");
    },
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-6 sm:right-6 z-[200] sm:w-96 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{ maxHeight: "min(85vh, 540px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {recipientProfile?.avatar_url ? (
              <img src={recipientProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-body text-xs font-bold text-accent">
                {(recipientName || recipientEmail || "U")[0].toUpperCase()}
              </span>
            )}
          </div>
          <span className="font-body font-semibold text-sm truncate">
            {recipientName || recipientEmail}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-primary-foreground/60 hover:text-primary-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4 min-h-0">
        {convoMessages.length === 0 && (
          <p className="font-body text-sm text-muted-foreground text-center py-8">
            Say hello to {recipientName || recipientEmail}!
          </p>
        )}
        {convoMessages.map((msg) => {
          const isMe = msg.from_email === currentUser.email;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent overflow-hidden">
                {isMe ? (
                  currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(currentUser?.full_name || "Y")[0].toUpperCase()}</span>
                  )
                ) : recipientProfile?.avatar_url ? (
                  <img src={recipientProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{(recipientName || recipientEmail || "U")[0].toUpperCase()}</span>
                )}
              </div>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl font-body text-sm leading-relaxed ${
                isMe ? "bg-accent text-accent-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"
              }`}>
                {msg.content}
                <p className={`text-[10px] mt-0.5 ${isMe ? "text-accent-foreground/60" : "text-muted-foreground"}`}>
                  {msg.created_date ? format(new Date(msg.created_date), "h:mm a") : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-border flex-shrink-0">
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="font-body text-sm flex-1 h-9"
        />
        <button
          onClick={handleSend}
          disabled={sendMutation.isPending || !newMessage.trim()}
          className="w-9 h-9 flex items-center justify-center bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}
