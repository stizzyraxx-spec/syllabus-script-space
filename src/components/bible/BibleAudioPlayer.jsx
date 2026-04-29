import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, X, Headphones, Loader2, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/api/supabaseClient";

export default function BibleAudioPlayer({ book, chapter }) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [verses, setVerses] = useState([]);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const versesRef = useRef([]);
  const currentVerseRef = useRef(0);
  const playingRef = useRef(false);
  const selectedVoiceRef = useRef(null);
  const utteranceRef = useRef(null);

  // Load voices — browsers load them async
  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const filtered = all.filter(v => v.name.includes("Daniel") || v.name.includes("Samantha"));
      setAvailableVoices(filtered);
      if (filtered.length > 0 && !selectedVoiceRef.current) {
        const preferred = filtered.find(v => v.name.includes("Daniel")) || filtered[0];
        setSelectedVoice(preferred);
        selectedVoiceRef.current = preferred;
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Reset when book/chapter changes
  useEffect(() => {
    stopSpeech();
    setVerses([]);
    versesRef.current = [];
    setCurrentVerse(0);
    currentVerseRef.current = 0;
    setError(null);
  }, [book, chapter]);

  const fetchVerses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await db.functions.invoke("getBibleVerses", { book, chapter });
      const v = res.data?.verses || [];
      if (!v.length) throw new Error("No verses found");
      setVerses(v);
      versesRef.current = v;
    } catch {
      setError("Could not load chapter text.");
    }
    setLoading(false);
  };

  const speakVerse = (idx) => {
    const v = versesRef.current;
    if (!playingRef.current || idx >= v.length) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(v[idx]);
    utter.voice = selectedVoiceRef.current;
    utter.rate = 0.9;
    utter.pitch = 1;
    utter.volume = 1;
    utter.onend = () => {
      if (!playingRef.current) return;
      const next = idx + 1;
      currentVerseRef.current = next;
      setCurrentVerse(next);
      speakVerse(next);
    };
    utter.onerror = (e) => {
      if (e.error === "interrupted") return;
      console.error("Speech error:", e);
    };
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const stopSpeech = () => {
    playingRef.current = false;
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  const handlePlayPause = async () => {
    if (playing) {
      stopSpeech();
      return;
    }
    setError(null);
    if (!versesRef.current.length) {
      await fetchVerses();
    }
    if (!versesRef.current.length) return;
    playingRef.current = true;
    setPlaying(true);
    speakVerse(currentVerseRef.current);
  };

  const handleStop = () => {
    stopSpeech();
    setCurrentVerse(0);
    currentVerseRef.current = 0;
  };

  const handlePrev = () => {
    const prev = Math.max(0, currentVerseRef.current - 1);
    currentVerseRef.current = prev;
    setCurrentVerse(prev);
    if (playing) {
      window.speechSynthesis.cancel();
      speakVerse(prev);
    }
  };

  const handleNext = () => {
    const next = Math.min(versesRef.current.length - 1, currentVerseRef.current + 1);
    currentVerseRef.current = next;
    setCurrentVerse(next);
    if (playing) {
      window.speechSynthesis.cancel();
      speakVerse(next);
    }
  };

  const handleVoiceChange = (name) => {
    const v = availableVoices.find(v => v.name === name);
    if (v) {
      selectedVoiceRef.current = v;
      setSelectedVoice(v);
      if (playing) {
        window.speechSynthesis.cancel();
        speakVerse(currentVerseRef.current);
      }
    }
  };

  const handleClose = () => {
    stopSpeech();
    setVisible(false);
  };

  const progress = verses.length > 0 ? (currentVerse / verses.length) * 100 : 0;

  return (
    <>
      <AnimatePresence>
        {!visible && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setVisible(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-all font-body text-sm font-semibold whitespace-nowrap"
          >
            <Headphones className="w-4 h-4" />
            Listen — {book} {chapter}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-2xl"
          >
            <div className="h-1.5 bg-white/20 w-full">
              <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="px-4 py-3 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-accent" />
                  <span className="font-body text-sm font-semibold">{book} {chapter}</span>
                  {verses.length > 0 && (
                    <span className="font-body text-xs text-primary-foreground/50">
                      v.{Math.min(currentVerse + 1, verses.length)}/{verses.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {availableVoices.length > 0 && (
                    <select
                      value={selectedVoice?.name || ""}
                      onChange={(e) => handleVoiceChange(e.target.value)}
                      className="bg-white/10 text-primary-foreground text-xs rounded px-2 py-1 border border-white/20 outline-none cursor-pointer max-w-[160px]"
                    >
                      {availableVoices.map(v => (
                        <option key={v.name} value={v.name} className="text-black">{v.name}</option>
                      ))}
                    </select>
                  )}
                  <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handlePrev} disabled={currentVerse === 0} className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  disabled={loading}
                  className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40 shadow-lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" />
                    : playing ? <Pause className="w-5 h-5" />
                    : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                {playing && (
                  <button onClick={handleStop} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Square className="w-4 h-4" />
                  </button>
                )}

                <button onClick={handleNext} disabled={currentVerse >= verses.length - 1} className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="font-body text-xs text-primary-foreground/50 flex-1 ml-1">
                  {error ? <span className="text-red-400">{error}</span>
                    : loading ? "Loading..."
                    : playing ? "Now reading..."
                    : "Tap play to listen"}
                </span>

                <button onClick={() => setVisible(false)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}