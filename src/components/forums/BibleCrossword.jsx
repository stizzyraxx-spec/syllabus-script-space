import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, RefreshCw, ChevronRight } from "lucide-react";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Beginner", clueCount: 6 },
  { value: "medium", label: "Intermediate", clueCount: 10 },
  { value: "hard", label: "Advanced", clueCount: 15 },
];

const BIBLE_CROSSWORDS = [
  {
    difficulty: "easy",
    grid: [
      ["J", "O", "N", "A", "H"],
      ["O", "_", "O", "_", "H"],
      ["N", "O", "A", "H", "S"],
      ["A", "_", "_", "_", "_"],
      ["H", "S", "S", "S", "S"]
    ],
    across: [
      { num: 1, clue: "A man swallowed by a whale", answer: "JONAH", start: [0, 0], length: 5, direction: "across" },
      { num: 3, clue: "Built an ark (__ and the Flood)", answer: "NOAH", start: [2, 0], length: 4, direction: "across" }
    ],
    down: [
      { num: 1, clue: "Jesus walked on water in this sea", answer: "GALILEE", start: [0, 0], length: 7, direction: "down" },
      { num: 5, clue: "Mount where Moses got the Ten Commandments", answer: "SINAI", start: [0, 4], length: 5, direction: "down" }
    ]
  },
  {
    difficulty: "medium",
    grid: [
      ["D", "A", "V", "I", "D", "_", "_"],
      ["A", "_", "_", "_", "E", "_", "_"],
      ["V", "_", "_", "_", "U", "_", "_"],
      ["I", "_", "_", "_", "E", "_", "_"],
      ["D", "E", "U", "E", "L", "_", "_"]
    ],
    across: [
      { num: 1, clue: "King of Israel who defeated Goliath", answer: "DAVID", start: [0, 0], length: 5, direction: "across" },
      { num: 5, clue: "Disciple also known as 'the twin'", answer: "THOMAS", start: [4, 0], length: 6, direction: "across" }
    ],
    down: [
      { num: 1, clue: "Groom's promise during marriage", answer: "DEVOTION", start: [0, 0], length: 8, direction: "down" },
      { num: 2, clue: "First book of the Bible", answer: "GENESIS", start: [0, 1], length: 7, direction: "down" }
    ]
  },
  {
    difficulty: "hard",
    grid: [
      ["M", "A", "T", "T", "H", "E", "W"],
      ["A", "_", "_", "_", "_", "_", "_"],
      ["T", "_", "_", "_", "_", "_", "_"],
      ["T", "_", "_", "_", "_", "_", "_"],
      ["H", "_", "_", "_", "_", "_", "_"],
      ["E", "_", "_", "_", "_", "_", "_"],
      ["W", "_", "_", "_", "_", "_", "_"]
    ],
    across: [
      { num: 1, clue: "Gospel writer and apostle", answer: "MATTHEW", start: [0, 0], length: 7, direction: "across" },
      { num: 8, clue: "The Son of God", answer: "JESUS", start: [1, 0], length: 5, direction: "across" },
      { num: 13, clue: "City of Jesus's birth", answer: "BETHLEHEM", start: [2, 0], length: 9, direction: "across" }
    ],
    down: [
      { num: 1, clue: "First of the four gospels", answer: "MATTHEW", start: [0, 0], length: 7, direction: "down" },
      { num: 2, clue: "Judean wilderness where Jesus was tested", answer: "DESERT", start: [0, 1], length: 6, direction: "down" }
    ]
  }
];

export default function BibleCrossword() {
  const [difficulty, setDifficulty] = useState("easy");
  const [gameState, setGameState] = useState("setup"); // setup, playing, results
  const [crossword, setCrossword] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const { awardPoints } = useAwardPoints();

  const startGame = () => {
    setLoading(true);
    setUserAnswers({});
    setScore(0);

    const selectedCrossword = BIBLE_CROSSWORDS.find(c => c.difficulty === difficulty);
    setCrossword(selectedCrossword);
    setGameState("playing");
    setLoading(false);
  };

  const handleAnswer = async (clueNum, direction, value) => {
    const key = `${clueNum}-${direction}`;
    const updatedAnswers = {
      ...userAnswers,
      [key]: value.toUpperCase()
    };
    setUserAnswers(updatedAnswers);

    // Check if this answer is correct and award points immediately
    const allClues = [...crossword.across, ...crossword.down];
    const clue = allClues.find(c => c.num.toString() === clueNum.toString() && c.direction === direction);
    
    // Only award points once per correct answer
    if (clue && updatedAnswers[key] === clue.answer && userAnswers[key] !== clue.answer) {
      const user = await db.auth.me().catch(() => null);
      if (user) {
        await awardPoints(user.email, "crossword");
        toast.success("✨ +1 point for correct answer!");
      }
    }
  };

  const checkAnswers = async () => {
    let correct = 0;
    const allClues = [...crossword.across, ...crossword.down];

    allClues.forEach(clue => {
      const key = `${clue.num}-${clue.direction}`;
      const userAnswer = userAnswers[key] || "";
      if (userAnswer === clue.answer) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / allClues.length) * 100);
    setScore(finalScore);
    setGameState("results");

    try {
      const currentUser = await db.auth.me().catch(() => null);
      if (currentUser) {
        await db.entities.GameScore.create({
          player_email: currentUser.email,
          player_name: currentUser.full_name,
          game_type: "crossword",
          score: finalScore,
          difficulty
        });
        toast.success(`✨ Great job! ${correct}/${allClues.length} correct!`);
      }
    } catch (error) {
      console.error("Failed to save crossword score:", error);
    }
  };

  const resetGame = () => {
    setGameState("setup");
    setDifficulty("easy");
    setCrossword(null);
    setUserAnswers({});
    setScore(0);
  };

  // Setup screen
  if (gameState === "setup") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✝️</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Bible Crossword</h2>
          <p className="font-body text-sm text-muted-foreground">
            Fill in the answers to biblical clues. Test your Scripture knowledge!
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card space-y-6">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Difficulty
            </p>
            <div className="flex flex-wrap gap-3">
              {DIFFICULTY_LEVELS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`px-4 py-2.5 rounded-lg border font-body text-sm font-medium transition-all ${
                    difficulty === d.value
                      ? "bg-accent/10 text-accent border-accent/30"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  <p className="font-semibold">{d.label}</p>
                  <p className="text-xs">{d.clueCount} clues</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="font-body text-sm text-muted-foreground">Loading crossword...</p>
      </div>
    );
  }

  // Results
  if (gameState === "results") {
    const allClues = [...crossword.across, ...crossword.down];
    const correctCount = Object.keys(userAnswers).filter(key => {
      const [clueNum, direction] = key.split("-");
      const clue = allClues.find(c => c.num.toString() === clueNum && c.direction === direction);
      return clue && userAnswers[key] === clue.answer;
    }).length;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✝️</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Puzzle Complete!</h2>
        <p className="font-body text-muted-foreground text-sm mb-6">You solved {correctCount} out of {allClues.length} clues</p>
        <div className="text-5xl font-display font-bold text-accent mb-2">{score}%</div>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {score === 100 ? "Perfect! Biblical mastery!" : score >= 75 ? "Excellent knowledge!" : score >= 50 ? "Good effort!" : "Keep studying Scripture!"}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </motion.div>
    );
  }

  // Playing
  const allClues = [...crossword.across, ...crossword.down];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="font-body text-xs font-semibold uppercase text-muted-foreground mb-3">Crossword Grid</p>
            <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded inline-block">
              {crossword.grid.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`w-7 h-7 border border-gray-400 flex items-center justify-center text-xs font-bold ${
                        cell === "_" ? "bg-gray-400 dark:bg-gray-600" : "bg-white dark:bg-gray-900 text-foreground"
                      }`}
                    >
                      {cell !== "_" ? cell : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Across */}
          <div>
            <p className="font-body text-sm font-semibold text-foreground mb-3">ACROSS</p>
            <div className="space-y-3">
              {crossword.across.map((clue) => {
                const key = `${clue.num}-across`;
                const userAnswer = userAnswers[key] || "";
                const isCorrect = userAnswer === clue.answer;
                const isAnswered = userAnswer.length > 0;

                return (
                  <div key={key} className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">
                          {clue.num}. {clue.clue}
                        </p>
                      </div>
                      {isAnswered && (isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />)}
                    </div>
                    <input
                      type="text"
                      maxLength={clue.length}
                      value={userAnswer}
                      onChange={(e) => handleAnswer(clue.num, "across", e.target.value)}
                      placeholder={"_".repeat(clue.length)}
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground font-body text-sm font-mono outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Down */}
          <div>
            <p className="font-body text-sm font-semibold text-foreground mb-3">DOWN</p>
            <div className="space-y-3">
              {crossword.down.map((clue) => {
                const key = `${clue.num}-down`;
                const userAnswer = userAnswers[key] || "";
                const isCorrect = userAnswer === clue.answer;
                const isAnswered = userAnswer.length > 0;

                return (
                  <div key={key} className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">
                          {clue.num}. {clue.clue}
                        </p>
                      </div>
                      {isAnswered && (isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />)}
                    </div>
                    <input
                      type="text"
                      maxLength={clue.length}
                      value={userAnswer}
                      onChange={(e) => handleAnswer(clue.num, "down", e.target.value)}
                      placeholder={"_".repeat(clue.length)}
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground font-body text-sm font-mono outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={checkAnswers}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            Check Answers
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}