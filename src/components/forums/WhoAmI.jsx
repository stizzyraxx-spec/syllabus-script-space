import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, XCircle, RefreshCw, ChevronRight, Users, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";

const DIFFICULTIES = [
  { value: "easy", label: "Beginner", desc: "Famous biblical figures" },
  { value: "medium", label: "Intermediate", desc: "Well-known characters" },
  { value: "hard", label: "Advanced", desc: "Obscure biblical figures" },
];

export default function WhoAmI({ user }) {
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(7);
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usedHints, setUsedHints] = useState(new Set());
  const { awardPoints } = useAwardPoints();

  const fetchQuestions = async () => {
    setLoading(true);
    setQuestions(null);
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
    setUsedHints(new Set());

    try {
      const res = await base44.functions.invoke("generateWhoAmIQuestions", {
        count: questionCount,
        difficulty,
      });
      setQuestions(res.data?.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load Who Am I questions");
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

    const q = questions[current];
    const isCorrect = selected === q.correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
      if (user) {
        await awardPoints(user.email, "who_am_i");
        toast.success("✨ Correct! +1 point");
      }
    } else {
      toast.error("Not quite — check the answer below");
    }

    setAnswers((a) => [...a, {
      clues: q.clues,
      options: q.options,
      selected,
      correct: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    }]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      saveScore(score);
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
      setUsedHints(new Set());
    }
  };

  const saveScore = async (finalScore) => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        await base44.entities.GameScore.create({
          player_email: currentUser.email,
          player_name: currentUser.full_name,
          game_type: "who_am_i",
          score: finalScore,
          difficulty,
        });
      }
    } catch (error) {
      console.error("Failed to save Who Am I score:", error);
    }
  };

  if (!questions && !loading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Who Am I?</h2>
          <p className="font-body text-sm text-muted-foreground">
            Read the clues and guess which biblical figure you are!
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
              {[5, 7, 10, 15].map((n) => (
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
            <Users className="w-4 h-4" />
            Start Game ({questionCount} Questions)
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="font-body text-muted-foreground text-sm">Generating Who Am I questions...</p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Game Complete!</h2>
        <p className="font-body text-muted-foreground text-sm mb-6">
          You identified {score} out of {questions.length} figures correctly.
        </p>
        <div className="text-5xl font-display font-bold text-accent mb-2">
          {pct}%
        </div>
        <p className="font-body text-xs text-muted-foreground mb-8">
          {pct === 100 ? "Biblical scholar!" : pct >= 80 ? "Excellent biblical knowledge!" : pct >= 60 ? "Good understanding!" : "Keep learning Scripture!"}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => fetchQuestions()}
            className="flex-1 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Play Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-body text-muted-foreground text-sm mb-4">No questions available.</p>
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
        <p className="font-body text-xs font-semibold text-accent mb-3 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> CLUES
        </p>
        <ul className="space-y-2">
          {q.clues.map((clue, i) => (
            <li key={i} className="font-body text-sm text-foreground">
              • {clue}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 mb-6">
        {q.options.map((option, idx) => {
          let style = "border-border hover:border-accent/40 cursor-pointer";
          let icon = null;

          if (confirmed) {
            if (idx === q.correctIndex) {
              style = "border-green-400 bg-green-50 dark:bg-green-950/30";
              icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
            } else if (idx === selected) {
              style = "border-red-400 bg-red-50 dark:bg-red-950/30";
              icon = <XCircle className="w-5 h-5 text-red-500" />;
            } else {
              style = "border-border opacity-50";
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
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${style}`}
            >
              <span className="font-body text-sm text-foreground">{option}</span>
              {icon}
            </motion.button>
          );
        })}
      </div>

      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={selected === null}
          className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Answer
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-secondary border border-border"
        >
          <p className="font-body text-sm text-foreground italic mb-3">{q.explanation}</p>
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {current + 1 >= questions.length ? "See Results" : "Next Question"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}