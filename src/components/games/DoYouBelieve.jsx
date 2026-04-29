import React, { useState } from 'react';
import { db } from '@/api/supabaseClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Lightbulb, CheckCircle2, XCircle, Loader2, RotateCcw, RefreshCw } from 'lucide-react';
import ShareButton from '@/components/shared/ShareButton';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: 'bg-green-500/10 text-green-600 border-green-200' },
  { id: 'intermediate', label: 'Intermediate', color: 'bg-accent/10 text-accent border-accent/30' },
  { id: 'advanced', label: 'Advanced', color: 'bg-red-500/10 text-red-600 border-red-200' },
  { id: 'theologian', label: '🔬 Theologian Mode', color: 'bg-amber-600/20 text-amber-600 border-amber-700' },
];

const QUESTION_COUNTS = [5, 10, 15, 25, 50];

export default function DoYouBelieve() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [finished, setFinished] = useState(false);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['belief-questions', difficulty, questionCount],
    queryFn: async () => {
      if (!difficulty || !questionCount) return [];
      const res = await db.functions.invoke('generateBeliefQuestions', {
        difficulty,
        count: questionCount,
      });
      return res.data?.questions || [];
    },
    enabled: !!difficulty && !!questionCount,
  });

  const handleStartQuiz = (diff, count) => {
    setDifficulty(diff);
    setQuestionCount(count);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setConfirmed(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  const handleSelectAnswer = (index) => {
    if (confirmed) return;
    setSelectedAnswer(index);
  };

  const handleConfirm = () => {
    if (selectedAnswer === null || confirmed) return;
    setConfirmed(true);
    const q = questions[currentIndex];
    const isCorrect = selectedAnswer === q.correct_index;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setAnswers((a) => [...a, {
      question: q.question,
      options: q.options,
      selected: selectedAnswer,
      correct: q.correct_index,
      reasoning: q.reasoning,
      isCorrect,
    }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((c) => c + 1);
      setSelectedAnswer(null);
      setConfirmed(false);
    }
  };

  const handleReset = () => {
    setDifficulty(null);
    setQuestionCount(null);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setConfirmed(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  // Settings screen
  if (!difficulty || !questionCount) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-6 h-6 text-accent" />
          <h2 className="font-display text-2xl font-bold text-foreground">Do You Believe?</h2>
        </div>
        <p className="font-body text-muted-foreground text-sm mb-8">
          Explore the logical case for faith through historical evidence and philosophical reasoning.
        </p>

        <div className="p-6 rounded-xl border border-border bg-card space-y-6">
          {/* Difficulty */}
          <div>
            <p className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Difficulty</p>
            <div className="flex flex-wrap gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`px-4 py-2 rounded-lg border font-body text-sm font-medium transition-all ${
                    difficulty === d.id ? d.color + ' ring-2 ring-offset-1 ring-accent/40' : 'border-border text-muted-foreground hover:border-accent/40'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {difficulty === 'intermediate' && (
              <p className="mt-2 font-body text-xs text-accent">
                📚 Deeper philosophical reasoning and nuanced arguments about faith.
              </p>
            )}
            {difficulty === 'advanced' && (
              <p className="mt-2 font-body text-xs text-red-600 dark:text-red-400">
                🔥 Complex logic and sophisticated philosophical challenges to skepticism.
              </p>
            )}
            {difficulty === 'theologian' && (
              <p className="mt-2 font-body text-xs text-amber-700 dark:text-amber-400">
                🔬 Theologian Mode: Extremely challenging arguments with nuanced reasoning. These questions explore cutting-edge scholarly debates and complex historical evidence. Only for serious students of apologetics.
              </p>
            )}
          </div>

          {/* Question Count */}
          {difficulty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Number of Questions</p>
              <div className="flex flex-wrap gap-2">
                {QUESTION_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => handleStartQuiz(difficulty, n)}
                    className={`px-4 py-2 rounded-lg border font-body text-sm font-medium transition-all ${
                      questionCount === n
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-accent/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="font-body text-muted-foreground text-sm">Preparing {questionCount} questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-body text-muted-foreground text-sm mb-4">Failed to load questions.</p>
        <button onClick={handleReset} className="bg-accent text-accent-foreground font-body text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/90 transition-colors">
          Back to Settings
        </button>
      </div>
    );
  }

  // Results screen
  if (finished) {
    const pct = score / questions.length;
    let resultText, resultSub;
    
    if (difficulty === 'theologian') {
      if (pct === 1) { resultText = 'Scholar Level! 🔬'; resultSub = 'You demonstrated mastery of advanced apologetic arguments.'; }
      else if (pct >= 0.75) { resultText = 'Impressive! 📚'; resultSub = 'You grasp the nuances of sophisticated theological reasoning.'; }
      else if (pct >= 0.5) { resultText = 'Solid Foundation 🎓'; resultSub = 'You understand key arguments; continue studying scholarly debates.'; }
      else { resultText = 'Challenging Territory 💭'; resultSub = 'These arguments occupy lifetime scholars; deeper study awaits.'; }
    } else {
      resultText = pct === 1
        ? 'Perfect Reasoning! 🎯'
        : pct >= 0.8
        ? 'Excellent! ⭐'
        : pct >= 0.6
        ? 'Good Understanding 📖'
        : 'Keep Exploring 💭';
      resultSub = pct === 1
        ? 'You recognized the logical strength of evidence supporting faith.'
        : 'Consider how historical accuracy and reasoning point toward truth.';
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-4">
        <div className="text-center p-8 rounded-xl border border-border bg-card mb-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-1">{resultText}</h2>
          <p className="font-body text-muted-foreground text-sm mb-4">{resultSub}</p>
          <div className="text-5xl font-display font-bold text-accent mb-2">
            {score}<span className="text-2xl text-muted-foreground">/{questions.length}</span>
          </div>
          <p className="font-body text-xs text-muted-foreground mb-6">
            {DIFFICULTIES.find(d => d.id === difficulty)?.label}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <ShareButton
              title="Do You Believe Challenge"
              text={`I scored ${score}/${questions.length} on Do You Believe? Can you beat my score? 🧠`}
              url={window.location.origin + '/forums'}
            />
            <button
              onClick={() => handleStartQuiz(difficulty, questionCount)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-xs font-semibold hover:bg-accent/90 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Play Again
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Change Settings
            </button>
          </div>
        </div>

        {/* Answer review */}
        <h3 className="font-display text-lg font-bold mb-4 text-foreground">Review Answers</h3>
        <div className="space-y-4">
          {answers.map((a, i) => (
            <div key={i} className={`p-5 rounded-xl border ${a.isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}`}>
              <div className="flex items-start gap-3">
                {a.isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="font-body text-sm font-semibold text-foreground mb-2">{a.question}</p>
                  {!a.isCorrect && (
                    <p className="font-body text-xs text-red-600 mb-1">
                      Your answer: {a.options[a.selected]}
                    </p>
                  )}
                  <p className="font-body text-xs text-green-700 dark:text-green-400 mb-2">
                    Correct: {a.options[a.correct]}
                  </p>
                  <p className="font-body text-xs text-muted-foreground italic">{a.reasoning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Quiz screen
  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="py-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
        <div className="flex items-center gap-3">
          <span className="font-body text-xs font-semibold text-accent">Score: {score}</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>
      <div className="w-full bg-secondary rounded-full h-1.5 mb-8">
        <div
          className="bg-accent h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <div className="p-6 rounded-xl border border-border bg-card mb-6">
            <p className="font-display text-lg font-bold text-foreground leading-snug">{q.question}</p>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let style = 'border-border hover:border-accent/40 text-foreground cursor-pointer';
              if (selectedAnswer === idx && !confirmed) {
                style = 'border-accent bg-accent/10 text-accent ring-2 ring-accent/30';
              }
              if (confirmed) {
                if (idx === q.correct_index) style = 'border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700';
                else if (idx === selectedAnswer) style = 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600';
                else style = 'border-border text-muted-foreground opacity-50';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={confirmed}
                  className={`w-full text-left p-4 rounded-xl border font-body text-sm transition-all duration-200 flex items-center justify-between gap-3 ${style}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-bold text-xs flex-shrink-0 w-5">{String.fromCharCode(65 + idx)}.</span>
                    <span className="leading-snug">{opt}</span>
                  </div>
                  {confirmed && idx === q.correct_index && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
                  {confirmed && selectedAnswer === idx && idx !== q.correct_index && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Confirm / Next buttons */}
          <div className="mt-5 flex gap-3">
            {!confirmed ? (
              <button
                onClick={handleConfirm}
                disabled={selectedAnswer === null}
                className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Answer
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-secondary border border-border">
                  <p className="font-body text-sm text-muted-foreground italic"><strong>Why:</strong> {q.reasoning}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}