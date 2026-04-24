import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageSquare, UserPlus, MapPin, Package } from "lucide-react";
import { useOnlinePlayers } from "@/hooks/useOnlineStatus";
import TradingWindow from "./TradingWindow";

export default function OnlinePlayersPanel({
  currentPlayerEmail,
  currentLocation,
  onMessage,
  onCoopInvite,
}) {
  const { onlinePlayers } = useOnlinePlayers();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tradingWith, setTradingWith] = useState(null);

  const playersInLocation = onlinePlayers.filter(
    (p) => p.location === currentLocation && p.player_email !== currentPlayerEmail
  );

  const otherPlayers = onlinePlayers.filter(
    (p) => p.player_email !== currentPlayerEmail
  );

  const CHARACTER_EMOJIS = {
    david: "👑",
    moses: "🔱",
    joseph: "✝️",
    daniel: "🙏",
    paul: "📖",
    esther: "👸",
    peter: "🧑‍🦳",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-32 left-4 bg-black/90 border border-white/20 rounded-xl overflow-hidden w-80 max-h-96 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-white">Players Online</h3>
          <span className="ml-auto px-2 py-1 rounded text-xs bg-accent/30 text-accent font-bold">
            {otherPlayers.length}
          </span>
        </div>

        {playersInLocation.length > 0 && (
          <p className="text-xs text-white/60">
            {playersInLocation.length} in your location
          </p>
        )}
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {/* Players in current location */}
        {playersInLocation.length > 0 && (
          <>
            <p className="text-xs text-accent font-semibold px-2">IN THIS LOCATION</p>
            {playersInLocation.map((player) => (
              <motion.button
                key={player.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPlayer(player)}
                className="w-full p-2 rounded-lg bg-accent/20 border border-accent/40 hover:border-accent/60 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">
                      {CHARACTER_EMOJIS[player.character_id] || "✨"}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-body text-sm font-semibold">
                        {player.player_name}
                      </p>
                      <p className="text-white/60 text-xs">Lvl {player.level}</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              </motion.button>
            ))}
          </>
        )}

        {/* Other online players */}
        {otherPlayers.length > 0 && (
          <>
            <p className="text-xs text-white/60 font-semibold px-2 mt-3">
              OTHER PLAYERS
            </p>
            {otherPlayers
              .filter((p) => p.location !== currentLocation)
              .map((player) => (
                <motion.button
                  key={player.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPlayer(player)}
                  className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">
                        {CHARACTER_EMOJIS[player.character_id] || "✨"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-body text-sm font-semibold truncate">
                          {player.player_name}
                        </p>
                        <p className="text-white/50 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {player.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-white/70 text-xs">Lvl {player.level}</p>
                      <p className="text-accent text-xs font-bold">
                        {player.total_score}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
          </>
        )}

        {otherPlayers.length === 0 && (
          <p className="text-center text-white/40 text-sm py-6">No players online</p>
        )}
      </div>

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlayer(null)}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border-2 border-accent rounded-xl p-6 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">
                  {CHARACTER_EMOJIS[selectedPlayer.character_id] || "✨"}
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {selectedPlayer.player_name}
                </h3>
              </div>

              <div className="space-y-3 mb-6 bg-white/10 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Level</span>
                  <span className="text-white font-bold">{selectedPlayer.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Score</span>
                  <span className="text-accent font-bold">
                    {selectedPlayer.total_score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Location</span>
                  <span className="text-white text-sm">{selectedPlayer.location}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onMessage(selectedPlayer);
                    setSelectedPlayer(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-body text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                <button
                  onClick={() => {
                    setTradingWith(selectedPlayer);
                    setSelectedPlayer(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent/70 text-white font-body text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Trade
                </button>
                {selectedPlayer.location === currentLocation && (
                  <button
                    onClick={() => {
                      onCoopInvite(selectedPlayer);
                      setSelectedPlayer(null);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-accent-foreground font-body text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Co-op
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full mt-3 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-body text-sm transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trading Window */}
      <AnimatePresence>
        {tradingWith && (
          <TradingWindow
            playerEmail={currentPlayerEmail}
            otherPlayerEmail={tradingWith.player_email}
            otherPlayerName={tradingWith.player_name}
            onClose={() => setTradingWith(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}