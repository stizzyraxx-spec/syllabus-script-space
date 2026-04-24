import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, HelpCircle, CheckCircle2, XCircle } from "lucide-react";

export default function MissionTypeTimedChallenge({ mission, onMissionComplete }) {
  const [timeLeft, setTimeLeft] = useState(mission.timeLimit);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const timerRunning = timeLeft > 0 && !submitted;

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      setSubmitted(true);
      setIsCorrect(false);
    }
  }, [timeLeft, submitted]);

  const handleSubmit = () => {
    const normalizedAnswer = answer.toLowerCase().trim();
    const normalizedCorrect = mission.correctAnswer.toLowerCase().trim();
    const correct = normalizedAnswer === normalizedCorrect;
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      setTimeout(() => {
        onMissionComplete({
          ...mission.scoreChanges,
          xp: mission.reward_xp,
        });
      }, 1500);
    }
  };

  const showNextHint = () => {
    if (hintIndex < mission.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center justify-center mb-6 p-6 rounded-xl border-2 ${
          timeLeft <= 10
            ? "border-red-500 bg-red-500/10"
            : "border-accent bg-accent/10"
        }`}
      >
        <Clock className={`w-6 h-6 mr-3 ${timeLeft <= 10 ? "text-red-500" : "text-accent"}`} />
        <div className="text-center">
          <p className="text-white/60 text-xs uppercase tracking-wider">Time Remaining</p>
          <motion.p
            key={Math.floor(timeLeft / 10)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`font-display text-4xl font-bold ${
              timeLeft <= 10 ? "text-red-500" : "text-accent"
            }`}
          >
            {timeLeft}s
          </motion.p>
        </div>
      </motion.div>

      {/* Challenge narrative */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/80 border border-white/20 rounded-xl p-6 mb-6"
      >
        <p className="text-white/70 text-sm leading-relaxed mb-4">
          {mission.narrative}
        </p>
        <div className="bg-slate-700/50 border border-accent/30 rounded-lg p-4">
          <p className="font-body font-semibold text-white text-center text-lg">
            {mission.challenge}
          </p>
        </div>
      </motion.div>

      {/* Hint button */}
      {!submitted && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowHint(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/20 hover:border-accent/40 text-white/70 hover:text-accent transition-colors text-sm font-body"
          >
            <HelpCircle className="w-4 h-4" />
            Hint ({hintIndex + 1}/{mission.hints.length})
          </button>
        </div>
      )}

      {/* Hint display */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4"
          >
            <p className="text-yellow-200 text-sm font-body">
              💡 {mission.hints[hintIndex]}
            </p>
            {hintIndex < mission.hints.length - 1 && (
              <button
                onClick={showNextHint}
                className="mt-2 text-xs text-yellow-300 hover:text-yellow-200 font-semibold"
              >
                Next hint →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer input */}
      {!submitted && (
        <div className="mb-6">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/20 text-white placeholder-white/40 focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-xl border-2 mb-6 ${
              isCorrect
                ? "border-green-500 bg-green-500/10"
                : "border-red-500 bg-red-500/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <p className="font-display text-xl font-bold text-green-400">
                    Correct!
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-500" />
                  <p className="font-display text-xl font-bold text-red-400">
                    Time's up!
                  </p>
                </>
              )}
            </div>
            <p className="text-white/70 text-sm">
              {isCorrect ? mission.successMessage : mission.failureMessage}
            </p>
            {!isCorrect && (
              <p className="text-white/60 text-xs mt-2">
                The answer was: <span className="text-accent font-semibold">{mission.correctAnswer}</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="w-full py-3 rounded-xl bg-accent text-primary font-body font-bold hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
}