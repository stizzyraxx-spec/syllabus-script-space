import React, { useState } from "react";
import { Trophy, ShieldAlert, BookOpen, Puzzle, Gem, Gamepad2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";



const GAMES = [
  {
    id: "trivia",
    label: "Bible Trivia",
    icon: Trophy,
    emoji: "🏆",
    tagline: "How well do you know the Word?",
    description: "Multiple-choice questions across topics, books & difficulty levels.",
    badgeText: "KNOWLEDGE",
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
    img: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=800&q=80",
  },
  {
    id: "crossword",
    label: "Bible Crossword",
    icon: Puzzle,
    emoji: "✝️",
    tagline: "Fill in the answers. Test your Scripture knowledge.",
    description: "Solve biblical crossword puzzles across three difficulty levels.",
    badgeText: "PUZZLE",
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
    img: "https://images.unsplash.com/photo-1554100528-14f3fc614d3b?w=800&q=80",
  },
  {
    id: "rpg",
    label: "The Condition of Man",
    icon: Gamepad2,
    emoji: "🐉",
    tagline: "Walk the path of faith. Test your convictions.",
    description: "An immersive RPG where your choices shape your moral journey through biblical narratives.",
    badgeText: "RPG",
    img: "https://images.unsplash.com/photo-1538481143235-5d8936a24acf?w=800&q=80",
  },
  ];

function FloatingParticle({ char, delay, x, y }) {
  return (
    <motion.span
      className="absolute text-lg pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0.5, y: 0 }}
      animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0.8], y: [-20, -50] }}
      transition={{ delay, duration: 2.5, repeat: Infinity, repeatDelay: Math.random() * 3 + 1 }}
    >
      {char}
    </motion.span>
  );
}

function GameCard({ game, index, onClick }) {
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
      style={{ minHeight: 260, WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {game.img && (
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <img src={game.img} alt={game.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary" />

      {/* Shine overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0"
        animate={hovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col h-full" style={{ minHeight: 260 }}>
        {/* Badge */}
         <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-body font-black tracking-widest px-2.5 py-1 rounded-full bg-accent text-primary">
             {game.badgeText}
           </span>
           <motion.span
            className="text-2xl"
            animate={hovered ? { rotate: [0, -10, 10, 0], scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {game.emoji}
          </motion.span>
        </div>

        {/* Title & tagline */}
        <h3 className="font-display text-xl font-bold text-white mb-1">{game.label}</h3>
        <p className="font-body text-xs font-semibold mb-2 text-white">{game.tagline}</p>
        <p className="font-body text-xs text-white/70 leading-relaxed flex-1">{game.description}</p>

        {/* CTA Button */}
        <motion.button
          className="mt-4 w-full py-2.5 rounded-xl font-body text-sm font-bold transition-all flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-primary"
          animate={hovered ? { scale: 1.02 } : { scale: 1 }}
        >
          <Zap className="w-4 h-4" />
          Play Now
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function GamesSection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="w-6 h-6 text-accent" />
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Bible Games
                </h2>
              </div>
              <p className="font-body text-sm text-muted-foreground mb-10">
                Grow in your knowledge of the Word through interactive games
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {GAMES.map((g, i) => (
                  <GameCard key={g.id} game={g} index={i} onClick={() => navigate(`/games?game=${g.id}`)} />
                ))}
              </div>
        </motion.div>
      </div>
    </section>
  );
}