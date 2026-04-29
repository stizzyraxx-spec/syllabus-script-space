import React, { useState, useEffect, useRef } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

function makeConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join("__");
}

export default function DirectMessageModal({ currentUser, recipientEmail, recipientName, recipientAvatar, onClose }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const inputRef = useRef(null);

  const { data: recipientProfile } = useQuery({
    queryKey: ["user-profile", recipientEmail],
    queryFn: () => db.entities.UserProfile.filter({ user_email: recipientEmail }),
    select: (data) => data[0],
  });

  const convoId = makeConversationId(currentUser.email, recipientEmail);

  const { data: convoMessages = [] } = useQuery({
    queryKey: ["convo", convoId],
    queryFn: () =>
      db.entities.DirectMessage.filter({ conversation_id: convoId }, "created_date", 100),
    refetchInterval: 3000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convoMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMutation = useMutation({
    mutationFn: () =>
      db.entities.DirectMessage.create({
        from_email: currentUser.email,
        to_email: recipientEmail,
        content: newMessage,
        conversation_id: convoId,
        read: false,
      }),
    onSuccess: () => {
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
      className="fixed bottom-6 right-6 z-[200] w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      style={{ maxHeight: "480px" }}
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
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-primary-foreground/60 hover:text-primary-foreground transition-colors"
        >
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
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl font-body text-sm leading-relaxed ${
                  isMe
                    ? "bg-accent text-accent-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
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
          {sendMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.div>
  );
}