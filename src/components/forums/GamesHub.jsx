import React, { useState, lazy, Suspense } from "react";
import { Trophy, ShieldAlert, BookOpen, Puzzle, ArrowLeft, Gem, Zap, Link, Shield, Users, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BibleTrivia from "./BibleTrivia";
import SpotFalseTeaching from "./SpotFalseTeaching";
import FinishTheVerse from "./FinishTheVerse";
import ScrambleGame from "./ScrambleGame";
import BibleMatch3 from "./BibleMatch3";
import BibleCrossword from "./BibleCrossword";
import VerseMemorizationTrainer from "./VerseMemorizationTrainer";
import WhoAmI from "./WhoAmI";
import GameLeaderboard from "./GameLeaderboard";
import BibleWordSearch from "./BibleWordSearch";
import DoYouBelieve from "@/components/games/DoYouBelieve";

const RPGGame = lazy(() => import("@/components/rpg/RPGGame"));

const GAMES = [
  {
    id: "trivia",
    label: "Bible Trivia",
    icon: Trophy,
    emoji: "🏆",
    tagline: "How well do you know the Word?",
    description: "Multiple-choice questions across topics, books & difficulty levels.",
    badgeText: "KNOWLEDGE",
    particles: ["✨", "⭐", "🌟", "💡", "📜"],
    img: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&q=80",
  },
  {
    id: "false_teaching",
    label: "Spot False Teaching",
    icon: ShieldAlert,
    emoji: "🛡️",
    tagline: "Guard the faith. Discern the truth.",
    description: "Four statements appear — identify the heretical or false teaching.",
    badgeText: "DISCERNMENT",
    particles: ["⚔️", "🔥", "🛡️", "👁️", "⚡"],
    img: "https://images.unsplash.com/photo-1579546929662-711aa33e6b6f?w=800&q=80",
  },
  {
    id: "finish_verse",
    label: "Finish the Verse",
    icon: BookOpen,
    emoji: "📖",
    tagline: "Let the Word dwell in you richly.",
    description: "We show you the start of a verse — choose the correct ending.",
    badgeText: "SCRIPTURE",
    particles: ["📖", "✝️", "🕊️", "📜", "🌿"],
    img: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=800&q=80",
  },
  {
    id: "scramble",
    label: "Scramble & Puzzle",
    icon: Puzzle,
    emoji: "🧩",
    tagline: "Piece together the Word of God.",
    description: "Unscramble Bible words or rearrange scrambled verse phrases.",
    badgeText: "PUZZLE",
    particles: ["🧩", "🔤", "💎", "🌀", "🎯"],
    img: "https://images.unsplash.com/photo-1578472657481-ceb1f0098b9a?w=800&q=80",
  },
  {
    id: "match3",
    label: "Bible Match",
    icon: Gem,
    emoji: "✝️",
    tagline: "Match sacred symbols. Beat the clock.",
    description: "Match 3+ Bible symbols — cross, dove, scroll, lamp, fish & star.",
    badgeText: "ARCADE",
    particles: ["✝️", "💎", "🕊️", "⭐", "🔮"],
    img: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=800&q=80",
  },

  {
    id: "rpg",
    label: "The Condition of Man",
    icon: Zap,
    emoji: "✨",
    tagline: "Walk the path of faith. Test your convictions.",
    description: "An immersive RPG where you embody biblical figures, making moral decisions that shape your spiritual journey across sacred realms.",
    badgeText: "IMMERSIVE",
    particles: ["✨", "🌟", "💫", "⭐", "🔥"],
    img: "https://images.unsplash.com/photo-1536431311719-398e50ad0397?w=800&q=80",
  },
  {
    id: "crossword",
    label: "Bible Crossword",
    icon: Puzzle,
    emoji: "🔤",
    tagline: "Solve biblical word puzzles.",
    description: "Complete crossword puzzles with clues about Bible stories, characters, and verses.",
    badgeText: "PUZZLE",
    particles: ["🔤", "✝️", "📖", "💡", "🎯"],
    img: "https://images.unsplash.com/photo-1570303008335-b1d4fc2b2c34?w=800&q=80",
  },
  {
    id: "memorization",
    label: "Verse Memorization",
    icon: BookOpen,
    emoji: "🧠",
    tagline: "Commit Scripture to memory.",
    description: "Train your memory by completing Bible verses. Strengthen your knowledge of key passages.",
    badgeText: "MEMORY",
    particles: ["🧠", "📖", "✝️", "💫", "🌟"],
    img: "https://images.unsplash.com/photo-1542831371-29541eb9afe1?w=800&q=80",
  },
  {
    id: "who_am_i",
    label: "Who Am I?",
    icon: Users,
    emoji: "👥",
    tagline: "Guess biblical figures from clues.",
    description: "Read clues and identify which biblical character you are. Test your knowledge of Scripture!",
    badgeText: "IDENTITY",
    particles: ["👥", "🎭", "✝️", "⚡", "🌟"],
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  },
  {
   id: "word_search",
   label: "Word Search",
   icon: Zap,
   emoji: "🔍",
   tagline: "Hunt for hidden biblical words.",
   description: "Find words hidden in grids across 5 categories and 4 difficulty levels with time limits.",
   badgeText: "ADVANCED",
   particles: ["🔍", "✝️", "📖", "💡", "🎯"],
   img: "https://images.unsplash.com/photo-1554100528-14f3fc614d3b?w=800&q=80",
  },
  {
   id: "believe",
   label: "Do You Believe?",
   icon: Lightbulb,
   emoji: "💭",
   tagline: "Explore the logical case for faith.",
   description: "Thought-provoking questions backed by historical evidence and philosophical reasoning about faith and belief.",
   badgeText: "PHILOSOPHY",
   particles: ["💭", "🧠", "✝️", "📚", "🔍"],
   img: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=800&q=80",
  },
  ];

function FloatingParticle({ char, delay, x, y }) {
  return (
    <motion.span
      className="absolute text-base pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0.5, y: 0 }}
      animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0.8], y: [-15, -40] }}
      transition={{ delay, duration: 2.5, repeat: Infinity, repeatDelay: Math.random() * 3 + 1 }}
    >
      {char}
    </motion.span>
  );
}

function GameCard({ game, index, onClick, onCopyLink, copied }) {
  const Icon = game.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="relative cursor-pointer rounded-3xl overflow-hidden border border-primary/40 shadow-xl shadow-primary/30 group"
      style={{ minHeight: 240 }}
    >
      {game.img && (
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <img src={game.img} alt={game.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0"
        animate={hovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 p-5 flex flex-col" style={{ minHeight: 240 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-body font-black tracking-widest px-2.5 py-1 rounded-full bg-accent text-primary">
            {game.badgeText}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 mb-3">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-display text-lg font-bold text-white mb-1">{game.label}</h3>
        <p className="font-body text-xs font-semibold mb-1 text-white">{game.tagline}</p>
        <p className="font-body text-xs text-white/70 leading-relaxed flex-1">{game.description}</p>
        <div className="mt-4 flex gap-2">
          <motion.button
            className="flex-1 py-2 rounded-xl font-body text-sm font-bold transition-all flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-primary"
            animate={hovered ? { scale: 1.02 } : { scale: 1 }}
          >
            <Zap className="w-4 h-4" />
            Play Now
          </motion.button>
          <button
            onClick={(e) => { e.stopPropagation(); onCopyLink(); }}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
            title="Copy link"
          >
            <Link className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function GamesHub({ user, searchParams, setSearchParams }) {
  const [copiedGame, setCopiedGame] = useState(null);
  const activeGame = searchParams?.get("game") || null;
  const showLeaderboard = searchParams?.get("view") === "leaderboard";
  const setActiveGame = (id) => {
    if (setSearchParams) {
      setSearchParams((prev) => {
        if (id) prev.set("game", id);
        else prev.delete("game");
        prev.delete("view");
        return prev;
      });
    }
  };
  const setView = (view) => {
    if (setSearchParams) {
      setSearchParams((prev) => {
        if (view) prev.set("view", view);
        else prev.delete("view");
        return prev;
      });
    }
  };
  const copyGameLink = (gameId) => {
    const url = `${window.location.origin}/forums?tab=games&game=${gameId}`;
    navigator.clipboard.writeText(url);
    setCopiedGame(gameId);
    setTimeout(() => setCopiedGame(null), 2000);
  };
  const game = GAMES.find((g) => g.id === activeGame);

  return (
    <div>
      <AnimatePresence mode="wait">
        {!activeGame && !showLeaderboard ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-1">Games</h2>
                <p className="font-body text-sm text-muted-foreground">Choose a game and grow in your knowledge of the Word.</p>
              </div>
              <button
                onClick={() => setView("leaderboard")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GAMES.map((g, i) => (
                <GameCard
                  key={g.id}
                  game={g}
                  index={i}
                  onClick={() => setActiveGame(g.id)}
                  onCopyLink={() => copyGameLink(g.id)}
                  copied={copiedGame === g.id}
                />
              ))}
            </div>
          </motion.div>
        ) : showLeaderboard ? (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              onClick={() => setView(null)}
              className="flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </button>
            <GameLeaderboard />
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={() => setActiveGame(null)}
              className="flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </button>
            {!game ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Game not found.</p>
                <button onClick={() => setActiveGame(null)} className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-body text-sm">Back to Games</button>
              </div>
            ) : (<>
            <div className="rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/70 border border-primary/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {game.icon && React.createElement(game.icon, { className: "w-7 h-7 text-white" })}
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">{game.label}</h2>
                    <p className="font-body text-xs text-white">{game.tagline}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyGameLink(activeGame)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 font-body text-xs text-white transition-colors"
                >
                  <Link className="w-3.5 h-3.5" />
                  {copiedGame === activeGame ? "Copied!" : "Share"}
                </button>
              </div>
            </div>
            {activeGame === "trivia" && <BibleTrivia user={user} />}
            {activeGame === "false_teaching" && <SpotFalseTeaching />}
            {activeGame === "finish_verse" && <FinishTheVerse />}
            {activeGame === "scramble" && <ScrambleGame />}
            {activeGame === "match3" && <BibleMatch3 />}
            {activeGame === "crossword" && <BibleCrossword user={user} />}
            {activeGame === "memorization" && <VerseMemorizationTrainer user={user} />}
            {activeGame === "who_am_i" && <WhoAmI user={user} />}
            {activeGame === "word_search" && <BibleWordSearch />}
            {activeGame === "believe" && <DoYouBelieve />}
            {activeGame === "rpg" && (
              <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
                <RPGGame userEmail={user?.email} />
              </Suspense>
            )}
            </>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}