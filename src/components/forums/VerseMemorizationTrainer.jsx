import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, XCircle, RefreshCw, ChevronRight, Brain, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";

const DIFFICULTIES = [
  { value: "easy", label: "Beginner", desc: "First 10 words of famous verses" },
  { value: "medium", label: "Intermediate", desc: "Up to 30 words from key passages" },
  { value: "hard", label: "Advanced", desc: "Complete verses from memory" },
];

// Normalize a string: lowercase, strip punctuation, collapse whitespace
const normalize = (str) =>
  str.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

// Return similarity 0-1 based on shared words
const similarity = (a, b) => {
  const wordsA = normalize(a).split(" ");
  const wordsB = normalize(b).split(" ");
  const setB = new Set(wordsB);
  const matches = wordsA.filter((w) => setB.has(w)).length;
  return matches / Math.max(wordsA.length, wordsB.length);
};

export default function VerseMemorizationTrainer({ user }) {
  const [difficulty, setDifficulty] = useState("easy");
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const { awardPoints } = useAwardPoints();

  const fetchQuestions = async () => {
    setLoading(true);
    setQuestions(null);
    setCurrent(0);
    setUserAnswer("");
    setScore(0);
    setAnswers([]);
    setFinished(false);

    try {
      const res = await base44.functions.invoke("generateMemorizationQuestions", {
        count: questionCount,
        difficulty,
      });
      setQuestions(res.data?.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load memorization questions");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !questions) return;

    const q = questions[current];
    const sim = similarity(userAnswer, q.answer);
    const correct = sim >= 0.75; // 75% word overlap = correct

    if (correct) {
      setScore((s) => s + 1);
      if (user) {
        await awardPoints(user.email, "memorization");
        toast.success("✨ Perfect! +1 point");
      }
    } else {
      toast.error("Not quite — see the correction below");
    }

    setAnswers((a) => [...a, {
      reference: q.reference,
      prompt: q.prompt,
      userAnswer,
      correct: q.answer,
      isCorrect: correct,
      context: q.context,
    }]);

    if (current + 1 >= questions.length) {
      saveScore(score + (correct ? 1 : 0));
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setUserAnswer("");
    }
  };

  const saveScore = async (finalScore) => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        await base44.entities.GameScore.create({
          player_email: currentUser.email,
          player_name: currentUser.full_name,
          game_type: "memorization",
          score: finalScore,
          difficulty,
        });
      }
    } catch (error) {
      console.error("Failed to save memorization score:", error);
    }
  };

  if (!questions && !loading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-7 h-7 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Verse Memorization Trainer</h2>
          <p className="font-body text-sm text-muted-foreground">
            Commit Scripture to memory. Type the missing words or complete verses.
          </p>
        </div>

        <div className="space-y-6">
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

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Number of Questions</p>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`px-4 py-2 rounded-lg border font-body text-sm font-medium transition-all ${
                    questionCount === n
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchQuestions}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Start Training ({questionCount} Questions)
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="font-body text-muted-foreground text-sm">Generating memorization questions...</p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Training Complete!</h2>
        <p className="font-body text-muted-foreground text-sm mb-6">
          You memorized {score} out of {questions.length} verses correctly.
        </p>
        <div className="text-5xl font-display font-bold text-accent mb-2">
          {pct}%
        </div>
        <p className="font-body text-xs text-muted-foreground mb-8">
          {pct === 100 ? "Perfect recall — incredible!" : pct >= 80 ? "Strong memory work!" : pct >= 60 ? "Good progress — keep practicing!" : "Keep memorizing — consistency builds recall!"}
        </p>

        <div className="space-y-4 mb-6">
          {answers.map((a, i) => (
            <div key={i} className={`p-4 rounded-xl border text-left ${a.isCorrect ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
              <p className="font-body text-xs text-muted-foreground mb-1">{a.reference}</p>
              <p className="font-body text-sm font-semibold text-foreground mb-2 italic">"{a.prompt}..."</p>
              {!a.isCorrect && (
                <div className="mb-2">
                  <p className="font-body text-xs text-red-600 mb-1">Your answer: <span className="italic">"{a.userAnswer}"</span></p>
                  <p className="font-body text-xs text-green-700 dark:text-green-400">Correct: <span className="italic">"{a.correct}"</span></p>
                </div>
              )}
              {a.context && <p className="font-body text-xs text-muted-foreground italic">{a.context}</p>}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => fetchQuestions()}
            className="flex-1 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Train Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-body text-muted-foreground text-sm mb-4">No questions available. Try different settings.</p>
        <button
          onClick={() => setQuestions(null)}
          className="bg-accent text-accent-foreground font-body text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/90 transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="flex items-center justify-between mb-6">
        <span className="font-body text-xs text-muted-foreground">Question {current + 1} of {questions.length}</span>
        <div className="flex items-center gap-3">
          <span className="font-body text-xs font-semibold text-accent">Score: {score}</span>
          <button
            onClick={() => setQuestions(null)}
            className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      <div className="w-full bg-secondary rounded-full h-1.5 mb-8">
        <div
          className="bg-accent h-1.5 rounded-full transition-all"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6 rounded-xl border border-border bg-card mb-6">
        <p className="font-body text-xs text-muted-foreground mb-2">{q.reference}</p>
        <p className="font-display text-lg italic text-foreground leading-relaxed">
          "{q.prompt} <span className="text-accent font-bold">___________"</span>
        </p>
      </div>

      <div>
        <textarea
          autoFocus
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && e.ctrlKey && handleSubmit()}
          placeholder="Type the missing words or complete the verse..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent min-h-[100px]"
        />
        <p className="font-body text-xs text-muted-foreground mt-2">Hint: {q.hint}</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!userAnswer.trim()}
        className="w-full mt-5 py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" /> Submit Answer (Ctrl+Enter)
      </button>
    </div>
  );
}