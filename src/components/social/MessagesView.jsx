import React, { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Loader2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

function makeConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join("__");
}

export default function MessagesView({ currentUser, onViewProfile }) {
  const [activeConvo, setActiveConvo] = useState(null); // email of other user
  const [newMessage, setNewMessage] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const convoId = activeConvo
    ? makeConversationId(currentUser.email, activeConvo)
    : null;

  // All conversations the user is part of
  const { data: sentMessages = [] } = useQuery({
    queryKey: ["dms-sent", currentUser.email],
    queryFn: () => base44.entities.DirectMessage.filter({ from_email: currentUser.email }, "-created_date", 100),
    refetchInterval: 5000,
  });
  const { data: receivedMessages = [] } = useQuery({
    queryKey: ["dms-received", currentUser.email],
    queryFn: () => base44.entities.DirectMessage.filter({ to_email: currentUser.email }, "-created_date", 100),
    refetchInterval: 5000,
  });

  // Derive unique conversation partners
  const conversationPartners = React.useMemo(() => {
    const partners = new Set();
    sentMessages.forEach((m) => partners.add(m.to_email));
    receivedMessages.forEach((m) => partners.add(m.from_email));
    return Array.from(partners);
  }, [sentMessages, receivedMessages]);

  // Messages for active conversation
  const { data: convoMessages = [] } = useQuery({
    queryKey: ["convo", convoId],
    queryFn: () =>
      base44.entities.DirectMessage.filter({ conversation_id: convoId }, "created_date", 100),
    enabled: !!convoId,
    refetchInterval: 3000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convoMessages]);

  const sendMutation = useMutation({
    mutationFn: () =>
      base44.entities.DirectMessage.create({
        from_email: currentUser.email,
        to_email: activeConvo,
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

  const handleSearchFriend = async (username) => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const profiles = await base44.entities.UserProfile.filter({}, undefined, 100);
      const filtered = profiles.filter(
        (p) =>
          p.username?.toLowerCase().includes(username.toLowerCase()) &&
          p.user_email !== currentUser.email
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  const startConvoWithFriend = (friendEmail) => {
    setActiveConvo(friendEmail);
    setSearchUsername("");
    setSearchResults([]);
  };

  if (activeConvo) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[600px]">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setActiveConvo(null)}
            className="p-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewProfile(activeConvo)}
            className="font-body font-semibold text-sm text-foreground hover:text-accent transition-colors"
          >
            {activeConvo}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {convoMessages.length === 0 && (
            <p className="font-body text-sm text-muted-foreground text-center py-8">
              Start the conversation!
            </p>
          )}
          {convoMessages.map((msg) => {
            const isMe = msg.from_email === currentUser.email;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl font-body text-sm leading-relaxed ${
                    isMe
                      ? "bg-accent text-accent-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                  <p className={`text-[10px] mt-1 ${isMe ? "text-accent-foreground/60" : "text-muted-foreground"}`}>
                    {msg.created_date ? format(new Date(msg.created_date), "h:mm a") : ""}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="font-body text-sm flex-1"
          />
          <button
            onClick={handleSend}
            disabled={sendMutation.isPending || !newMessage.trim()}
            className="w-10 h-10 flex items-center justify-center bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex-shrink-0"
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Find friends to message */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Search by username..."
            value={searchUsername}
            onChange={(e) => {
              setSearchUsername(e.target.value);
              handleSearchFriend(e.target.value);
            }}
            className="font-body text-sm"
          />
        </div>

        {/* Search results */}
        {searchUsername && (
          <div className="rounded-lg border border-border bg-card overflow-hidden max-h-64 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No friends found with that username.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {searchResults.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => startConvoWithFriend(profile.user_email)}
                    className="w-full text-left p-3 hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-bold text-accent text-xs">
                          {(profile.display_name || "U")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-sm text-foreground">
                        @{profile.username}
                      </p>
                      {profile.display_name && (
                        <p className="font-body text-xs text-muted-foreground truncate">
                          {profile.display_name}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {conversationPartners.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No messages yet.</p>
          <p className="font-body text-xs text-muted-foreground/60 mt-1">
            Enter someone's email above to start a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversationPartners.map((partner) => (
            <button
              key={partner}
              onClick={() => setActiveConvo(partner)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-accent text-sm">
                  {partner[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-body font-semibold text-sm text-foreground">{partner}</p>
                <p className="font-body text-xs text-muted-foreground">Tap to open conversation</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}