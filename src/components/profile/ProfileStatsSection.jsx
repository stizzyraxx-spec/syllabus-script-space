import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Target, Star } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function ProfileStatsSection({ gameScores = [], achievements = [] }) {
  // Aggregate stats by game type
  const gameStats = useMemo(() => {
    const stats = {};
    gameScores.forEach((score) => {
      if (!stats[score.game_type]) {
        stats[score.game_type] = {
          type: score.game_type,
          scores: [],
          total: 0,
          avg: 0,
          best: 0,
        };
      }
      stats[score.game_type].scores.push(score.score);
      stats[score.game_type].total += score.score;
      stats[score.game_type].best = Math.max(stats[score.game_type].best, score.score);
    });

    Object.keys(stats).forEach((key) => {
      const data = stats[key];
      data.avg = Math.round(data.total / data.scores.length);
    });

    return Object.values(stats).sort((a, b) => b.best - a.best);
  }, [gameScores]);

  // Timeline data
  const timelineData = useMemo(() => {
    return gameScores
      .slice(-20)
      .reverse()
      .map((s, i) => ({
        game: s.game_type?.replace(/_/g, " ") || "Game",
        score: s.score,
        index: i,
      }));
  }, [gameScores]);

  const unlockedAchievements = achievements.filter((a) => a.is_unlocked).length;
  const totalGames = gameScores.length;
  const avgScore = gameScores.length > 0 ? Math.round(gameScores.reduce((a, b) => a + b.score, 0) / gameScores.length) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h3 className="font-display text-2xl font-bold text-foreground">Game Statistics</h3>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Games Played", value: totalGames, color: "from-blue-500 to-cyan-500" },
          { icon: Trophy, label: "Average Score", value: avgScore, color: "from-yellow-500 to-orange-500" },
          { icon: Star, label: "Achievements", value: unlockedAchievements, color: "from-purple-500 to-pink-500" },
          { icon: Zap, label: "Best Game", value: gameScores.length > 0 ? Math.max(...gameScores.map((s) => s.score)) : 0, color: "from-green-500 to-emerald-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-xs font-semibold opacity-90">{stat.label}</p>
                <Icon className="w-4 h-4 opacity-70" />
              </div>
              <p className="font-display text-3xl font-bold">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Game Type Breakdown */}
      {gameStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h4 className="font-display text-lg font-bold text-foreground mb-4">Performance by Game</h4>
          <div className="space-y-3">
            {gameStats.map((stat) => (
              <div key={stat.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-sm font-semibold text-foreground capitalize">{stat.type.replace(/_/g, " ")}</span>
                  <span className="font-body text-xs text-muted-foreground">{stat.scores.length} games</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.best / 100) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-accent to-accent/50 rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-body text-xs text-muted-foreground">Avg: {stat.avg}</span>
                  <span className="font-body text-xs text-accent font-semibold">Best: {stat.best}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Score Timeline */}
      {timelineData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h4 className="font-display text-lg font-bold text-foreground mb-4">Recent Scores</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="game" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h4 className="font-display text-lg font-bold text-foreground mb-4">
            Achievements ({unlockedAchievements}/{achievements.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-lg border transition-all ${
                  ach.is_unlocked
                    ? "bg-accent/10 border-accent/30 scale-100"
                    : "bg-secondary/50 border-border opacity-50 scale-95"
                }`}
              >
                <p className="font-body text-xs font-semibold text-foreground line-clamp-2">{ach.achievement_id}</p>
                {ach.is_unlocked && <p className="font-body text-xs text-accent mt-1">✓ Unlocked</p>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {totalGames === 0 && (
        <div className="text-center py-12 bg-secondary/30 rounded-xl border border-border">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-body text-muted-foreground text-sm">No games played yet</p>
          <p className="font-body text-muted-foreground text-xs mt-1">Play games to see your statistics here</p>
        </div>
      )}
    </motion.div>
  );
}