import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";

export default function PlayerMessagesPanel({ playerEmail, playerName, onClose }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages } = useQuery({
    queryKey: ["player-messages", playerEmail],
    queryFn: () =>
      base44.entities.PlayerMessage.filter({
        $or: [{ from_email: playerEmail }, { to_email: playerEmail }],
      }),
    refetchInterval: 3000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      await base44.entities.PlayerMessage.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-messages", playerEmail] });
      setMessageText("");
    },
  });

  const handleSendMessage = (toEmail, toName) => {
    if (!messageText.trim()) return;

    const conversationId = [playerEmail, toEmail].sort().join("-");

    sendMessageMutation.mutate({
      from_email: playerEmail,
      from_name: playerName,
      to_email: toEmail,
      content: messageText,
      conversation_id: conversationId,
      message_type: "chat",
    });
  };

  // Get unique conversations
  const conversations = messages
    ? Array.from(
        new Map(
          messages.map((m) => [
            m.conversation_id,
            {
              conversationId: m.conversation_id,
              otherEmail: m.from_email === playerEmail ? m.to_email : m.from_email,
              otherName:
                m.from_email === playerEmail ? m.from_email : m.from_name || m.to_email,
              lastMessage: m.content,
              unread: m.to_email === playerEmail && !m.read,
            },
          ])
        ).values()
      )
    : [];

  const selectedConv = selectedConversation
    ? conversations.find((c) => c.conversationId === selectedConversation)
    : null;

  const selectedMessages = selectedConv
    ? messages.filter((m) => m.conversation_id === selectedConversation)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed bottom-32 right-4 bg-black/90 border border-white/20 rounded-xl overflow-hidden w-80 max-h-96 flex flex-col"
    >
      {!selectedConv ? (
        <>
          {/* Conversations List */}
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              <h3 className="font-display font-bold text-white">Messages</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {conversations.length === 0 ? (
              <p className="text-center text-white/40 text-sm py-6">
                No conversations yet
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => setSelectedConversation(conv.conversationId)}
                  className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-body text-sm font-semibold truncate">
                      {conv.otherName}
                    </p>
                    {conv.unread && (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <p className="text-white/50 text-xs truncate">{conv.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Message Detail */}
          <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-display font-bold text-white">
              {selectedConv.otherName}
            </h3>
            <button
              onClick={() => setSelectedConversation(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-3">
            <AnimatePresence>
              {selectedMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.from_email === playerEmail ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.from_email === playerEmail
                        ? "bg-accent text-accent-foreground"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage(
                    selectedConv.otherEmail,
                    selectedConv.otherName
                  );
                }
              }}
              placeholder="Type message..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-accent"
            />
            <button
              onClick={() =>
                handleSendMessage(selectedConv.otherEmail, selectedConv.otherName)
              }
              className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-accent-foreground transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}