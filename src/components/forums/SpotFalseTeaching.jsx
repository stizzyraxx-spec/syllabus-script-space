import React, { useState, useCallback } from "react";
import { db } from "@/api/supabaseClient";
import { Loader2, ShieldAlert, CheckCircle2, XCircle, RefreshCw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";
const DIFFICULTIES = [
  { value: "beginner", label: "Beginner", desc: "Well-known false teachings" },
  { value: "intermediate", label: "Intermediate", desc: "Subtle doctrinal errors" },
  { value: "advanced", label: "Advanced", desc: "Nuanced theological deceptions" },
];

const CATEGORIES = [
  { value: "salvation", label: "Salvation & Grace" },
  { value: "prosperity", label: "Prosperity Gospel" },
  { value: "trinity", label: "The Trinity" },
  { value: "scripture", label: "Scripture & Authority" },
  { value: "jesus", label: "The Person of Christ" },
  { value: "mixed", label: "Mixed (All Topics)" },
];

const QUESTION_COUNTS = [
  { value: 7, label: "7 Rounds" },
  { value: 12, label: "12 Rounds" },
  { value: 33, label: "33 Rounds" },
];

export default function SpotFalseTeaching() {
  const [difficulty, setDifficulty] = useState("beginner");
  const [mode, setMode] = useState("normal"); // "normal" or "theologian"
  const [category, setCategory] = useState("mixed");
  const [total, setTotal] = useState(7);
  const [activeTotal, setActiveTotal] = useState(7);
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [usedTopics, setUsedTopics] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const { awardPoints } = useAwardPoints();

  const startGame = () => {
    setActiveTotal(total);
    setScore(0);
    setQuestionNum(1);
    setStreak(0);
    setGameOver(false);
    setConfirmed(false);
    setUsedTopics([]);
    if (mode !== "theologian") {
      setDifficulty("beginner");
      setCategory("mixed");
    }
    fetchRound([]);
  };

  const saveScore = useCallback(async () => {
    try {
      const user = await db.auth.me();
      if (user) {
        await db.entities.GameScore.create({
          player_email: user.email,
          player_name: user.full_name,
          game_type: "spot_false",
          score,
          difficulty
        });
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  }, [score, difficulty]);

  const fetchRound = async (topicsSoFar) => {
    setLoading(true);
    setSelected(null);
    setConfirmed(false);
    setFetchError(null);

    try {
      const res = await db.functions.invoke("generateSpotFalseRound", {
        mode,
        difficulty,
        category,
        usedTopics: topicsSoFar ?? usedTopics,
      });
      if (res.data) {
        setRound(res.data);
        if (res.data.topic) {
          setUsedTopics((prev) => [...prev, res.data.topic]);
        }
      } else {
        setFetchError("No question data returned. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching round:', error);
      setFetchError("Failed to load question. Check your connection and try again.");
    }

    setLoading(false);
  };

  const handleSelect = (idx) => {
    if (confirmed) return;
    setSelected(idx);
  };

  const handleConfirm = async () => {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    const isCorrect = round.statements[selected].is_false;
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      const user = await db.auth.me().catch(() => null);
      if (user) {
        await awardPoints(user.email, "false_teaching");
        toast.success("✨ +1 point for correct answer!");
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (questionNum >= activeTotal) {
      setGameOver(true);
    } else {
      setQuestionNum((n) => n + 1);
      fetchRound(undefined);
    }
  };

  // Setup screen
  if (!round && !loading && !gameOver) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Spot the False Teaching</h2>
          <p className="font-body text-sm text-muted-foreground">
            Four statements will appear. Identify which one is a false or heretical teaching.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Mode</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "normal", label: "Normal" },
                { value: "theologian", label: "🔬 Theologian" }
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-4 py-2 rounded-lg border font-body text-sm font-medium transition-all ${
                    mode === m.value
                      ? "bg-accent/10 text-accent border-accent/30"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {mode === "theologian" && (
              <p className="mt-2 font-body text-xs text-amber-700 dark:text-amber-400">
                🔬 Advanced statements on textual criticism, theological debates, manuscript history, and scholarly controversies. For serious students of theology.
              </p>
            )}
          </div>

          {mode !== "theologian" && (
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Difficulty</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    difficulty === d.value
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/40"
                  }`}
                >
                  <p className="font-body text-sm font-semibold text-foreground">{d.label}</p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>
          )}

          {mode !== "theologian" && (
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium border transition-all ${
                    category === c.value
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            </div>
            )}

            {mode !== "theologian" && (
            <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Number of Rounds</p>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setTotal(q.value)}
                  className={`px-4 py-2 rounded-lg font-body text-xs font-medium border transition-all ${
                    total === q.value
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
          )}

          <button
            onClick={startGame}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
          >
            Start {mode === "theologian" ? "Theologian" : "Normal"} Game ({total} Rounds)
          </button>
        </div>
      </div>
    );
  }

  // Game Over
  if (gameOver) {
    const pct = Math.round((score / activeTotal) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          {mode === "theologian" ? (pct === 100 ? "Brilliant! 🔬" : pct >= 80 ? "Impressive! 📚" : "Challenging! 💭") : "Game Complete!"}
        </h2>
        <p className="font-body text-muted-foreground text-sm mb-6">
          You spotted {score} out of {activeTotal} false {mode === "theologian" ? "statements" : "teachings"}
        </p>
        <div className="text-6xl font-display font-bold text-accent mb-2">{pct}%</div>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {mode === "theologian" 
            ? (pct === 100 ? "Master-level theological discernment!" : pct >= 80 ? "Strong scholarly knowledge!" : "Theological nuance is subtle—keep studying!")
            : (pct === 100 ? "Perfect! A true discerning spirit!" : pct >= 60 ? "Good discernment — keep studying!" : "Keep learning the Word — discernment takes practice.")}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { saveScore(); startGame(); }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> {mode === "theologian" ? "Try Again" : "Play Again"}
          </button>
          <button
            onClick={() => { setRound(null); setGameOver(false); setMode("normal"); }}
            className="px-6 py-2.5 rounded-xl border border-border font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Change Mode
          </button>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (fetchError && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-sm mx-auto text-center">
        <XCircle className="w-10 h-10 text-destructive" />
        <p className="font-body text-sm text-destructive font-semibold">{fetchError}</p>
        <button
          onClick={() => fetchRound(usedTopics)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="font-body text-sm text-muted-foreground">Generating round {questionNum}...</p>
      </div>
    );
  }

  // Game round
  const correctIdx = round.statements.findIndex((s) => s.is_false);
  const userWasRight = confirmed && selected !== null && round.statements[selected].is_false;

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-body text-xs text-muted-foreground">Round {questionNum} of {activeTotal}</span>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <span className="font-body text-xs font-semibold text-accent">🔥 {streak} streak</span>
          )}
          <span className="font-body text-sm font-semibold text-foreground">{score} pts</span>
          <button
            onClick={() => { setRound(null); setGameOver(false); setScore(0); setQuestionNum(0); setStreak(0); setConfirmed(false); setUsedTopics([]); }}
            className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>
      <div className="w-full bg-secondary rounded-full h-1.5 mb-6">
      <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${((questionNum - 1) / activeTotal) * 100}%` }} />
      </div>

      <div className="mb-2">
        <span className="inline-block px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-body text-xs font-semibold mb-3">
          {round.topic}
        </span>
        <p className="font-body text-sm font-semibold text-foreground mb-1">Which statement is a <span className="text-destructive">false teaching?</span></p>
        <p className="font-body text-xs text-muted-foreground">Select the heretical or doctrinally incorrect statement</p>
      </div>

      <div className="space-y-3 mt-4">
        {round.statements.map((stmt, idx) => {
          let style = "border-border hover:border-accent/40 cursor-pointer";
          let icon = null;
          if (confirmed) {
            if (idx === correctIdx) {
              style = "border-green-500 bg-green-500/10";
              icon = <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />;
            } else if (idx === selected && !stmt.is_false) {
              style = "border-destructive bg-destructive/10";
              icon = <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
            } else {
              style = "border-border bg-secondary/30 opacity-60";
            }
          } else if (selected === idx) {
            style = "border-accent bg-accent/10 ring-2 ring-accent/30";
          }
          return (
            <motion.button
              key={idx}
              onClick={() => handleSelect(idx)}
              whileTap={!confirmed ? { scale: 0.98 } : {}}
              disabled={confirmed}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${style}`}
            >
              <span className="font-body text-xs font-bold text-muted-foreground mt-0.5 w-5 flex-shrink-0">{String.fromCharCode(65 + idx)}.</span>
              <span className="font-body text-sm text-foreground leading-relaxed flex-1">{stmt.text}</span>
              {icon}
            </motion.button>
          );
        })}
      </div>

      {/* Confirm button */}
      {!confirmed && (
        <button
          onClick={handleConfirm}
          disabled={selected === null}
          className="w-full mt-5 py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Answer
        </button>
      )}

      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 rounded-xl bg-secondary border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              {userWasRight
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <XCircle className="w-4 h-4 text-destructive" />}
              <span className={`font-body text-sm font-semibold ${userWasRight ? "text-green-500" : "text-destructive"}`}>
                {userWasRight ? "Correct! +1 point" : "Not quite!"}
              </span>
            </div>
            <p className="font-body text-xs text-foreground/80 leading-relaxed">{round.explanation}</p>
            <button
              onClick={handleNext}
              className="mt-3 flex items-center gap-1.5 font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              {questionNum >= activeTotal ? "See Results" : "Next Round"} <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}