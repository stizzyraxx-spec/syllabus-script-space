import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GAME_TYPES = {
  match3: "Bible Match",
  finish_verse: "Finish the Verse",
  spot_false: "Spot False Teaching",
  bible_trivia: "Bible Trivia",
  scramble: "Scramble & Puzzle",
  disciples_conquest: "The Disciples Conquest",
};

const GAME_COLORS = {
  match3: "from-yellow-400 to-orange-500",
  finish_verse: "from-blue-400 to-cyan-500",
  spot_false: "from-red-400 to-pink-500",
  bible_trivia: "from-purple-400 to-indigo-500",
  scramble: "from-green-400 to-emerald-500",
  disciples_conquest: "from-red-600 to-amber-500",
};

const MEDAL_ICONS = [
  { rank: 1, Icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  { rank: 2, Icon: Medal, color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-800/30" },
  { rank: 3, Icon: Medal, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
];

function GameTypeSelector({ selectedGame, onSelectGame }) {
  const allGames = ["all", ...Object.keys(GAME_TYPES)];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {allGames.map((gameType) => (
        <button
          key={gameType}
          onClick={() => onSelectGame(gameType)}
          className={`px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
            selectedGame === gameType
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          {gameType === "all" ? "All Games" : GAME_TYPES[gameType]}
        </button>
      ))}
    </div>
  );
}

function LeaderboardEntry({ rank, score, index }) {
  const medalConfig = MEDAL_ICONS.find((m) => m.rank === rank);
  const MedalIcon = medalConfig ? medalConfig.Icon : Flame;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${medalConfig?.bg || "bg-muted"}`}>
        <MedalIcon className={`w-5 h-5 ${medalConfig?.color || "text-muted-foreground"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-foreground">{score.player_name || "Anonymous"}</p>
        {GAME_TYPES[score.game_type] && (
          <p className="font-body text-xs text-muted-foreground">{GAME_TYPES[score.game_type]}</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-display text-lg font-bold text-accent">{score.score.toLocaleString()}</p>
        <p className="font-body text-xs text-muted-foreground">points</p>
      </div>
    </motion.div>
  );
}

export default function GameLeaderboard() {
  const [selectedGame, setSelectedGame] = useState("all");

  const { data: allScores = [], isLoading } = useQuery({
    queryKey: ["game-leaderboard"],
    queryFn: () => db.entities.GameScore.list("-score", 100),
    refetchInterval: 30000,
  });

  const filteredScores = selectedGame === "all" 
    ? allScores 
    : allScores.filter((s) => s.game_type === selectedGame);

  const topScores = filteredScores.slice(0, 10);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-bold text-foreground">Top Scores</h3>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          {selectedGame === "all" 
            ? "The highest-scoring players across all games"
            : `Top players in ${GAME_TYPES[selectedGame]}`
          }
        </p>
      </div>

      <GameTypeSelector selectedGame={selectedGame} onSelectGame={setSelectedGame} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      ) : topScores.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-muted-foreground mb-2">No scores yet</p>
          <p className="font-body text-xs text-muted-foreground">Play a game to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {topScores.map((score, idx) => (
              <LeaderboardEntry
                key={score.id}
                rank={idx + 1}
                score={score}
                index={idx}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}