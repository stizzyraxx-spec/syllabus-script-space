import React from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { X, Trophy, Zap, Target, Star } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FriendProfileModal({ email, onClose, currentUserEmail }) {
  const { data: friendProfile } = useQuery({
    queryKey: ["friend-profile", email],
    queryFn: () => db.entities.UserProfile.filter({ user_email: email }).then((d) => d[0]),
  });

  const { data: friendScores = [] } = useQuery({
    queryKey: ["friend-scores", email],
    queryFn: () => db.entities.GameScore.filter({ player_email: email }, "-created_date", 50),
  });

  const timelineData = friendScores
    .slice(-10)
    .reverse()
    .map((s, i) => ({
      game: s.game_type?.replace(/_/g, " ") || "Game",
      score: s.score,
    }));

  const avgScore = friendScores.length > 0 ? Math.round(friendScores.reduce((a, b) => a + b.score, 0) / friendScores.length) : 0;
  const bestScore = friendScores.length > 0 ? Math.max(...friendScores.map((s) => s.score)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold">{friendProfile?.display_name || email}</h3>
          <button onClick={onClose} className="hover:bg-primary-foreground/10 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Info */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-3xl border-4 border-accent/20 flex-shrink-0 overflow-hidden">
              {friendProfile?.avatar_url ? (
                <img src={friendProfile.avatar_url} alt={email} className="w-full h-full object-cover" />
              ) : (
                friendProfile?.avatar_emoji || "👤"
              )}
            </div>
            <div className="flex-1">
              <p className="font-body text-muted-foreground text-sm">{email}</p>
              {friendProfile?.bio && <p className="font-body text-sm text-foreground italic mt-2">{friendProfile.bio}</p>}
              {friendProfile?.total_points !== undefined && (
                <p className="font-body text-sm text-accent font-semibold mt-2">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  {friendProfile.total_points} Total Points
                </p>
              )}
            </div>
          </div>

          {/* Stats Comparison */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="font-body text-xs text-muted-foreground mb-1">Games Played</p>
              <p className="font-display text-2xl font-bold text-foreground">{friendScores.length}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="font-body text-xs text-muted-foreground mb-1">Average Score</p>
              <p className="font-display text-2xl font-bold text-accent">{avgScore}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="font-body text-xs text-muted-foreground mb-1">Best Score</p>
              <p className="font-display text-2xl font-bold text-yellow-500">{bestScore}</p>
            </div>
          </div>

          {/* Recent Scores Chart */}
          {timelineData.length > 0 && (
            <div className="bg-secondary/30 rounded-lg p-4">
              <h4 className="font-display text-sm font-bold text-foreground mb-4">Recent Scores</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="game" stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                  <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* No games */}
          {friendScores.length === 0 && (
            <div className="text-center py-12 bg-secondary/30 rounded-lg">
              <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="font-body text-muted-foreground text-sm">{email} hasn't played any games yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}