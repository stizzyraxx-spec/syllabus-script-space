import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { Loader2, Puzzle, RefreshCw, Delete, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALL_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const MODES = [
  { value: "word", label: "Word Scramble", desc: "Unscramble a Bible word or name" },
  { value: "phrase", label: "Phrase Puzzle", desc: "Rearrange words to form a verse" },
];

const THEMES = [
  { value: "any", label: "Any" },
  { value: "names", label: "Bible Names" },
  { value: "places", label: "Places" },
  { value: "attributes", label: "God's Attributes" },
  { value: "books", label: "Books of the Bible" },
];

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function scrambleWord(word) {
  const letters = word.toUpperCase().split("");
  let shuffled = shuffleArray(letters);
  // make sure it's different
  while (shuffled.join("") === word.toUpperCase() && letters.length > 2) {
    shuffled = shuffleArray(letters);
  }
  return shuffled;
}

export default function ScrambleGame() {
  const [mode, setMode] = useState("word");
  const [theme, setTheme] = useState("any");
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hint, setHint] = useState(false);

  // Word scramble state
  const [scrambled, setScrambled] = useState([]);      // [{letter, id, used}]
  const [answer, setAnswer] = useState([]);             // [{letter, id}]

  // Phrase puzzle state
  const [wordBanks, setWordBanks] = useState([]);       // [{word, id, used}]
  const [phraseAnswer, setPhraseAnswer] = useState([]); // [{word, id}]

  const TOTAL = 5;

  const fetchPuzzle = async () => {
    setLoading(true);
    setPuzzle(null);
    setRevealed(false);
    setHint(false);
    setAnswer([]);
    setPhraseAnswer([]);
    setScrambled([]);
    setWordBanks([]);

    try {
      const randomBook = ALL_BOOKS[Math.floor(Math.random() * ALL_BOOKS.length)];
      const randomChapter = Math.floor(Math.random() * 5) + 1;

      const res = await db.functions.invoke("getBibleVerses", { book: randomBook, chapter: randomChapter });
      const verses = res.data?.verses || [];

      if (!verses || verses.length === 0) {
        setLoading(false);
        return;
      }

      const randomVerse = verses[Math.floor(Math.random() * verses.length)];

      if (mode === "word") {
        const biblicalWords = ["JERUSALEM", "BETHLEHEM", "NAZARETH", "COVENANT", "JUDGMENT", "SALVATION", "KINGDOM", "PROPHET", "WITNESS", "GOSPEL", "RIGHTEOUSNESS", "SANCTIFY", "COVENANT", "ABRAHAM", "ISAIAH", "REVELATION", "APOSTLE", "SANCTIFIED", "WILDERNESS", "TABERNACLE"];
        const word = biblicalWords[Math.floor(Math.random() * biblicalWords.length)];
        const letters = scrambleWord(word);
        setScrambled(letters.map((l, i) => ({ letter: l, id: i, used: false })));
        setPuzzle({
          word,
          clue: `A Bible word or place (${word.length} letters)`,
          reference: `${randomBook} ${randomChapter}:1`,
          fun_fact: word,
        });
      } else {
        const words = randomVerse.split(' ').slice(0, Math.min(7, randomVerse.split(' ').length));
        const phrase = words.join(' ');
        const shuffledWords = shuffleArray(
          words.map((w, i) => ({ word: w.replace(/[^\w]/g, ''), id: i, used: false }))
        );
        setWordBanks(shuffledWords);
        setPuzzle({
          phrase,
          words: words.map(w => w.replace(/[^\w]/g, '')),
          clue: phrase.substring(0, 50) + '...',
          reference: `${randomBook} ${randomChapter}:1`,
        });
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      // Fallback: use a hardcoded word puzzle so the game never gets stuck
      const fallbackWords = ["JERUSALEM", "BETHLEHEM", "NAZARETH", "COVENANT", "SALVATION", "KINGDOM", "GOSPEL", "RIGHTEOUSNESS", "WILDERNESS", "TABERNACLE"];
      const word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
      const letters = scrambleWord(word);
      setScrambled(letters.map((l, i) => ({ letter: l, id: i, used: false })));
      setPuzzle({
        word,
        clue: `A Bible word or place (${word.length} letters)`,
        reference: "Psalm 119:105",
        fun_fact: word,
      });
    }

    setLoading(false);
  };

  const startGame = () => {
    setScore(0);
    setQuestionNum(1);
    setGameOver(false);
    fetchPuzzle();
  };

  // Word scramble: tap letter to add to answer
  const addLetter = (idx) => {
    if (revealed) return;
    const tile = scrambled[idx];
    if (tile.used) return;
    setAnswer((a) => [...a, { letter: tile.letter, id: tile.id }]);
    setScrambled((s) => s.map((t, i) => i === idx ? { ...t, used: true } : t));
  };

  const removeLetter = (idx) => {
    if (revealed) return;
    const tile = answer[idx];
    setScrambled((s) => s.map((t) => t.id === tile.id ? { ...t, used: false } : t));
    setAnswer((a) => a.filter((_, i) => i !== idx));
  };

  // Phrase puzzle: tap word to add
  const addWord = (idx) => {
    if (revealed) return;
    const tile = wordBanks[idx];
    if (tile.used) return;
    setPhraseAnswer((a) => [...a, { word: tile.word, id: tile.id }]);
    setWordBanks((b) => b.map((t, i) => i === idx ? { ...t, used: true } : t));
  };

  const removeWord = (idx) => {
    if (revealed) return;
    const tile = phraseAnswer[idx];
    setWordBanks((b) => b.map((t) => t.id === tile.id ? { ...t, used: false } : t));
    setPhraseAnswer((a) => a.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    const userAnswer = mode === "word"
      ? answer.map((a) => a.letter).join("").toUpperCase()
      : phraseAnswer.map((w) => w.word).join(" ").toLowerCase().replace(/[^a-z ]/g, "");

    const correct = mode === "word"
      ? puzzle.word.toUpperCase()
      : puzzle.phrase.toLowerCase().replace(/[^a-z ]/g, "");

    if (userAnswer === correct) setScore((s) => s + 1);
    setRevealed(true);
  };

  const handleNext = () => {
    if (questionNum >= TOTAL) setGameOver(true);
    else { setQuestionNum((n) => n + 1); fetchPuzzle(); }
  };

  const clearAnswer = () => {
    if (mode === "word") {
      setScrambled((s) => s.map((t) => ({ ...t, used: false })));
      setAnswer([]);
    } else {
      setWordBanks((b) => b.map((t) => ({ ...t, used: false })));
      setPhraseAnswer([]);
    }
  };

  // Check if answer is complete
  const isComplete = puzzle ? (mode === "word"
    ? answer.length === (puzzle.word?.length || 0)
    : phraseAnswer.length === (puzzle.words?.length || 0)) : false;

  const userCorrect = revealed && (() => {
    const userAnswer = mode === "word"
      ? answer.map((a) => a.letter).join("").toUpperCase()
      : phraseAnswer.map((w) => w.word).join(" ").toLowerCase().replace(/[^a-z ]/g, "");
    const correct = mode === "word"
      ? puzzle.word.toUpperCase()
      : puzzle.phrase.toLowerCase().replace(/[^a-z ]/g, "");
    return userAnswer === correct;
  })();

  // Setup
  if (!puzzle && !loading && !gameOver) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Puzzle className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Scramble & Puzzle</h2>
          <p className="font-body text-sm text-muted-foreground">
            Unscramble Bible words or rearrange verse phrases!
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Game Mode</p>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    mode === m.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"
                  }`}
                >
                  <p className="font-body text-sm font-semibold text-foreground">{m.label}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {mode === "word" && (
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Theme</p>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium border transition-all ${
                      theme === t.value
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={startGame}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
          >
            Start Game ({TOTAL} Puzzles)
          </button>
        </div>
      </div>
    );
  }

  // Game over
  if (gameOver) {
    const pct = Math.round((score / TOTAL) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Puzzle className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Puzzle Complete!</h2>
        <p className="font-body text-muted-foreground text-sm mb-4">You solved {score} of {TOTAL} puzzles</p>
        <div className="text-6xl font-display font-bold text-accent mb-2">{score}/{TOTAL}</div>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {pct === 100 ? "Flawless! You know your Bible!" : pct >= 60 ? "Great effort! Keep studying!" : "Practice makes perfect — keep going!"}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={startGame} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors">
            <RefreshCw className="w-4 h-4" /> Play Again
          </button>
          <button onClick={() => { setPuzzle(null); setGameOver(false); }} className="px-6 py-2.5 rounded-xl border border-border font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
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
        <p className="font-body text-sm text-muted-foreground">Generating puzzle {questionNum}...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-body text-xs text-muted-foreground">Puzzle {questionNum} of {TOTAL}</span>
        <div className="flex items-center gap-3">
          <span className="font-body text-sm font-semibold text-foreground">{score} pts</span>
          <button
            onClick={() => { setPuzzle(null); setGameOver(false); setScore(0); setQuestionNum(0); }}
            className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>
      <div className="w-full bg-secondary rounded-full h-1.5 mb-6">
        <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${((questionNum - 1) / TOTAL) * 100}%` }} />
      </div>

      {/* Clue */}
      <div className="p-4 rounded-xl bg-secondary border border-border mb-5">
        <p className="font-body text-xs text-muted-foreground mb-1">
          {mode === "word" ? "📖 Clue" : "✍️ Arrange the words"}
        </p>
        <p className="font-body text-sm text-foreground">{puzzle.clue}</p>
        {puzzle.reference && (
          <p className="font-body text-xs text-accent mt-1">{puzzle.reference}</p>
        )}
        {!hint && !revealed && (
          <button onClick={() => setHint(true)} className="font-body text-xs text-muted-foreground hover:text-accent mt-2 transition-colors underline underline-offset-2">
            Show hint
          </button>
        )}
        {hint && mode === "word" && puzzle?.word && (
          <p className="font-body text-xs text-accent mt-1">First letter: <strong>{puzzle.word[0].toUpperCase()}</strong> · {puzzle.word.length} letters</p>
        )}
      </div>

      {/* WORD SCRAMBLE UI */}
      {mode === "word" && (
        <>
          {/* Answer slots */}
          <div className="flex flex-wrap justify-center gap-2 min-h-[56px] mb-4 p-3 rounded-xl border-2 border-dashed border-border bg-secondary/30">
            {answer.length === 0 && (
              <p className="font-body text-xs text-muted-foreground self-center">Tap letters below to spell your answer</p>
            )}
            {answer.map((tile, idx) => (
              <motion.button
                key={tile.id}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                onClick={() => removeLetter(idx)}
                disabled={revealed}
                className={`w-10 h-10 rounded-lg font-display font-bold text-lg flex items-center justify-center transition-all ${
                  revealed
                    ? userCorrect ? "bg-green-500 text-white" : "bg-destructive text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/80"
                }`}
              >
                {tile.letter}
              </motion.button>
            ))}
          </div>

          {/* Letter bank */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {scrambled.map((tile, idx) => (
              <motion.button
                key={tile.id}
                onClick={() => addLetter(idx)}
                disabled={tile.used || revealed}
                whileTap={{ scale: 0.9 }}
                className={`w-11 h-11 rounded-lg font-display font-bold text-lg flex items-center justify-center border-2 transition-all ${
                  tile.used ? "opacity-20 cursor-not-allowed border-border bg-secondary" : "border-accent bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {tile.letter}
              </motion.button>
            ))}
          </div>
        </>
      )}

      {/* PHRASE PUZZLE UI */}
      {mode === "phrase" && (
        <>
          {/* Answer area */}
          <div className="flex flex-wrap gap-2 min-h-[56px] mb-4 p-3 rounded-xl border-2 border-dashed border-border bg-secondary/30">
            {phraseAnswer.length === 0 && (
              <p className="font-body text-xs text-muted-foreground self-center">Tap words below to build the verse</p>
            )}
            {phraseAnswer.map((tile, idx) => (
              <motion.button
                key={tile.id}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                onClick={() => removeWord(idx)}
                disabled={revealed}
                className={`px-3 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                  revealed
                    ? userCorrect ? "bg-green-500 text-white" : "bg-destructive text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/80"
                }`}
              >
                {tile.word}
              </motion.button>
            ))}
          </div>

          {/* Word bank */}
          <div className="flex flex-wrap gap-2 mb-5">
            {wordBanks.map((tile, idx) => (
              <motion.button
                key={tile.id}
                onClick={() => addWord(idx)}
                disabled={tile.used || revealed}
                whileTap={{ scale: 0.9 }}
                className={`px-3 py-2 rounded-lg font-body text-sm font-medium border-2 transition-all ${
                  tile.used ? "opacity-20 cursor-not-allowed border-border bg-secondary" : "border-accent bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {tile.word}
              </motion.button>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      {!revealed && (
        <div className="flex gap-3">
          <button
            onClick={clearAnswer}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Delete className="w-4 h-4" /> Clear
          </button>
          <button
            onClick={checkAnswer}
            disabled={!isComplete}
            className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40"
          >
            Check Answer
          </button>
        </div>
      )}

      {/* Reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 rounded-xl bg-secondary border border-border">
            <div className="flex items-center gap-2 mb-2">
              {userCorrect
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <span className="text-destructive">✗</span>}
              <span className={`font-body text-sm font-semibold ${userCorrect ? "text-green-500" : "text-destructive"}`}>
                {userCorrect ? "Correct! +1 point" : "Not quite!"}
              </span>
            </div>
            <p className="font-body text-sm font-semibold text-foreground mb-1">
              Answer: <span className="text-accent">{mode === "word" ? puzzle.word : puzzle.phrase}</span>
            </p>
            {mode === "word" && puzzle.fun_fact && <p className="font-body text-xs text-muted-foreground">{puzzle.fun_fact}</p>}
            <button onClick={handleNext} className="mt-3 flex items-center gap-1.5 font-body text-sm font-semibold text-accent hover:text-accent/80 transition-colors">
              {questionNum >= TOTAL ? "See Results" : "Next Puzzle"} →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}