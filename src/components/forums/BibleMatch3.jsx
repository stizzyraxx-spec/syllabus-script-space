import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Zap, ChevronUp } from "lucide-react";

// ─── Symbols ───────────────────────────────────────────────────────────────────
const SYMBOLS = [
  { id: "cross",  emoji: "✝️",  label: "Cross"  },
  { id: "dove",   emoji: "🕊️",  label: "Dove"   },
  { id: "scroll", emoji: "📜",  label: "Scroll" },
  { id: "lamp",   emoji: "🪔",  label: "Lamp"   },
  { id: "fish",   emoji: "🐟",  label: "Fish"   },
  { id: "star",   emoji: "⭐",  label: "Star"   },
];

// ─── Level config – harder each level ─────────────────────────────────────────
function getLevelConfig(level) {
  return {
    scoreTarget: 800 + level * 600,           // more points needed each level
    movesLimit:  Math.max(12, 24 - level * 3), // fewer moves
    symbolCount: Math.min(6, 4 + Math.floor(level / 2)), // more symbol types (harder)
    label: `Level ${level}`,
  };
}

const COLS = 7;
const ROWS = 7;

// ─── Board helpers ─────────────────────────────────────────────────────────────
function randomSymbol(symbolCount) {
  return { ...SYMBOLS[Math.floor(Math.random() * symbolCount)], key: Math.random() };
}

function findMatches(board) {
  const matched = new Set();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 2; c++) {
      const id = board[r][c]?.id;
      if (id && id === board[r][c+1]?.id && id === board[r][c+2]?.id) {
        let end = c + 2;
        while (end + 1 < COLS && board[r][end+1]?.id === id) end++;
        for (let k = c; k <= end; k++) matched.add(`${r},${k}`);
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 2; r++) {
      const id = board[r][c]?.id;
      if (id && id === board[r+1][c]?.id && id === board[r+2][c]?.id) {
        let end = r + 2;
        while (end + 1 < ROWS && board[end+1][c]?.id === id) end++;
        for (let k = r; k <= end; k++) matched.add(`${k},${c}`);
      }
    }
  }
  return [...matched].map((s) => { const [r,c] = s.split(",").map(Number); return {r,c}; });
}

function applyGravity(board, symbolCount) {
  const nb = board.map((row) => [...row]);
  for (let c = 0; c < COLS; c++) {
    const col = [];
    for (let r = 0; r < ROWS; r++) if (nb[r][c]) col.push(nb[r][c]);
    const fill = ROWS - col.length;
    const filled = [
      ...Array.from({ length: fill }, () => randomSymbol(symbolCount)),
      ...col,
    ];
    for (let r = 0; r < ROWS; r++) nb[r][c] = filled[r];
  }
  return nb;
}

function makeBoard(symbolCount) {
  let board;
  do {
    board = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => randomSymbol(symbolCount))
    );
  } while (findMatches(board).length > 0);
  return board;
}

function hasAnyMove(board) {
  const dirs = [[0,1],[1,0]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr,dc] of dirs) {
        const nr = r+dr, nc = c+dc;
        if (nr >= ROWS || nc >= COLS) continue;
        const b = board.map((row) => [...row]);
        [b[r][c], b[nr][nc]] = [b[nr][nc], b[r][c]];
        if (findMatches(b).length > 0) return true;
      }
    }
  }
  return false;
}

// ─── Starfield ─────────────────────────────────────────────────────────────────
function Starfield() {
  const stars = useRef(
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 4,
    }))
  );

  const shootingStars = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 60 + 10,
      y: Math.random() * 40,
      duration: Math.random() * 1.5 + 1,
      delay: Math.random() * 8 + i * 3,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.current.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {shootingStars.current.map((s) => (
        <motion.div
          key={`sh-${s.id}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: 80 }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: 120, y: 60 }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, repeatDelay: 10, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ─── Particle burst ────────────────────────────────────────────────────────────
function Particles({ x, y, color, id }) {
  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const dist = 30 + Math.random() * 30;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ background: color, left: 0, top: 0 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

// ─── Cell glow colors for space theme ─────────────────────────────────────────
const CELL_GLOW = {
  cross:  { bg: "rgba(251,191,36,0.18)",  border: "#fbbf24", glow: "0 0 12px #fbbf2488" },
  dove:   { bg: "rgba(56,189,248,0.18)",  border: "#38bdf8", glow: "0 0 12px #38bdf888" },
  scroll: { bg: "rgba(250,204,21,0.18)",  border: "#facc15", glow: "0 0 12px #facc1588" },
  lamp:   { bg: "rgba(251,146,60,0.18)",  border: "#fb923c", glow: "0 0 12px #fb923c88" },
  fish:   { bg: "rgba(96,165,250,0.18)",  border: "#60a5fa", glow: "0 0 12px #60a5fa88" },
  star:   { bg: "rgba(192,132,252,0.18)", border: "#c084fc", glow: "0 0 12px #c084fc88" },
};

const PARTICLE_COLORS = {
  cross: "#fbbf24", dove: "#38bdf8", scroll: "#facc15",
  lamp: "#fb923c", fish: "#60a5fa", star: "#c084fc",
};

const VERSES = [
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.", ref: "2 Timothy 1:7" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "The Lord is my light and my salvation—whom shall I fear?", ref: "Psalm 27:1" },
  { text: "I have fought the good fight, I have finished the race, I have kept the faith.", ref: "2 Timothy 4:7" },
  { text: "Do not be afraid, for I am with you; do not be dismayed, for I am your God.", ref: "Isaiah 41:10" },
  { text: "Therefore take up the full armor of God, that you may be able to resist in the evil day.", ref: "Ephesians 6:13" },
  { text: "Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you.", ref: "Deuteronomy 31:6" },
  { text: "But Jesus looked at them and said, 'With man this is impossible, but with God all things are possible.'", ref: "Matthew 19:26" },
  { text: "For I know the plans I have for you, plans for welfare and not for evil, to give you a future and a hope.", ref: "Jeremiah 29:11" },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BibleMatch3() {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [animating, setAnimating] = useState(false);
  const [clearing, setClearing] = useState([]);
  const [gameState, setGameState] = useState("idle"); // idle | playing | won | lost | levelup
  const [combo, setCombo] = useState(0);
  const [lastPoints, setLastPoints] = useState(null);
  const [noMoves, setNoMoves] = useState(false);
  const [particles, setParticles] = useState([]);
  const [shakeCell, setShakeCell] = useState(null);
  const [currentVerse, setCurrentVerse] = useState(null);
  const boardRef = useRef(null);

  const cfg = getLevelConfig(level);

  const startLevel = useCallback((lvl) => {
   const c = getLevelConfig(lvl);
   setBoard(makeBoard(c.symbolCount));
   setScore(0);
   setMoves(c.movesLimit);
   setSelected(null);
   setClearing([]);
   setCombo(0);
   setLastPoints(null);
   setNoMoves(false);
   setParticles([]);
   setGameState("playing");
  }, []);

  const startGame = () => {
    setLevel(1);
    setScore(0);
    startLevel(1);
  };

  const saveScore = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (user) {
        await base44.entities.GameScore.create({
          player_email: user.email,
          player_name: user.full_name,
          game_type: "match3",
          score,
          difficulty: `Level ${level}`
        });
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  }, [score, level]);

  const spawnParticles = useCallback((matches, boardEl) => {
    if (!boardEl) return;
    const rect = boardEl.getBoundingClientRect();
    const cellW = rect.width / COLS;
    const cellH = rect.height / ROWS;
    const bursts = matches.slice(0, 6).map((m, i) => ({
      id: Date.now() + i,
      x: rect.left + m.c * cellW + cellW / 2,
      y: rect.top + m.r * cellH + cellH / 2,
      color: PARTICLE_COLORS[board?.[m.r]?.[m.c]?.id] || "#fff",
    }));
    setParticles((p) => [...p, ...bursts]);
    setTimeout(() => setParticles((p) => p.filter((b) => !bursts.find((x) => x.id === b.id))), 600);
  }, [board]);

  const processMatches = useCallback(async (b, currentCombo = 0, lvl = level) => {
    const matches = findMatches(b);
    if (matches.length === 0) {
      setCombo(0);
      setAnimating(false);
      if (!hasAnyMove(b)) {
        setNoMoves(true);
        setTimeout(() => {
          const c = getLevelConfig(lvl);
          setBoard(makeBoard(c.symbolCount));
          setNoMoves(false);
        }, 1200);
      }
      return b;
    }

    spawnParticles(matches, boardRef.current);
    setClearing(matches);
    await new Promise((res) => setTimeout(res, 380));

    const basePoints = matches.length * 10;
    const comboMult = currentCombo + 1;
    const pts = basePoints * comboMult;

    setScore((s) => s + pts);
    setLastPoints({ pts, combo: comboMult });
    setTimeout(() => setLastPoints(null), 1000);
    setCombo(comboMult);

    const matchSet = new Set(matches.map((m) => `${m.r},${m.c}`));
    const c = getLevelConfig(lvl);
    let nb = b.map((row, r) =>
      row.map((cell, ci) => (matchSet.has(`${r},${ci}`) ? null : cell))
    );
    nb = applyGravity(nb, c.symbolCount);
    setClearing([]);
    setBoard(nb);
    await new Promise((res) => setTimeout(res, 220));
    return processMatches(nb, currentCombo + 1, lvl);
  }, [level, spawnParticles]);

  // Generate verse when level up
  useEffect(() => {
    if (gameState === "levelup") {
      const randomVerse = VERSES[Math.floor(Math.random() * VERSES.length)];
      setCurrentVerse(randomVerse);
    }
  }, [gameState]);

  // Check win/loss after moves or score changes
  useEffect(() => {
    if (gameState !== "playing" || score === 0) return;
    const c = getLevelConfig(level);
    if (score >= c.scoreTarget) {
      setGameState("levelup");
    }
  }, [score, level, gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (moves <= 0) {
      const c = getLevelConfig(level);
      if (score >= c.scoreTarget) {
        setGameState("levelup");
      } else {
        setGameState("lost");
      }
    }
  }, [moves, gameState, score, level]);

  const handleTap = useCallback(
    async (r, c) => {
      if (animating || gameState !== "playing") return;
      if (!selected) { setSelected({ r, c }); return; }

      const { r: sr, c: sc } = selected;
      if (sr === r && sc === c) { setSelected(null); return; }

      const adjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;
      if (!adjacent) { setSelected({ r, c }); return; }

      setSelected(null);
      setAnimating(true);

      const nb = board.map((row) => [...row]);
      [nb[sr][sc], nb[r][c]] = [nb[r][c], nb[sr][sc]];

      const matches = findMatches(nb);
      if (matches.length === 0) {
        // shake the invalid cell
        setShakeCell(`${r},${c}`);
        setTimeout(() => setShakeCell(null), 500);
        setAnimating(false);
        return;
      }

      setBoard(nb);
      setMoves((m) => m - 1);
      await processMatches(nb, 0, level);
    },
    [animating, gameState, selected, board, processMatches, level]
  );

  const clearSet = new Set(clearing.map((m) => `${m.r},${m.c}`));
  const activeSymbols = SYMBOLS.slice(0, cfg.symbolCount);

  // ── IDLE screen ───────────────────────────────────────────────────────────
  if (gameState === "idle") {
    return (
      <div className="relative rounded-2xl overflow-hidden min-h-[420px] flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1060 0%, #0a0520 60%, #000010 100%)" }}>
        <Starfield />
        <div className="relative z-10 text-center px-6 py-10">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-4">✝️</motion.div>
          <h2 className="font-display text-3xl font-bold text-white mb-2 drop-shadow-lg">Bible Match</h2>
          <p className="font-body text-sm text-blue-200 mb-6 max-w-xs mx-auto">
            Match 3+ Bible symbols across the cosmos. Each level requires more points with fewer moves!
          </p>
          <div className="grid grid-cols-3 gap-2 mb-8 max-w-xs mx-auto">
            {SYMBOLS.map((s) => {
              const g = CELL_GLOW[s.id];
              return (
                <div key={s.id} className="flex flex-col items-center p-3 rounded-xl border"
                  style={{ background: g.bg, borderColor: g.border, boxShadow: g.glow }}>
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="font-body text-xs text-blue-100 mt-1">{s.label}</span>
                </div>
              );
            })}
          </div>
          <button onClick={startGame}
            className="px-8 py-3 rounded-xl font-body font-bold text-sm hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff", boxShadow: "0 0 24px #7c3aed88" }}>
            Begin Your Journey ✨
          </button>
        </div>
      </div>
    );
  }

  // ── LEVEL UP screen ───────────────────────────────────────────────────────
  if (gameState === "levelup") {
    const nextLevel = level + 1;
    const nextCfg = getLevelConfig(nextLevel);
    return (
      <div className="relative rounded-2xl overflow-hidden min-h-[360px] flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1060 0%, #0a0520 60%, #000010 100%)" }}>
        <Starfield />
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center px-6 py-10">
          <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 2 }} className="text-6xl mb-4">🏆</motion.div>
          <h2 className="font-display text-3xl font-bold text-white mb-1">Level {level} Complete!</h2>
          <p className="font-body text-blue-200 text-sm mb-2">Score: <span className="text-yellow-300 font-bold">{score}</span></p>
          {currentVerse && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="my-4 p-4 rounded-xl border border-blue-400/30 text-center max-w-xs mx-auto" style={{ background: "rgba(59,130,246,0.1)" }}>
              <p className="font-body text-sm text-blue-100 italic mb-2">"{currentVerse.text}"</p>
              <p className="font-body text-xs text-blue-400">— {currentVerse.ref}</p>
            </motion.div>
          )}
          <div className="my-5 p-4 rounded-xl border border-white/10 text-left max-w-xs mx-auto"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <p className="font-body text-xs text-blue-300 font-semibold uppercase tracking-wider mb-2">Level {nextLevel} Challenge</p>
            <p className="font-body text-sm text-white">🎯 Goal: <span className="text-yellow-300">{nextCfg.scoreTarget} pts</span></p>
            <p className="font-body text-sm text-white">🚀 Moves: <span className="text-red-300">{nextCfg.movesLimit}</span></p>
            {nextCfg.symbolCount > cfg.symbolCount && (
              <p className="font-body text-sm text-white">➕ New symbol unlocked!</p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
           <button onClick={() => { setLevel(nextLevel); startLevel(nextLevel); setScore(0); }}
              className="px-6 py-2.5 rounded-xl font-body font-bold text-sm hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff", boxShadow: "0 0 20px #7c3aed66" }}>
              Next Level →
            </button>
            <button onClick={startGame}
              className="px-6 py-2.5 rounded-xl font-body text-sm text-blue-200 border border-white/20 hover:border-white/40 transition-colors">
              Restart
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── LOST screen ───────────────────────────────────────────────────────────
  if (gameState === "lost") {
    return (
      <div className="relative rounded-2xl overflow-hidden min-h-[320px] flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1060 0%, #0a0520 60%, #000010 100%)" }}>
        <Starfield />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-6 py-10">
          <div className="text-6xl mb-4">📜</div>
          <h2 className="font-display text-2xl font-bold text-white mb-1">Mission Failed</h2>
          <p className="font-body text-blue-200 text-sm mb-2">Level {level} · {score} / {cfg.scoreTarget} pts needed</p>
          <p className="font-body text-xs text-blue-400 italic mb-6">"I can do all things through Christ who strengthens me." – Phil. 4:13</p>
          <button onClick={() => { saveScore(); startGame(); }}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-body font-bold text-sm hover:scale-105 transition-transform mx-auto"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff" }}>
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  return (
    <div className="relative rounded-2xl overflow-hidden select-none"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1060 0%, #0a0520 70%, #000010 100%)" }}>
      <Starfield />

      {/* Particle bursts */}
      <AnimatePresence>
        {particles.map((p) => <Particles key={p.id} {...p} />)}
      </AnimatePresence>

      <div className="relative z-10 p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="font-body text-[10px] text-blue-400 uppercase tracking-wider">Level</p>
              <p className="font-display text-lg font-bold text-white">{level}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="font-body text-[10px] text-blue-400 uppercase tracking-wider">Score</p>
              <motion.p
                key={score}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.4 }}
                className="font-display text-lg font-bold text-yellow-300"
              >
                {score}
              </motion.p>
            </div>
            <div className="text-center">
              <p className="font-body text-[10px] text-blue-400 uppercase tracking-wider">Goal</p>
              <p className="font-display text-lg font-bold text-blue-200">{cfg.scoreTarget}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="font-body text-[10px] text-blue-400 uppercase tracking-wider">Moves</p>
              <p className={`font-display text-lg font-bold ${moves <= 5 ? "text-red-400" : "text-white"}`}>{moves}</p>
            </div>
            <button onClick={startGame}
              className="p-2 rounded-lg border border-white/20 text-blue-300 hover:text-white hover:border-white/40 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full rounded-full h-1.5 mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-1.5 rounded-full"
            style={{ background: "linear-gradient(90deg,#7c3aed,#38bdf8)" }}
            animate={{ width: `${Math.min((score / cfg.scoreTarget) * 100, 100)}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* No moves warning */}
        <AnimatePresence>
          {noMoves && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-1 mb-2">
              <p className="font-body text-xs text-red-400 font-semibold">No moves! Reshuffling board…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combo / points popup */}
        <div className="relative h-7 mb-2">
          <AnimatePresence>
            {lastPoints && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center gap-2"
              >
                <span className="font-display text-base font-bold text-yellow-300 drop-shadow-lg">+{lastPoints.pts}</span>
                {lastPoints.combo > 1 && (
                  <span className="flex items-center gap-1 font-body text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(124,58,237,0.5)", color: "#e879f9", border: "1px solid #a855f744" }}>
                    <Zap className="w-3 h-3" /> {lastPoints.combo}x COMBO
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Board */}
        <div
          ref={boardRef}
          className="grid gap-1 p-2 rounded-2xl"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 40px rgba(124,58,237,0.2) inset",
          }}
        >
          {board && board.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selected?.r === r && selected?.c === c;
              const isClearing = clearSet.has(`${r},${c}`);
              const isShaking = shakeCell === `${r},${c}`;
              const g = cell ? CELL_GLOW[cell.id] : null;

              return (
                <motion.button
                  key={cell?.key ?? `${r},${c}`}
                  onClick={() => handleTap(r, c)}
                  animate={
                    isClearing
                      ? { scale: 0, opacity: 0, rotate: 45 }
                      : isShaking
                      ? { x: [-4, 4, -4, 4, 0] }
                      : isSelected
                      ? { scale: 1.18, y: -2 }
                      : { scale: 1, opacity: 1, rotate: 0, x: 0, y: 0 }
                  }
                  transition={{ duration: isShaking ? 0.35 : 0.2 }}
                  className="aspect-square rounded-lg flex items-center justify-center text-base sm:text-lg border transition-all"
                  style={g ? {
                    background: isSelected ? `rgba(255,255,255,0.18)` : g.bg,
                    borderColor: isSelected ? "#fff" : g.border,
                    boxShadow: isSelected
                      ? `0 0 20px #fff8, ${g.glow}`
                      : isClearing
                      ? `0 0 24px ${g.border}`
                      : g.glow,
                    cursor: animating ? "default" : "pointer",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  {cell?.emoji}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Symbol legend */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {activeSymbols.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <span className="text-xs">{s.emoji}</span>
              <span className="font-body text-[10px] text-blue-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}