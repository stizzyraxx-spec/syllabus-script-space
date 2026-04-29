import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RefreshCw, Loader2, CheckCircle2, XCircle, ChevronRight, Zap } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";



const DIFFICULTIES = [
  { value: "easy", label: "Beginner", color: "bg-green-500/10 text-green-600 border-green-200" },
  { value: "medium", label: "Intermediate", color: "bg-accent/10 text-accent border-accent/30" },
  { value: "hard", label: "Advanced", color: "bg-red-500/10 text-red-600 border-red-200" },
  { value: "super_hard", label: "⚡ Super Hard", color: "bg-purple-500/10 text-purple-600 border-purple-300" },
  { value: "theologian", label: "🔬 Theologian", color: "bg-amber-600/20 text-amber-600 border-amber-700" },
];

const BIBLE_BOOKS = [
  // Old Testament
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1 Samuel","2 Samuel",
  "1 Kings","2 Kings","1 Chronicles","2 Chronicles",
  "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs",
  "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah",
  "Haggai","Zechariah","Malachi",
  // New Testament
  "Matthew","Mark","Luke","John","Acts","Romans",
  "1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John","3 John",
  "Jude","Revelation",
];

const CATEGORIES = [
  { value: "any", label: "All Topics" },
  { value: "old_testament", label: "Old Testament" },
  { value: "new_testament", label: "New Testament" },
  { value: "prophecy", label: "Prophecy" },
  { value: "people", label: "People of the Bible" },
  { value: "geography", label: "Places & Geography" },
];



export default function BibleTrivia({ user }) {
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("any");
  const [specificBook, setSpecificBook] = useState("");  // empty = no specific book
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const { awardPoints } = useAwardPoints();

  const fetchQuiz = async (count = questionCount, diff = difficulty, cat = category, book = specificBook) => {
    setLoading(true);
    setQuestions(null);
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);

    const res = await db.functions.invoke("generateTriviaQuestions", { count, difficulty: diff, category: cat, specificBook: book });
    const generated = res.data?.questions || [];
    setQuestions(generated.length > 0 ? generated : null);
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
    const isCorrect = selected === q.correct_index;
    if (isCorrect) {
      setScore((s) => s + 1);
      if (user) {
        await awardPoints(user.email, "trivia");
        toast.success("✨ +1 point for correct answer!");
      }
    }
    setAnswers((a) => [...a, {
      question: q.question,
      options: q.options,
      selected,
      correct: q.correct_index,
      explanation: q.explanation,
      isCorrect,
    }]);
  };

  const saveScore = async (finalScore) => {
    try {
      const currentUser = await db.auth.me();
      if (currentUser) {
        await db.entities.GameScore.create({
          player_email: currentUser.email,
          player_name: currentUser.full_name,
          game_type: "bible_trivia",
          score: finalScore,
          difficulty,
        });
      }
    } catch (error) {
      console.error("Failed to save trivia score:", error);
    }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      saveScore(score);
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
    }
  };

  const handleReset = () => {
    setQuestions(null);
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
  };

  const scoreLabel = () => {
    const pct = score / questions.length;
    if (difficulty === "theologian") {
      if (pct === 1) return { text: "Brilliant! 🔬", sub: "You think like a biblical scholar!" };
      if (pct >= 0.8) return { text: "Exceptional! 📚", sub: "Deep knowledge of textual criticism and theology." };
      if (pct >= 0.6) return { text: "Strong Foundation 🎓", sub: "Continue exploring advanced biblical scholarship." };
      return { text: "Challenging Topics 💭", sub: "These debates occupy scholars for lifetimes." };
    }
    if (pct === 1) return { text: "Perfect Score! 🏆", sub: "Exceptional knowledge of the Word!" };
    if (pct >= 0.8) return { text: "Excellent! ⭐", sub: "You know your Scripture well." };
    if (pct >= 0.6) return { text: "Good Job! 📖", sub: "Keep studying and growing." };
    return { text: "Keep Practicing! 💪", sub: "Every question is a chance to learn." };
  };

  // Setup screen
  if (!questions && !loading) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-6 h-6 text-accent" />
          <h2 className="font-display text-2xl font-bold text-foreground">Bible Trivia</h2>
        </div>
        <p className="font-body text-muted-foreground text-sm mb-8">
          Test your knowledge of Scripture. Every quiz is uniquely generated — no two quizzes are the same!
        </p>

        <div className="p-6 rounded-xl border border-border bg-card space-y-6">
          {/* Difficulty */}
          <div>
            <p className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Difficulty</p>
            <div className="flex flex-wrap gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`px-4 py-2 rounded-lg border font-body text-sm font-medium transition-all ${
                    difficulty === d.value ? d.color + " ring-2 ring-offset-1 ring-accent/40" : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {difficulty === "medium" && (
              <p className="mt-2 font-body text-xs text-accent">
                🔀 Intermediate: parallel verses across books, unfulfilled prophecies, and moral dilemmas from Scripture.
              </p>
            )}
            {difficulty === "hard" && (
              <p className="mt-2 font-body text-xs text-red-600 dark:text-red-400">
                🔥 Advanced: deep cross-book typology, contested eschatological prophecy, and nuanced moral theology. Requires serious Bible knowledge.
              </p>
            )}
            {difficulty === "super_hard" && (
              <p className="mt-2 font-body text-xs text-purple-600 dark:text-purple-400">
                ⚡ Super Hard: obscure names, exact numbers, rare verses — most pastors won't know these!
              </p>
            )}
            {difficulty === "theologian" && (
              <p className="mt-2 font-body text-xs text-amber-700 dark:text-amber-400">
                🔬 Theologian: Advanced questions on textual criticism, artifacts (Dead Sea Scrolls, Tel Dan Stele), manuscript variants, and theological debates. For scholars and serious students.
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <p className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Topic</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg border font-body text-xs font-medium transition-all ${
                    category === c.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Book */}
          <div>
            <p className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Specific Book <span className="text-muted-foreground/50 normal-case tracking-normal">(optional)</span></p>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={() => setSpecificBook("")}
                className={`px-3 py-1.5 rounded-lg border font-body text-xs font-medium transition-all ${
                  !specificBook ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-accent/40"
                }`}
              >
                Any Book
              </button>
            </div>
            <select
              value={specificBook}
              onChange={(e) => setSpecificBook(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:border-accent"
            >
              <option value="">— Choose a specific book —</option>
              <optgroup label="Old Testament">
                {BIBLE_BOOKS.slice(0, 39).map(b => <option key={b} value={b}>{b}</option>)}
              </optgroup>
              <optgroup label="New Testament">
                {BIBLE_BOOKS.slice(39).map(b => <option key={b} value={b}>{b}</option>)}
              </optgroup>
            </select>
            {specificBook && (
              <p className="mt-1.5 font-body text-xs text-accent">📖 Questions will focus specifically on the book of {specificBook}.</p>
            )}
          </div>

          {/* Question Count */}
          <div>
            <p className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Number of Questions</p>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20, 30, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`px-4 py-2 rounded-lg border font-body text-sm font-medium transition-all ${
                    questionCount === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => fetchQuiz(questionCount, difficulty, category, specificBook)}
            className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-body font-semibold py-3 rounded-lg hover:bg-accent/90 transition-colors text-sm"
          >
            {difficulty === "super_hard" ? <Zap className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
            Start Quiz ({questionCount} Questions)
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="font-body text-muted-foreground text-sm">Generating your Bible trivia quiz...</p>
        <p className="font-body text-xs text-muted-foreground/60">
          {difficulty === "super_hard" ? "Crafting extremely hard questions — this may take a moment..." : "Creating unique questions just for you..."}
        </p>
      </div>
    );
  }

  // Results screen
  if (finished) {
    const { text, sub } = scoreLabel();
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-4">
        <div className="text-center p-8 rounded-xl border border-border bg-card mb-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-1">{text}</h2>
          <p className="font-body text-muted-foreground text-sm mb-4">{sub}</p>
          <div className="text-5xl font-display font-bold text-accent mb-2">
            {score}<span className="text-2xl text-muted-foreground">/{questions.length}</span>
          </div>
          <p className="font-body text-xs text-muted-foreground mb-6">
            {DIFFICULTIES.find(d => d.value === difficulty)?.label} · {CATEGORIES.find(c => c.value === category)?.label}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <ShareButton
              title="Bible Trivia Challenge"
              text={`I scored ${score}/${questions.length} on the Bible Trivia Quiz (${DIFFICULTIES.find(d => d.value === difficulty)?.label})! Can you beat me? 📖`}
              url={window.location.origin + "/forums"}
            />
            <button
              onClick={() => fetchQuiz(questionCount, difficulty, category)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-xs font-semibold hover:bg-accent/90 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Play Again
            </button>
            <button
              onClick={() => setQuestions(null)}
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
            <div key={i} className={`p-5 rounded-xl border ${a.isCorrect ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
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
                  <p className="font-body text-xs text-muted-foreground italic">{a.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Quiz screen
  if (!questions || questions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-body text-muted-foreground text-sm mb-4">No questions found for this combination. Try a different category or difficulty.</p>
        <button onClick={handleReset} className="bg-accent text-accent-foreground font-body text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-accent/90 transition-colors">
          Back to Settings
        </button>
      </div>
    );
  }
  const q = questions[current];
  if (!q) return null;
  return (
    <div className="py-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs text-muted-foreground">Question {current + 1} of {questions.length}</span>
        <div className="flex items-center gap-3">
          <span className="font-body text-xs font-semibold text-accent">Score: {score}</span>
          {difficulty === "super_hard" && (
            <span className="font-body text-xs font-bold text-purple-600 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Super Hard
            </span>
          )}
          {difficulty === "theologian" && (
            <span className="font-body text-xs font-bold text-amber-600 flex items-center gap-1">
              🔬 Theologian Mode
            </span>
          )}
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
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <div className={`p-6 rounded-xl border bg-card mb-6 ${difficulty === "super_hard" ? "border-purple-300 dark:border-purple-800" : "border-border"}`}>
            <p className="font-display text-lg font-bold text-foreground leading-snug">{q.question}</p>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let style = "border-border hover:border-accent/40 text-foreground cursor-pointer";
              if (selected === idx && !confirmed) {
                style = "border-accent bg-accent/10 text-accent ring-2 ring-accent/30";
              }
              if (confirmed) {
                if (idx === q.correct_index) style = "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700";
                else if (idx === selected) style = "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600";
                else style = "border-border text-muted-foreground opacity-50";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={confirmed}
                  className={`w-full text-left p-4 rounded-xl border font-body text-sm transition-all duration-200 flex items-center justify-between gap-3 ${style}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-bold text-xs flex-shrink-0 w-5">{String.fromCharCode(65 + idx)}.</span>
                    <span className="leading-snug">{opt}</span>
                  </div>
                  {confirmed && idx === q.correct_index && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
                  {confirmed && selected === idx && idx !== q.correct_index && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Confirm / Next buttons */}
          <div className="mt-5 flex gap-3">
            {!confirmed ? (
              <button
                onClick={handleConfirm}
                disabled={selected === null}
                className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Answer
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-secondary border border-border">
                  <p className="font-body text-sm text-muted-foreground italic">{q.explanation}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {current + 1 >= questions.length ? "See Results" : "Next Question"}
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