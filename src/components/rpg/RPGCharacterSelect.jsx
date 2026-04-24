import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function RPGCharacterSelect({ characters, onSelect, onBack, theologianMode, ontheologianModeChange, modernMode, onModernModeChange }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black overflow-y-auto py-12 px-4"
    >
      {/* Stars background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
            Choose Your Path
          </h1>
          <p className="text-white/60 text-lg mb-6">
            Select a biblical character to embark on their moral journey
          </p>
          
          {/* Game Mode Toggle */}
          <div className="flex flex-col items-center justify-center gap-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onModernModeChange(false)}
                className={`px-6 py-2.5 rounded-lg font-body font-semibold transition-all ${
                  !modernMode
                    ? "bg-accent text-primary"
                    : "border border-white/30 text-white/60 hover:text-white/80"
                }`}
              >
                Biblical Era
              </button>
              <button
                onClick={() => onModernModeChange(true)}
                className={`px-6 py-2.5 rounded-lg font-body font-semibold transition-all flex items-center gap-2 ${
                  modernMode
                    ? "bg-blue-600 text-white"
                    : "border border-white/30 text-white/60 hover:text-white/80"
                }`}
              >
                🌍 Modern Challenges
              </button>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => ontheologianModeChange(false)}
                className={`px-6 py-2.5 rounded-lg font-body font-semibold transition-all ${
                  !theologianMode
                    ? "bg-accent text-primary"
                    : "border border-white/30 text-white/60 hover:text-white/80"
                }`}
              >
                Normal Difficulty
              </button>
              <button
                onClick={() => ontheologianModeChange(true)}
                className={`px-6 py-2.5 rounded-lg font-body font-semibold transition-all flex items-center gap-2 ${
                  theologianMode
                    ? "bg-amber-600 text-white"
                    : "border border-white/30 text-white/60 hover:text-white/80"
                }`}
              >
                🔬 Theologian Mode (2x Rewards)
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(characters).map(([id, char], idx) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(id)}
              className="group relative p-6 rounded-xl border-2 border-white/20 hover:border-white/60 transition-all overflow-hidden cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${char.color}11 0%, rgba(255,255,255,0.02) 100%)`,
              }}
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity blur-xl"
                style={{ backgroundColor: char.color }}
                whileHover={{ opacity: 0.4 }}
              />

              <div className="relative z-10 text-center">
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {id === "david" ? "👑" :
                   id === "moses" ? "🔱" :
                   id === "joseph" ? "✝️" :
                   id === "daniel" ? "🙏" :
                   id === "paul" ? "📖" :
                   id === "esther" ? "👸" :
                   id === "peter" ? "🧑‍🦳" : "✨"}
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  {char.name}
                </h2>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  {char.backstory}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {char.traits.map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-1 rounded text-xs text-white/80"
                      style={{
                        backgroundColor: `${char.color}40`,
                        border: `1px solid ${char.color}80`,
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-xs text-white/50 font-semibold">
                  CLICK TO BEGIN
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}