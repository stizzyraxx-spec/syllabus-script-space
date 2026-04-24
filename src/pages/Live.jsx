import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Users, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import LiveHostView from "@/components/live/LiveHostView";
import LiveViewerView from "@/components/live/LiveViewerView";

export default function Live() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [mode, setMode] = useState(null); // null | "host" | "watch"
  const [watchingStream, setWatchingStream] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
      setAuthChecked(true);
    });
  }, []);

  const { data: liveStreams = [] } = useQuery({
    queryKey: ["live-streams"],
    queryFn: () => base44.entities.LiveStream.filter({ status: "live" }, "-created_date"),
    refetchInterval: 5000,
  });

  // Handle direct stream access via URL parameter
  useEffect(() => {
    const streamId = searchParams.get("stream");
    if (streamId && liveStreams.length > 0) {
      const stream = liveStreams.find((s) => s.id === streamId);
      if (stream) {
        setWatchingStream(stream);
      }
    }
  }, [searchParams, liveStreams]);

  if (!authChecked) return null;

  if (mode === "host") {
    return <LiveHostView user={user} onEnd={() => setMode(null)} />;
  }

  if (watchingStream) {
    return <LiveViewerView stream={watchingStream} user={user} onLeave={() => setWatchingStream(null)} />;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-500" />
              Live
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Watch or host a live stream</p>
          </div>
          {user && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setMode("host")}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-body font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg transition-colors"
            >
              <Radio className="w-4 h-4" />
              Go Live
            </motion.button>
          )}
        </div>

        {liveStreams.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">No live streams right now.</p>
            {user && (
              <button
                onClick={() => setMode("host")}
                className="mt-4 font-body text-sm text-accent hover:underline font-semibold"
              >
                Be the first to go live →
              </button>
            )}
            {!user && (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="mt-4 font-body text-sm text-accent hover:underline font-semibold"
              >
                Sign in to go live
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {liveStreams.map((stream) => (
              <motion.button
                key={stream.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setWatchingStream(stream)}
                className="w-full text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/40 transition-colors"
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {stream.host_avatar ? (
                      <img src={stream.host_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display font-bold text-accent text-xl">
                        {(stream.host_name || "H")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 bg-red-500 text-white font-body text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>
                      <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {stream.viewer_count || 0}
                      </span>
                    </div>
                    <p className="font-body font-semibold text-sm text-foreground truncate">{stream.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{stream.host_name}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}