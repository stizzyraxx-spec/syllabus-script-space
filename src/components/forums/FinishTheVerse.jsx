import React, { useState, useCallback, useRef } from "react";
import { db } from "@/api/supabaseClient";
import { Loader2, BookOpen, CheckCircle2, XCircle, RefreshCw, ChevronRight, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";

export default function FinishTheVerse() {
  const [book, setBook] = useState("any");
  const [bookSearch, setBookSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const [translation, setTranslation] = useState("KJV");
  const [difficulty, setDifficulty] = useState("normal");
  const [total, setTotal] = useState(7);
  const [activeTotal, setActiveTotal] = useState(7);
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const { awardPoints } = useAwardPoints();

  const saveScore = useCallback(async () => {
    try {
      const user = await db.auth.me();
      if (user) {
        await db.entities.GameScore.create({
          player_email: user.email,
          player_name: user.full_name,
          game_type: "finish_verse",
          score
        });
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  }, [score]);





  const fetchRound = async () => {
    setLoading(true);
    setSelected(null);

    try {
      const res = await db.functions.invoke("generateFinishVerseQuestion", {
        difficulty,
        book,
        count: 1,
      });
      const questions = res.data?.questions || [];
      if (questions.length > 0) {
        const q = questions[0];
        setRound({
          reference: q.reference,
          verse_start: q.verse_start,
          options: q.options,
          correct_index: q.correct_index,
          full_verse: q.full_verse,
          context: q.scholarly_note || q.context || "",
        });
      }
    } catch (error) {
      console.error('Error fetching verse:', error);
    }

    setLoading(false);
  };

  const startGame = () => {
    setActiveTotal(total);
    setScore(0);
    setQuestionNum(1);
    setStreak(0);
    setGameOver(false);
    fetchRound();
  };



  const handleSelect = (idx) => {
    setSelected(idx);
  };

  const handleAnswer = () => {
    if (selected === null) return;
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (selected === null) return;
    if (selected === round.correct_index) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      const user = await db.auth.me().catch(() => null);
      if (user) {
        await awardPoints(user.email, "verse");
        toast.success("✨ +1 point for correct answer!");
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (questionNum >= activeTotal) setGameOver(true);
    else { setQuestionNum((n) => n + 1); fetchRound(); }
  };

  // Setup
  if (!round && !loading && !gameOver) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Finish the Verse</h2>
          <p className="font-body text-sm text-muted-foreground">
            We'll show you the start of a Bible verse — choose the correct ending!
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "normal", label: "Normal", color: "bg-accent/10 text-accent border-accent/30" },
                { value: "theologian", label: "🔬 Theologian", color: "bg-amber-600/20 text-amber-600 border-amber-700" }
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`px-4 py-2 rounded-lg border font-body text-sm font-medium transition-all ${
                    difficulty === d.value ? d.color : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {difficulty === "theologian" && (
              <p className="mt-2 font-body text-xs text-amber-700 dark:text-amber-400">
                🔬 Advanced verses with textual variants, manuscript differences, and theological debate. For serious scholars.
              </p>
            )}
          </div>
          {difficulty !== "theologian" && (
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Book</p>
            <div className="relative" ref={searchRef}>
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search a book or leave blank for any..."
                  value={bookSearch}
                  onChange={(e) => { setBookSearch(e.target.value); setShowDropdown(true); if (!e.target.value) setBook("any"); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
                />
                {bookSearch && (
                  <button onClick={() => { setBookSearch(""); setBook("any"); }} className="absolute right-3 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {book !== "any" && !showDropdown && (
                <p className="font-body text-xs text-accent mt-1.5 ml-1">Selected: {book}</p>
              )}
              <AnimatePresence>
                {showDropdown && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {!bookSearch && (
                      <li>
                        <button
                          onMouseDown={() => { setBook("any"); setBookSearch(""); setShowDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 font-body text-sm text-accent hover:bg-secondary transition-colors font-semibold"
                        >
                          Any Book (random)
                        </button>
                      </li>
                    )}
                    {["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"]
                      .filter(b => b.toLowerCase().startsWith(bookSearch.toLowerCase()))
                      .map((b) => (
                        <li key={b}>
                          <button
                            onMouseDown={() => { setBook(b); setBookSearch(b); setShowDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 font-body text-sm hover:bg-secondary transition-colors ${book === b ? "text-accent font-semibold" : "text-foreground"}`}
                          >
                            {b}
                          </button>
                        </li>
                      ))
                    }
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
          )}

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Number of Verses</p>
            <div className="flex gap-2">
              {[7, 12, 33].map((num) => (
                <button
                  key={num}
                  onClick={() => setTotal(num)}
                  className={`px-4 py-2 rounded-lg font-body text-xs font-medium border transition-all ${
                    total === num
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {num} Verses
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
          >
            Start {difficulty === "theologian" ? "Theologian" : "Normal"} Game ({total} Verses)
          </button>
        </div>
      </div>
    );
  }

  // Game over
  if (gameOver) {
    const pct = Math.round((score / activeTotal) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          {difficulty === "theologian" ? (pct === 100 ? "Brilliant! 🔬" : pct >= 80 ? "Impressive 📚" : "Challenging! 💭") : "Well done!"}
        </h2>
        <p className="font-body text-muted-foreground text-sm mb-4">You completed {activeTotal} verses</p>
        <div className="text-6xl font-display font-bold text-accent mb-2">{score}/{activeTotal}</div>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {difficulty === "theologian" 
            ? (pct === 100 ? "You command textual criticism!" : pct >= 80 ? "Deep scholarly knowledge!" : "Manuscript variants are tricky—keep studying!")
            : (pct === 100 ? "Perfect Scripture recall!" : pct >= 66 ? "Great knowledge of the Word!" : "Keep reading — every verse matters!")}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { saveScore(); startGame(); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors">
            <RefreshCw className="w-4 h-4" /> {difficulty === "theologian" ? "Try Again" : "Play Again"}
          </button>
          <button onClick={() => { setRound(null); setGameOver(false); setDifficulty("normal"); }} className="px-6 py-2.5 rounded-xl border border-border font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
            Change Mode
          </button>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="font-body text-sm text-muted-foreground">Loading verse {questionNum}...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-body text-xs text-muted-foreground">Verse {questionNum} of {activeTotal}</span>
        <div className="flex items-center gap-3">
          {streak >= 2 && <span className="font-body text-xs font-semibold text-accent">🔥 {streak} streak</span>}
          <span className="font-body text-sm font-semibold text-foreground">{score} pts</span>
          <button
            onClick={() => { setRound(null); setGameOver(false); setScore(0); setQuestionNum(0); setStreak(0); }}
            className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>
      <div className="w-full bg-secondary rounded-full h-1.5 mb-6">
        <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${((questionNum - 1) / activeTotal) * 100}%` }} />
      </div>

      {/* Verse prompt */}
      <div className="p-5 rounded-xl bg-primary text-primary-foreground mb-5">
        <p className="font-body text-xs text-primary-foreground/60 mb-2">{round.reference} ({translation})</p>
        <p className="font-display text-lg leading-relaxed italic">
          "{round.verse_start} <span className="text-accent font-bold">___________"</span>
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {round.options.map((opt, idx) => {
          let style = "border-border hover:border-accent/50 cursor-pointer";
          let icon = null;
          if (selected !== null) {
            if (idx === round.correct_index) {
              style = "border-green-500 bg-green-500/10";
              icon = <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />;
            } else if (idx === selected) {
              style = "border-destructive bg-destructive/10";
              icon = <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
            } else {
              style = "border-border opacity-50";
            }
          }
          return (
            <motion.button
              key={idx}
              onClick={() => handleSelect(idx)}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${style}`}
            >
              <span className="font-body text-xs font-bold text-muted-foreground mt-0.5 w-5 flex-shrink-0">{String.fromCharCode(65 + idx)}.</span>
              <span className="font-body text-sm text-foreground flex-1 leading-relaxed">{opt}</span>
              {icon}
            </motion.button>
          );
        })}
      </div>

      {/* Submit button */}
      {selected !== null && (
        <button
          onClick={handleAnswer}
          className="w-full mt-5 py-3 rounded-xl bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          Check Answer
        </button>
      )}

      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 rounded-xl bg-secondary border border-border">
            <div className="flex items-center gap-2 mb-2">
              {selected === round.correct_index
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <XCircle className="w-4 h-4 text-destructive" />}
              <span className={`font-body text-sm font-semibold ${selected === round.correct_index ? "text-green-500" : "text-destructive"}`}>
                {selected === round.correct_index ? "Correct! +1 point" : "Not quite!"}
              </span>
            </div>
            <p className="font-display text-sm italic text-foreground/80 mb-1">"{round.full_verse}"</p>
            <p className="font-body text-xs text-muted-foreground">{round.context}</p>
            <button onClick={handleNext} className="mt-3 flex items-center gap-1.5 font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors">
              {questionNum >= activeTotal ? "See Results" : "Next Verse"} <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}