import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Send, Gift, Share2, Users, Radio, Heart, MoreVertical, BookmarkIcon, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { filterProfanity } from "@/lib/profanityFilter";

const GIFTS = [
  { emoji: "🌹", name: "Rose", value: 1 },
  { emoji: "💎", name: "Diamond", value: 5 },
  { emoji: "👑", name: "Crown", value: 10 },
  { emoji: "🙏", name: "Prayer", value: 1 },
  { emoji: "✝️", name: "Cross", value: 3 },
  { emoji: "🕊️", name: "Dove", value: 2 },
];

export default function LiveViewerView({ stream, user, onLeave }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [showGifts, setShowGifts] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [floatingGifts, setFloatingGifts] = useState([]);
  const [commentFilter, setCommentFilter] = useState("all");
  const commentsEndRef = useRef(null);

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    select: (d) => d[0],
    enabled: !!user?.email,
  });

  const { data: streamData } = useQuery({
    queryKey: ["stream-live", stream.id],
    queryFn: () => base44.entities.LiveStream.filter({ id: stream.id }),
    select: (d) => d[0] || stream,
    refetchInterval: 5000,
  });

  const { mutateAsync: toggleLike } = useMutation({
    mutationFn: async () => {
      const liked = streamData?.liked_by?.includes(user?.email);
      const newLikedBy = liked
        ? streamData.liked_by.filter((e) => e !== user?.email)
        : [...(streamData.liked_by || []), user?.email];
      await base44.entities.LiveStream.update(stream.id, {
        likes: liked ? Math.max(0, (streamData?.likes || 1) - 1) : (streamData?.likes || 0) + 1,
        liked_by: newLikedBy,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stream-live", stream.id] }),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["live-comments", stream.id],
    queryFn: () => base44.entities.LiveComment.filter({ stream_id: stream.id }, "created_date", 60),
    refetchInterval: 2000,
  });

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  // Register as viewer
  useEffect(() => {
    if (!user) return;
    const join = async () => {
      // Generate Agora token for viewer
      try {
        const tokenRes = await base44.functions.invoke('generateAgoraToken', {
          channelName: `channel_${stream.id}`,
          uid: Date.now(),
          role: 'viewer'
        });
        console.log('Agora token generated for viewer:', tokenRes.data.token);
      } catch (e) {
        console.warn('Agora token generation failed:', e.message);
      }
      
      // Post join notification
      await base44.entities.LiveComment.create({
        stream_id: stream.id,
        author_email: user.email,
        author_name: myProfile?.display_name || user.full_name || "Someone",
        author_avatar: myProfile?.avatar_url || null,
        content: `${myProfile?.display_name || user.full_name || "Someone"} joined 👋`,
        type: "join",
      });
      // Increment viewer count
      await base44.entities.LiveStream.update(stream.id, {
        viewer_count: (streamData?.viewer_count || 0) + 1,
      });
    };
    join();
    return () => {
      base44.entities.LiveStream.update(stream.id, {
        viewer_count: Math.max(0, (streamData?.viewer_count || 1) - 1),
      });
    };
  }, []);

  const sendComment = async () => {
    if (!comment.trim() || !user) return;
    await base44.entities.LiveComment.create({
      stream_id: stream.id,
      author_email: user.email,
      author_name: myProfile?.display_name || user.full_name || "Viewer",
      author_avatar: myProfile?.avatar_url || null,
      content: filterProfanity(comment.trim()),
      type: "comment",
    });
    setComment("");
    queryClient.invalidateQueries({ queryKey: ["live-comments", stream.id] });
  };

  const sendGift = async (gift) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setShowGifts(false);
    // Floating animation
    const id = Date.now();
    setFloatingGifts((prev) => [...prev, { id, emoji: gift.emoji }]);
    setTimeout(() => setFloatingGifts((prev) => prev.filter((g) => g.id !== id)), 2500);

    await base44.entities.LiveComment.create({
      stream_id: stream.id,
      author_email: user.email,
      author_name: myProfile?.display_name || user.full_name || "Viewer",
      author_avatar: myProfile?.avatar_url || null,
      content: `sent a gift!`,
      type: "gift",
      gift_emoji: gift.emoji,
      gift_name: gift.name,
    });
    await base44.entities.LiveStream.update(stream.id, {
      total_gifts: (streamData?.total_gifts || 0) + gift.value,
    });
    queryClient.invalidateQueries({ queryKey: ["live-comments", stream.id] });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/live?stream=${stream.id}`;
    const shareText = `Watch ${stream.host_name} live on The Condition of Man!`;
    
    if (navigator.share) {
      navigator.share({ title: stream.title, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (commentFilter === "all") return true;
    if (commentFilter === "messages") return c.type === "comment";
    if (commentFilter === "gifts") return c.type === "gift";
    if (commentFilter === "joins") return c.type === "join";
    return true;
  });

  const isEnded = streamData?.status === "ended";

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Video placeholder (real WebRTC would go here) */}
      <div className="relative flex-1 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            {stream.host_avatar ? (
              <img src={stream.host_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-accent text-4xl">
                {(stream.host_name || "H")[0].toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-body font-semibold text-white text-lg">{stream.host_name}</p>
          <p className="font-body text-white/50 text-sm mt-1">{isEnded ? "Stream ended" : "Broadcasting live..."}</p>
        </div>

        {/* Floating gifts */}
        <AnimatePresence>
          {floatingGifts.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 1, y: 0, x: Math.random() * 40 - 20, scale: 1 }}
              animate={{ opacity: 0, y: -200, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2 }}
              className="absolute bottom-24 right-8 text-4xl pointer-events-none"
            >
              {g.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between bg-gradient-to-b from-black/70 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isEnded ? (
                <span className="bg-gray-600 text-white font-body text-xs font-bold px-2.5 py-1 rounded-full">ENDED</span>
              ) : (
                <span className="flex items-center gap-1 bg-red-500 text-white font-body text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              )}
              <span className="flex items-center gap-1 bg-black/40 text-white font-body text-xs px-2 py-1 rounded-full">
                <Users className="w-3 h-3" />
                {streamData?.viewer_count || 0}
              </span>
            </div>
            <p className="font-body font-semibold text-white text-sm">{stream.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => user ? toggleLike() : base44.auth.redirectToLogin()}
              className={`p-2 rounded-full transition-colors ${streamData?.liked_by?.includes(user?.email) ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}
            >
              <Heart className={`w-4 h-4 ${streamData?.liked_by?.includes(user?.email) ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-2 rounded-full transition-colors ${bookmarked ? "bg-amber-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <BookmarkIcon className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
            </button>
            <button 
              onClick={() => setShowMore(!showMore)}
              className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <button onClick={onLeave} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* More options menu */}
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 right-4 bg-black/90 backdrop-blur-sm rounded-xl p-2 border border-white/10 z-40 space-y-1"
          >
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/live`);
                setShowMore(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors font-body text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <button
              onClick={() => {
                alert("Reporting stream...");
                setShowMore(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors font-body text-sm"
            >
              🚩 Report
            </button>
          </motion.div>
        )}

        {/* Comment Filter */}
        <div className="absolute bottom-20 left-4 flex gap-1">
          {["all", "messages", "gifts", "joins"].map((filter) => (
            <button
              key={filter}
              onClick={() => setCommentFilter(filter)}
              className={`px-3 py-1 rounded-full font-body text-xs font-medium transition-colors ${
                commentFilter === filter
                  ? "bg-accent text-accent-foreground"
                  : "bg-black/50 text-white hover:bg-black/70"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Comments overlay */}
        <div className="absolute bottom-20 left-0 right-0 px-4 max-h-64 overflow-y-auto space-y-2 pointer-events-none">
          <AnimatePresence>
            {filteredComments.slice(-20).map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-accent overflow-hidden">
                  {c.author_avatar ? <img src={c.author_avatar} alt="" className="w-full h-full object-cover" /> : (c.author_name || "A")[0].toUpperCase()}
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 max-w-[80%]">
                  {c.type === "gift" ? (
                    <span className="font-body text-xs text-white">
                      <span className="font-semibold text-yellow-300">{c.author_name}</span> sent {c.gift_emoji} {c.gift_name}!
                    </span>
                  ) : c.type === "join" ? (
                    <span className="font-body text-xs text-green-300">{c.content}</span>
                  ) : (
                    <span className="font-body text-xs text-white">
                      <span className="font-semibold text-accent">{c.author_name}: </span>{c.content}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={commentsEndRef} />
        </div>

        {/* Gift panel */}
        <AnimatePresence>
          {showGifts && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute bottom-16 left-0 right-0 bg-black/80 backdrop-blur-sm px-4 py-4"
            >
              <p className="font-body text-xs text-white/60 mb-3">Send a Gift</p>
              <div className="flex gap-3 flex-wrap">
                {GIFTS.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => sendGift(g)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="font-body text-[10px] text-white/70">{g.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="bg-black/90 px-4 py-3 flex items-center gap-2">
        {user ? (
          <>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isEnded}
              className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white placeholder:text-white/40 font-body text-sm outline-none disabled:opacity-40"
              onKeyDown={(e) => e.key === "Enter" && sendComment()}
            />
            <button
              onClick={() => setShowGifts((v) => !v)}
              disabled={isEnded}
              className={`p-2 rounded-full transition-colors ${showGifts ? "bg-yellow-400 text-black" : "bg-white/10 text-white"} disabled:opacity-40`}
            >
              <Gift className="w-5 h-5" />
            </button>
            <button onClick={sendComment} disabled={!comment.trim() || isEnded} className="text-accent disabled:opacity-40">
              <Send className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="flex-1 text-center font-body text-sm text-accent hover:underline"
          >
            Sign in to comment & send gifts
          </button>
        )}
      </div>
    </div>
  );
}