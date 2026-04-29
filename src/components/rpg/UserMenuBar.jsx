import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Settings, Backpack, BookOpen, BarChart3, Zap, Users, MessageSquare, Trophy, GitBranch, ShoppingCart } from "lucide-react";
import { db } from "@/api/supabaseClient";

const MENU_ITEMS = [
  { id: "inventory", label: "Inventory", icon: Backpack, color: "bg-blue-500/20 text-blue-400" },
  { id: "journal", label: "Quest Journal", icon: BookOpen, color: "bg-purple-500/20 text-purple-400" },
  { id: "stats", label: "Stats", icon: BarChart3, color: "bg-green-500/20 text-green-400" },
  { id: "skills", label: "Skill Tree", icon: GitBranch, color: "bg-cyan-500/20 text-cyan-400" },
  { id: "achievements", label: "Achievements", icon: Trophy, color: "bg-yellow-500/20 text-yellow-400" },
  { id: "players", label: "Online Players", icon: Users, color: "bg-orange-500/20 text-orange-400" },
  { id: "messages", label: "Messages", icon: MessageSquare, color: "bg-pink-500/20 text-pink-400" },
  { id: "coins", label: "Buy Coins", icon: ShoppingCart, color: "bg-accent/20 text-accent" },
];

export default function UserMenuBar({ 
  progress, 
  playerCoins,
  onInventory, 
  onJournal, 
  onStats,
  onSkills,
  onAchievements,
  onPlayers,
  onMessages,
  onCoins,
  onSettings
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (id) => {
    const handlers = {
      inventory: onInventory,
      journal: onJournal,
      stats: onStats,
      skills: onSkills,
      achievements: onAchievements,
      players: onPlayers,
      messages: onMessages,
      coins: onCoins,
    };
    handlers[id]?.();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-30 font-body">
      {/* Main Stats Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/90 border border-white/20 rounded-lg p-3 mb-2 max-w-xs backdrop-blur"
      >
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-blue-500/10 rounded px-2 py-1">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="text-white/70">Level <span className="font-bold text-white">{progress?.level || 1}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-purple-500/10 rounded px-2 py-1">
            <BarChart3 className="w-3 h-3 text-purple-400" />
            <span className="text-white/70">XP <span className="font-bold text-white">{progress?.xp || 0}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-500/10 rounded px-2 py-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-white/70">Coins <span className="font-bold text-accent">{playerCoins || 0}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 rounded px-2 py-1">
            <Trophy className="w-3 h-3 text-green-400" />
            <span className="text-white/70">Score <span className="font-bold text-white">{progress?.total_score || 0}</span></span>
          </div>
        </div>
      </motion.div>

      {/* Menu Button & Expandable Menu */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-accent/30 to-accent/10 border border-accent/50 hover:border-accent hover:from-accent/40 hover:to-accent/20 transition-all"
      >
        <span className="font-semibold text-white text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Menu
        </span>
        <ChevronUp
          className={`w-4 h-4 text-accent transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </motion.button>

      {/* Expanded Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 left-0 bg-black/95 border border-white/20 rounded-lg p-2 w-56 backdrop-blur space-y-1 max-h-96 overflow-y-auto"
          >
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-body ${item.color} hover:opacity-100 opacity-80`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}

            <div className="border-t border-white/10 my-2 pt-2">
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => {
                  onSettings?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-body bg-slate-500/20 text-slate-400 hover:text-white hover:bg-slate-500/30"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}