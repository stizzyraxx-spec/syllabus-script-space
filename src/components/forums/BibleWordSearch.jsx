import React, { useState, useEffect, useCallback } from "react";
import { db } from "@/api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Clock, Zap, RefreshCw, ChevronRight } from "lucide-react";
import { useAwardPoints } from "@/hooks/useAwardPoints";
import { toast } from "sonner";

const DIFFICULTIES = [
  { value: "easy", label: "Beginner", gridSize: 8, wordCount: 6, timeLimit: 600 },
  { value: "medium", label: "Intermediate", gridSize: 12, wordCount: 10, timeLimit: 480 },
  { value: "hard", label: "Advanced", gridSize: 15, wordCount: 15, timeLimit: 360 },
  { value: "expert", label: "Expert", gridSize: 18, wordCount: 20, timeLimit: 240 },
];

const CATEGORIES = {
  books: { label: "Books of the Bible", words: ["GENESIS", "EXODUS", "LEVITICUS", "NUMBERS", "DEUTERONOMY", "JOSHUA", "JUDGES", "RUTH", "SAMUEL", "KINGS", "CHRONICLES", "EZRA", "NEHEMIAH", "ESTHER", "JOB", "PSALMS", "PROVERBS", "ECCLESIASTES", "ISAIAH", "JEREMIAH", "LAMENTATIONS", "EZEKIEL", "DANIEL", "HOSEA", "JOEL", "AMOS", "OBADIAH", "JONAH", "MICAH", "NAHUM", "HABAKKUK", "ZEPHANIAH", "HAGGAI", "ZECHARIAH", "MALACHI", "MATTHEW", "MARK", "LUKE", "JOHN", "ACTS", "ROMANS", "CORINTHIANS", "GALATIANS", "EPHESIANS", "PHILIPPIANS", "COLOSSIANS", "THESSALONIANS", "TIMOTHY", "TITUS", "PHILEMON", "HEBREWS", "JAMES", "PETER", "REVELATION"] },
  people: { label: "People of the Bible", words: ["MOSES", "DAVID", "SOLOMON", "ABRAHAM", "ISAAC", "JACOB", "JOSEPH", "JESUS", "MARY", "PETER", "PAUL", "JOHN", "JUDAS", "THOMAS", "MATTHEW", "MARK", "LUKE", "JAMES", "ANDREW", "PHILIP", "BARTHOLOMEW", "SIMON", "THADDAEUS", "SARAH", "RACHEL", "LEAH", "RUTH", "ESTHER", "HANNAH", "DEBORAH", "SAMSON", "ELIJAH", "ELISHA", "JONAH", "DANIEL", "EZRA", "NEHEMIAH", "JOB", "NOAH", "EVE", "ADAM"] },
  places: { label: "Biblical Places", words: ["JERUSALEM", "BETHLEHEM", "EGYPT", "BABYLON", "JERICHO", "SINAI", "GALILEE", "JORDAN", "NAZARETH", "ROME", "CORINTH", "EPHESUS", "ANTIOCH", "DAMASCUS", "ARARAT", "EDEN", "SODOM", "CANAAN", "ISRAEL", "JUDAH", "SAMARIA", "TYRE", "SIDON", "PHILISTIA", "MOAB", "EDOM", "AMMON", "ARABIA", "MEDIA", "PERSIA", "GREECE", "CRETE", "MALTA", "CYPRUS", "PHOENICIA", "ASHER", "CARMEL", "GILEAD"] },
  doctrines: { label: "Biblical Doctrines", words: ["SALVATION", "FAITH", "GRACE", "REDEMPTION", "JUSTIFICATION", "SANCTIFICATION", "RESURRECTION", "TRINITY", "INCARNATION", "ATONEMENT", "COVENANT", "REPENTANCE", "OBEDIENCE", "FORGIVENESS", "LOVE", "MERCY", "JUDGMENT", "KINGDOM", "PERSECUTION", "REVELATION", "PROPHECY", "MIRACLES", "ETERNAL", "IMMORTAL", "DIVINE", "HOLY", "RIGHTEOUS", "WISDOM", "KNOWLEDGE", "TRUTH", "LIGHT", "SPIRIT", "SOUL", "BODY", "FLESH", "FLESH", "SANCTITY", "PURITY"] },
  virtues: { label: "Christian Virtues", words: ["FAITH", "HOPE", "LOVE", "PEACE", "JOY", "PATIENCE", "KINDNESS", "GOODNESS", "GENTLENESS", "SELF-CONTROL", "COURAGE", "WISDOM", "HUMILITY", "MERCY", "COMPASSION", "FORGIVENESS", "TRUTH", "HONOR", "INTEGRITY", "LOYALTY", "OBEDIENCE", "DEVOTION", "COMMITMENT", "SERVICE", "SACRIFICE", "GRATITUDE", "PRAISE", "WORSHIP", "PRAYER", "FAITH", "REVERENCE", "PIETY", "VIRTUE", "EXCELLENCE", "CHARACTER", "HOLINESS", "RIGHTEOUSNESS", "JUSTICE"] },
};

function generateWordSearchGrid(words, gridSize) {
  const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(""));
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]
  ];

  const placedWords = [];

  words.forEach(word => {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 50) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const dir = directions[Math.floor(Math.random() * directions.length)];

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
          canPlace = false;
          break;
        }
        if (grid[r][c] && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          grid[row + dir[0] * i][col + dir[1] * i] = word[i];
        }
        placedWords.push({ word, row, col, dir });
        placed = true;
      }
      attempts++;
    }
  });

  // Fill empty cells with random letters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!grid[r][c]) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, placedWords };
}

export default function BibleWordSearch() {
  const [difficulty, setDifficulty] = useState("easy");
  const [category, setCategory] = useState("books");
  const [gameState, setGameState] = useState("setup"); // setup, playing, results
  const [grid, setGrid] = useState(null);
  const [words, setWords] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundPositions, setFoundPositions] = useState(new Map());
  const { awardPoints } = useAwardPoints();

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing" || !timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState("results");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setLoading(true);
    const diffConfig = DIFFICULTIES.find(d => d.value === difficulty);
    const selectedWords = CATEGORIES[category].words
      .sort(() => Math.random() - 0.5)
      .slice(0, diffConfig.wordCount);

    const { grid: newGrid, placedWords: newPlaced } = generateWordSearchGrid(selectedWords, diffConfig.gridSize);

    setGrid(newGrid);
    setWords(selectedWords);
    setPlacedWords(newPlaced);
    setFoundWords(new Set());
    setSelectedCells([]);
    setFoundPositions(new Map());
    setTimeLeft(diffConfig.timeLimit);
    setScore(0);
    setGameState("playing");
    setLoading(false);
  };

  const handleCellClick = (row, col) => {
    setSelectedCells(prev => {
      const key = `${row},${col}`;
      const exists = prev.find(c => c.key === key);
      if (exists) return prev.filter(c => c.key !== key);
      return [...prev, { row, col, key }];
    });
  };

  const checkSelectedWord = () => {
    if (selectedCells.length < 2) return;

    const sortedCells = [...selectedCells].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    const word = sortedCells.map(c => grid[c.row][c.col]).join("");

    for (const placedWord of placedWords) {
      if (placedWord.word === word) {
        setFoundWords(prev => new Set([...prev, word]));
        setScore(prev => prev + 10);
        // Store positions for highlighting
        const positions = sortedCells.map(c => `${c.row},${c.col}`);
        setFoundPositions(prev => new Map([...prev, [word, positions]]));
        setSelectedCells([]);
        toast.success(`✨ Found: ${word}!`);
        return;
      }

      // Check reverse
      const reverseWord = word.split("").reverse().join("");
      if (placedWord.word === reverseWord) {
        setFoundWords(prev => new Set([...prev, placedWord.word]));
        setScore(prev => prev + 10);
        // Store positions for highlighting
        const positions = sortedCells.map(c => `${c.row},${c.col}`);
        setFoundPositions(prev => new Map([...prev, [placedWord.word, positions]]));
        setSelectedCells([]);
        toast.success(`✨ Found: ${placedWord.word}!`);
        return;
      }
    }

    setSelectedCells([]);
    toast.error("Not a valid word");
  };

  const resetGame = () => {
    setGameState("setup");
    setDifficulty("easy");
    setCategory("books");
    setGrid(null);
    setWords([]);
    setPlacedWords([]);
    setFoundWords(new Set());
    setFoundPositions(new Map());
    setTimeLeft(null);
    setScore(0);
    setSelectedCells([]);
  };

  const finishGame = async () => {
    const user = await db.auth.me().catch(() => null);
    if (user) {
      await awardPoints(user.email, "word_search");
    }
    setGameState("results");
  };

  // Setup screen
  if (gameState === "setup") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Bible Word Search</h2>
          <p className="font-body text-sm text-muted-foreground">
            Find hidden biblical words in the grid. Multiple difficulties and categories!
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card space-y-6">
          {/* Category Selection */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Category
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORIES).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`px-3 py-2.5 rounded-lg border font-body text-sm font-medium transition-all text-left ${
                    category === key
                      ? "bg-accent/10 text-accent border-accent/30"
                      : "border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  <p className="font-semibold text-xs">{data.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Difficulty
            </p>
            <div className="flex flex-wrap gap-3">
              {DIFFICULTIES.map((d) => (
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
                  <p className="text-xs text-muted-foreground">{d.gridSize}×{d.gridSize} • {d.wordCount} words</p>
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
        <p className="font-body text-sm text-muted-foreground">Generating word search...</p>
      </div>
    );
  }

  // Results
  if (gameState === "results") {
    const foundPercent = Math.round((foundWords.size / words.length) * 100);

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Word Search Complete!</h2>
        <p className="font-body text-muted-foreground text-sm mb-6">
          Found {foundWords.size} of {words.length} words
        </p>
        <div className="text-5xl font-display font-bold text-accent mb-2">{foundPercent}%</div>
        <p className="font-body text-sm text-muted-foreground mb-8">Score: {score} points</p>
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
  const diffConfig = DIFFICULTIES.find(d => d.value === difficulty);
  const timePercent = (timeLeft / diffConfig.timeLimit) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-xs text-muted-foreground">Found {foundWords.size}/{words.length}</p>
          <p className="font-display text-lg font-bold text-accent">Score: {score}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <p className="font-display text-lg font-bold text-foreground">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </p>
          </div>
          <div className="w-32 h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: "100%" }}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-4 inline-block">
            <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
              {grid && grid.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((cell, c) => {
                    const cellKey = `${r},${c}`;
                    const isSelected = selectedCells.some(s => s.row === r && s.col === c);
                    const isFoundWord = Array.from(foundPositions.values()).some(positions => positions.includes(cellKey));
                    return (
                      <button
                        key={cellKey}
                        onClick={() => handleCellClick(r, c)}
                        className={`w-9 h-9 text-xs font-bold border flex items-center justify-center transition-all ${
                          isFoundWord && isSelected
                            ? "bg-green-700 text-white border-green-800"
                            : isFoundWord
                            ? "bg-green-500 text-white border-green-600"
                            : isSelected
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-white dark:bg-gray-800 text-foreground border-gray-300 dark:border-gray-700 hover:border-accent/40"
                        }`}
                      >
                        {cell}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Click letters to select a word, then press Submit</p>
          </div>
        </div>

        {/* Words List */}
        <div className="space-y-3">
          <p className="font-body text-sm font-semibold text-foreground">Words to Find:</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {words.map((word) => {
              const found = foundWords.has(word);
              return (
                <div
                  key={word}
                  className={`px-3 py-2 rounded-lg text-sm font-body transition-all ${
                    found
                      ? "bg-green-500/10 text-green-600 line-through"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {found && <CheckCircle2 className="w-3.5 h-3.5 inline mr-2" />}
                  {word}
                </div>
              );
            })}
          </div>

          {/* Submit and Finish Buttons */}
          <div className="pt-4 space-y-2 border-t border-border">
            <button
              onClick={checkSelectedWord}
              disabled={selectedCells.length < 2}
              className="w-full py-2 rounded-lg bg-accent text-accent-foreground font-body text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              Submit Word
            </button>
            <button
              onClick={finishGame}
              className="w-full py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground font-body text-xs font-semibold transition-colors"
            >
              Finish Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}