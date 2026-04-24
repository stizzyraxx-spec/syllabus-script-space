import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Radio, X, Users, Send, Loader2, PhoneOff, Gift, Share2, Heart, Trash2, Clock, Monitor, Settings, Eye, EyeOff, Music, Filter } from "lucide-react";
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

export default function LiveHostView({ user, onEnd }) {
  const queryClient = useQueryClient();
  const [streamId, setStreamId] = useState(null);
  const [title, setTitle] = useState("");
  const [started, setStarted] = useState(false);
  const [comment, setComment] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [streamTime, setStreamTime] = useState(0);
  const [screenShare, setScreenShare] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [filterEffect, setFilterEffect] = useState("none");
  const [showSettings, setShowSettings] = useState(false);
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const commentsEndRef = useRef(null);
  const timerRef = useRef(null);

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user.email }),
    select: (d) => d[0],
    enabled: !!user?.email,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["live-comments", streamId],
    queryFn: () => base44.entities.LiveComment.filter({ stream_id: streamId }, "created_date", 50),
    enabled: !!streamId,
    refetchInterval: 2000,
  });

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const toggleScreenShare = async () => {
    if (screenShare) {
      // Stop screen share
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (screenRef.current) {
        screenRef.current.srcObject = null;
      }
      setScreenShare(false);
    } else {
      // Start screen share
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = screenStream;
        if (screenRef.current) {
          screenRef.current.srcObject = screenStream;
          screenRef.current.play().catch(err => console.warn('Screen play failed:', err));
        }
        setScreenShare(true);
        // Stop screen share when user clicks the stop button in browser
        screenStream.getVideoTracks()[0].onended = () => {
          setScreenShare(false);
          if (screenRef.current) screenRef.current.srcObject = null;
        };
      } catch (e) {
        console.warn('Screen share failed:', e.message);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const startStream = async () => {
    if (!title.trim()) return;
    // Start camera
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.play().catch(err => console.warn('Video play failed:', err));
      }
      
      // Start recording
      try {
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
          ? 'video/webm;codecs=vp9' 
          : 'video/webm';
        mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType });
        recordedChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
      } catch (recordErr) {
        console.warn('Recording failed:', recordErr.message);
      }
    } catch (e) {
      setCameraError(true);
    }
    // Create stream record
    const stream = await base44.entities.LiveStream.create({
      host_email: user.email,
      host_name: myProfile?.display_name || user.full_name || "Host",
      host_avatar: myProfile?.avatar_url || null,
      title: title.trim(),
      status: "live",
      viewer_count: 0,
      total_gifts: 0,
      likes: 0,
      liked_by: [],
    });
    
    // Generate Agora token for host
    try {
      const tokenRes = await base44.functions.invoke('generateAgoraToken', {
        channelName: `channel_${stream.id}`,
        uid: Date.now(),
        role: 'host'
      });
      console.log('Agora token generated:', tokenRes.data.token);
    } catch (e) {
      console.warn('Agora token generation failed:', e.message);
    }
    
    setStreamId(stream.id);
    setStarted(true);
    setStreamTime(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setStreamTime((t) => t + 1);
    }, 1000);
    
    // Post join comment
    await base44.entities.LiveComment.create({
      stream_id: stream.id,
      author_email: user.email,
      author_name: myProfile?.display_name || user.full_name || "Host",
      content: "Started the stream! Welcome everyone 🎉",
      type: "join",
    });
  };

  const endStream = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    
    // Stop recording and save video
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setTimeout(() => saveRecordedVideo(), 500);
    }
    
    if (streamId) {
      await base44.entities.LiveStream.update(streamId, { status: "ended" });
    }
    queryClient.invalidateQueries({ queryKey: ["live-streams"] });
    onEnd();
  };

  const saveRecordedVideo = async () => {
    if (recordedChunksRef.current.length === 0 || !streamId) return;
    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onload = async (e) => {
        const videoData = e.target.result;
        const response = await base44.functions.invoke('saveLiveVideo', {
          videoData,
          fileName: `stream_${streamId}.webm`,
        });
        if (response.data.file_url) {
          await base44.entities.LiveStream.update(streamId, { 
            video_url: response.data.file_url 
          });
          queryClient.invalidateQueries({ queryKey: ["live-streams"] });
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to save video:', error.message);
    }
  };

  const deleteVideo = async (streamId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await base44.entities.LiveStream.update(streamId, { video_url: null });
      queryClient.invalidateQueries({ queryKey: ["live-streams"] });
    } catch (error) {
      console.error('Failed to delete video:', error.message);
    }
  };

  const sendComment = async () => {
    if (!comment.trim() || !streamId) return;
    await base44.entities.LiveComment.create({
      stream_id: streamId,
      author_email: user.email,
      author_name: myProfile?.display_name || user.full_name || "Host",
      content: filterProfanity(comment.trim()),
      type: "comment",
    });
    setComment("");
    queryClient.invalidateQueries({ queryKey: ["live-comments", streamId] });
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/live?stream=${streamId}`;
      const shareText = `Join my live stream "${title}" on The Condition of Man!`;
      
      if (navigator.share) {
        await navigator.share({ title: title, text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      }
    } catch (error) {
      // Fallback to clipboard if share fails
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/live?stream=${streamId}`);
      } catch {
        // Silent fail if clipboard also unavailable
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilterCSS = (filter) => {
    const filters = {
      grayscale: "grayscale(100%)",
      sepia: "sepia(100%)",
      blur: "blur(8px)",
      bright: "brightness(1.3)",
      none: "none",
    };
    return filters[filter] || "none";
  };

  // Setup screen
  if (!started) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-bold text-white">Go Live</h2>
            <button onClick={onEnd} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mb-6">
            <label className="font-body text-xs text-white/60 mb-2 block">Stream Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you sharing today?"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 font-body text-sm outline-none focus:border-red-400 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && startStream()}
            />
          </div>
          <div className="space-y-2 mb-6">
            <label className="font-body text-xs text-white/60 mb-2 block">Filters</label>
            <select
              value={filterEffect}
              onChange={(e) => setFilterEffect(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-body text-sm outline-none focus:border-red-400 transition-colors"
            >
              <option value="none">No Filter</option>
              <option value="grayscale">Grayscale</option>
              <option value="sepia">Sepia</option>
              <option value="blur">Blur</option>
              <option value="bright">Brightness+</option>
            </select>
          </div>
          <button
            onClick={startStream}
            disabled={!title.trim()}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-body font-bold py-3.5 rounded-xl transition-colors text-sm"
          >
            <Radio className="w-5 h-5" />
            Start Live Stream
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Video */}
      <div className="relative flex-1 bg-black">
        {screenShare && screenRef ? (
          <video ref={screenRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        ) : cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-16 h-16 text-red-500 mx-auto mb-3" />
              <p className="text-white font-body text-sm">Camera unavailable — audio only</p>
            </div>
          </div>
        ) : (
          <video ref={videoRef} autoPlay muted playsInline style={filterEffect !== "none" ? { filter: getFilterCSS(filterEffect) } : {}} className="w-full h-full object-cover" />
        )}

        {/* Overlay top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 bg-red-500 text-white font-body text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              <span className="flex items-center gap-1 bg-white/10 text-white font-body text-xs font-bold px-2.5 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                {formatTime(streamTime)}
              </span>
              {screenShare && (
                <span className="flex items-center gap-1 bg-blue-500 text-white font-body text-xs font-bold px-2.5 py-1 rounded-full">
                  <Monitor className="w-3 h-3" />
                  Screen
                </span>
              )}
            </div>
            <p className="font-body font-semibold text-white text-sm">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={endStream} className="flex items-center gap-1.5 bg-red-600 text-white font-body text-xs font-bold px-3 py-2 rounded-full hover:bg-red-700 transition-colors">
              <PhoneOff className="w-3.5 h-3.5" />
              End
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="absolute top-20 right-4 bg-black/90 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-3 z-40">
            <button
              onClick={toggleScreenShare}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${screenShare ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <Monitor className="w-4 h-4" />
              {screenShare ? "Stop Screen" : "Share Screen"}
            </button>
            <button
              onClick={toggleAudio}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${!audioEnabled ? "bg-red-600 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <Music className="w-4 h-4" />
              {audioEnabled ? "Mute" : "Unmute"}
            </button>
            <button
              onClick={toggleVideo}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${!videoEnabled ? "bg-red-600 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              {videoEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {videoEnabled ? "Camera Off" : "Camera On"}
            </button>
            <div className="border-t border-white/10 pt-3">
              <p className="font-body text-xs text-white/60 mb-2">Filter</p>
              <select
                value={filterEffect}
                onChange={(e) => setFilterEffect(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white font-body text-xs outline-none focus:border-red-400"
              >
                <option value="none">None</option>
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
                <option value="blur">Blur</option>
                <option value="bright">Brightness+</option>
              </select>
            </div>
          </div>
        )}

        {/* Comments overlay */}
        <div className="absolute bottom-20 left-0 right-0 px-4 max-h-60 overflow-y-auto space-y-2 pointer-events-none">
          <AnimatePresence>
            {comments.slice(-15).map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-accent overflow-hidden">
                  {c.author_avatar ? <img src={c.author_avatar} alt="" className="w-full h-full object-cover" /> : (c.author_name || "A")[0].toUpperCase()}
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 max-w-[75%]">
                  {c.type === "gift" ? (
                    <span className="font-body text-xs text-white">
                      <span className="font-semibold text-yellow-300">{c.author_name}</span> sent {c.gift_emoji} {c.gift_name}
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
      </div>

      {/* Bottom input */}
      <div className="bg-black/90 px-4 py-3 flex items-center gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white placeholder:text-white/40 font-body text-sm outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendComment()}
        />
        <button onClick={sendComment} disabled={!comment.trim()} className="text-accent disabled:opacity-40">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}