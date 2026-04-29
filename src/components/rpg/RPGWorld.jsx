import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, BarChart3, Trophy, LogOut, BookOpen, Backpack, GitBranch, Users } from "lucide-react";
import { MouseContext } from "@/lib/MouseContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/supabaseClient";
import UserMenuBar from "./UserMenuBar";
import QuestJournal from "./QuestJournal";
import InventoryView from "./InventoryView";
import SkillTreeView from "./SkillTreeView";
import RandomEncounterPrompt from "./RandomEncounterPrompt";
import CombatEncounter from "./CombatEncounter";
import { useRandomEncounter } from "@/hooks/useRandomEncounter";
import AchievementPanel from "./AchievementPanel";
import { useAchievements } from "@/hooks/useAchievements";
import { useGameSave } from "@/hooks/useGameSave";
import { useGameDifficulty } from "@/hooks/useGameDifficulty";
import GameCompletionModal from "./GameCompletionModal";
import OnlinePlayersPanel from "./OnlinePlayersPanel";
import PlayerMessagesPanel from "./PlayerMessagesPanel";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import WorldBossEvent from "./WorldBossEvent";
import { useNotifications } from "@/hooks/useNotifications";
import CoinBalance from "./CoinBalance";
import CoinStoreItems from "./CoinStoreItems";

// Each location has a fixed map position (x/y as % of screen) and unlock requirements
const LOCATION_MAP_BIBLICAL = [
  { name: "Jerusalem",      region: "Judea",       x: 20, y: 30, emoji: "🏛️", unlockAt: 0,  description: "The Holy City — seat of kings and temple",        context: "Jerusalem during the era of kings and prophets, the temple mount, city of David" },
  { name: "Bethlehem",      region: "Judea",       x: 18, y: 52, emoji: "⭐", unlockAt: 3,  description: "The city of David — birthplace of hope",             context: "Bethlehem, birthplace of David and later Jesus, shepherds' fields and humble origins" },
  { name: "Judea",          region: "Judea",       x: 30, y: 65, emoji: "🏔️", unlockAt: 6,  description: "Rugged hills of testing and temptation",             context: "The hills and wilderness of Judea, where Jesus was tempted and prophets wandered" },
  { name: "Jericho",        region: "Jordan",      x: 40, y: 48, emoji: "🧱", unlockAt: 9,  description: "The walls that faith brought down",                  context: "Jericho, where Joshua's faith toppled walls, and Zacchaeus met Jesus" },
  { name: "Jordan River",   region: "Jordan",      x: 52, y: 38, emoji: "🌊", unlockAt: 12, description: "Waters of covenant and crossing over",                context: "The Jordan River, where Israel crossed into the promised land and Jesus was baptized" },
  { name: "Galilee",        region: "North",       x: 55, y: 22, emoji: "⛵", unlockAt: 15, description: "The fishing villages where disciples were called",    context: "The Sea of Galilee, fishing villages of Capernaum, where Jesus performed miracles" },
  { name: "Nazareth",       region: "North",       x: 45, y: 15, emoji: "🏘️", unlockAt: 18, description: "The humble town that raised the Messiah",            context: "Nazareth, a small overlooked Galilean village, home of Jesus and the holy family" },
  { name: "Mount Sinai",    region: "Sinai",       x: 22, y: 78, emoji: "⚡", unlockAt: 21, description: "Where God spoke in fire and wrote the Law",          context: "Mount Sinai in the wilderness, where Moses received the Ten Commandments from God" },
  { name: "Egypt",          region: "Africa",      x: 8,  y: 68, emoji: "🌴", unlockAt: 24, description: "Land of bondage, plagues, and divine power",         context: "Ancient Egypt, land of Pharaohs, where Israel was enslaved and Moses led them out" },
  { name: "Damascus",       region: "Syria",       x: 65, y: 12, emoji: "🌟", unlockAt: 27, description: "Where persecution became revelation",                context: "Damascus, where Paul was blinded by light and transformed from persecutor to apostle" },
  { name: "Babylon",        region: "Mesopotamia", x: 80, y: 28, emoji: "🗼", unlockAt: 30, description: "Empire of exile — where faith faced the furnace",    context: "Babylon, where Daniel and his companions refused to bow, and Israel grieved in exile" },
  { name: "Athens",         region: "Greece",      x: 15, y: 18, emoji: "🏺", unlockAt: 33, description: "City of philosophers — where wisdom met the Word",   context: "Athens, the intellectual capital of the ancient world, where Paul addressed the Areopagus" },
  { name: "Corinth",        region: "Greece",      x: 10, y: 35, emoji: "⚓", unlockAt: 36, description: "Port city of grace and division",                    context: "Corinth, a wealthy port city of moral compromise where Paul planted a fragile church" },
  { name: "Ephesus",        region: "Asia Minor",  x: 68, y: 40, emoji: "🕌", unlockAt: 39, description: "Great city of commerce and the goddess Diana",       context: "Ephesus, where Paul preached for three years and John wrote to the church" },
  { name: "Rome",           region: "Italy",       x: 85, y: 50, emoji: "🏛️", unlockAt: 42, description: "Heart of empire — faith vs. Caesar",                context: "Rome, capital of the empire, where Paul was imprisoned and the early church was persecuted" },
];

const LOCATION_MAP_MODERN = [
  { name: "New York",       region: "Northeast",   x: 25, y: 20, emoji: "🗽", unlockAt: 0,  description: "The city that never sleeps — faith amid ambition",   context: "New York City, where millions chase dreams and battle isolation in a vertical world" },
  { name: "San Francisco",  region: "West",        x: 15, y: 35, emoji: "🌉", unlockAt: 3,  description: "Where innovation questions tradition",               context: "San Francisco, a tech hub challenging conventional beliefs and social norms" },
  { name: "Los Angeles",    region: "West",        x: 10, y: 50, emoji: "🎬", unlockAt: 6,  description: "The entertainment capital — image vs. authenticity",  context: "Los Angeles, where appearance matters, and substance is questioned" },
  { name: "Chicago",        region: "Midwest",     x: 45, y: 18, emoji: "🏙️", unlockAt: 9,  description: "The industrial heart — progress at what cost?",     context: "Chicago, a city of hard work and moral complexity" },
  { name: "Houston",        region: "South",       x: 50, y: 50, emoji: "🔬", unlockAt: 12, description: "Mission control — science and faith collide",       context: "Houston, where aerospace science pushes boundaries and questions arise" },
  { name: "Austin",         region: "South",       x: 45, y: 55, emoji: "🎸", unlockAt: 15, description: "Live music capital — freedom and excess",            context: "Austin, a city celebrating creativity, freedom, and the tension between right and wrong" },
  { name: "Nashville",      region: "South",       x: 55, y: 40, emoji: "🎤", unlockAt: 18, description: "Music city — storytelling and redemption",           context: "Nashville, where stories of faith, struggle, and grace fill every song" },
  { name: "Boston",         region: "Northeast",   x: 30, y: 15, emoji: "🍎", unlockAt: 21, description: "Historic hub — where revolutions begin",             context: "Boston, birthplace of American ideals and ongoing debates about justice" },
  { name: "Miami",          region: "South",       x: 65, y: 60, emoji: "🏖️", unlockAt: 24, description: "Melting pot — diversity and division",                context: "Miami, where multiple cultures clash and coexist, testing identity and belonging" },
  { name: "Seattle",        region: "Northwest",   x: 8,  y: 10, emoji: "☕", unlockAt: 27, description: "Coffee capital — wealth and homelessness",           context: "Seattle, where prosperity neighbors poverty, raising questions about justice" },
  { name: "Denver",         region: "Mountain",    x: 35, y: 40, emoji: "⛰️", unlockAt: 30, description: "Mile high — ambition and consequence",                context: "Denver, where climbing higher mirrors the struggles of ambition in life" },
  { name: "Portland",       region: "Northwest",   x: 12, y: 8,  emoji: "🌲", unlockAt: 33, description: "Keep Portland weird — authenticity vs. conformity",   context: "Portland, celebrating individuality while questioning mainstream values" },
  { name: "Philadelphia",   region: "Northeast",   x: 35, y: 20, emoji: "🔔", unlockAt: 36, description: "Birthplace of independence — freedom's cost",       context: "Philadelphia, where American freedom was declared and its price debated" },
  { name: "Atlanta",        region: "South",       x: 60, y: 45, emoji: "🍑", unlockAt: 39, description: "City too busy to hate — healing from division",     context: "Atlanta, a city working toward reconciliation and lifting communities" },
  { name: "Washington DC",  region: "Mid-Atlantic", x: 40, y: 25, emoji: "🏛️", unlockAt: 42, description: "Power capital — truth and consequences",              context: "Washington DC, where decisions affect millions and moral leadership is tested" },
];

const LOCATION_MAP = [];

export default function RPGWorld({ character, progress, onStartMission, onViewStats, onViewLeaderboard, onReset, userEmail, characterId, theologianMode, modernMode }) {
  const mousePos = useContext(MouseContext);
  const { playSound } = useSoundEffects();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const LOCATION_MAP = modernMode ? LOCATION_MAP_MODERN : LOCATION_MAP_BIBLICAL;
  const [showMenu, setShowMenu] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showOnlinePlayers, setShowOnlinePlayers] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(0);
  const [activeCombat, setActiveCombat] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCoinStore, setShowCoinStore] = useState(false);

  // Track how many missions completed per location
  const totalMissionsCompleted = progress.completed_missions?.length || 0;
  const missionsCompletedAtLocation = (loc) => {
    const needed = loc.unlockAt;
    return Math.max(0, Math.min(3, totalMissionsCompleted - needed));
  };
  const isUnlocked = (loc) => totalMissionsCompleted >= loc.unlockAt;
  const isNext = (loc) => !isUnlocked(loc) && LOCATION_MAP.find(l => l.unlockAt === loc.unlockAt - 3) && isUnlocked(LOCATION_MAP.find(l => l.unlockAt === loc.unlockAt - 3));
  const isComplete = (loc) => missionsCompletedAtLocation(loc) >= 3;

  // Fetch player coins
  const { data: playerCoinsData } = useQuery({
    queryKey: ["player-coins", userEmail],
    queryFn: () => db.entities.PlayerCoins.filter({ player_email: userEmail }),
    enabled: !!userEmail,
  });

  const playerCoins = playerCoinsData?.[0]?.coins || 0;

  useOnlineStatus(userEmail, character.name, character.name.toLowerCase(), progress.level, selectedLocation?.name || "Jerusalem");
  useNotifications(userEmail, character.name);

  // Set random starting location on mount
  React.useEffect(() => {
    if (!selectedLocation && LOCATION_MAP.length > 0) {
      const starterLocs = LOCATION_MAP.filter(l => l.unlockAt <= 3);
      const randomLoc = starterLocs[Math.floor(Math.random() * starterLocs.length)];
      setSelectedLocation(randomLoc);
    }
  }, []);

  // Generate clouds and stars once (stable references)
  const clouds = React.useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (i * 15) % 100,
      y: Math.random() * 30 + 5,
      size: Math.random() * 80 + 60,
    })), []);

  const starsArray = React.useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 50,
      size: Math.random() * 2 + 0.5,
    })), []);

  const { encounter, encounterActive, dismissEncounter, acceptEncounter } = useRandomEncounter(
    progress.level,
    selectedLocation?.name || "wilderness"
  );
  const { achievements, unlockedAchievements } = useAchievements(userEmail, {
    level: progress.level,
    faith_score: progress.faith_score,
    wisdom_score: progress.wisdom_score,
    obedience_score: progress.obedience_score,
    integrity_score: progress.integrity_score,
  });

  useGameSave(userEmail, progress);
  const { difficulty } = useGameDifficulty(progress.level, progress.completed_missions?.length || 0);

  const levelTitles = ["Seeker", "Disciple", "Servant", "Warrior", "Prophet"];
  const currentLevelTitle = levelTitles[Math.min(progress.level - 1, 4)];
  const xpToNextLevel = progress.level * 100;
  const xpProgress = (progress.xp % xpToNextLevel) / xpToNextLevel;

  // Subtle day-night cycle - reduced frequency
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay((prev) => (prev + 0.001) % 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Calculate sky colors based on time of day
  const getSkyGradient = () => {
    let t = timeOfDay;
    if (t < 0.25) {
      // Night to dawn (0-0.25)
      const p = t / 0.25;
      return `linear-gradient(180deg, hsl(${220 + p * 30}, 50%, ${15 + p * 15}%), hsl(${200 + p * 40}, 60%, ${10 + p * 20}%))`;
    } else if (t < 0.5) {
      // Dawn to day (0.25-0.5)
      const p = (t - 0.25) / 0.25;
      return `linear-gradient(180deg, hsl(${250 - p * 100}, 70%, ${30 + p * 20}%), hsl(${240 - p * 80}, 80%, ${25 + p * 25}%))`;
    } else if (t < 0.75) {
      // Day to dusk (0.5-0.75)
      const p = (t - 0.5) / 0.25;
      return `linear-gradient(180deg, hsl(${150 + p * 100}, 70%, ${50 - p * 10}%), hsl(${160 + p * 80}, 80%, ${55 - p * 15}%))`;
    } else {
      // Dusk to night (0.75-1)
      const p = (t - 0.75) / 0.25;
      return `linear-gradient(180deg, hsl(${250 - p * 30}, 60%, ${45 - p * 30}%), hsl(${240 - p * 40}, 70%, ${28 - p * 18}%))`;
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 overflow-hidden"
      style={{ background: getSkyGradient() }}
    >
      {/* Mist Clouds - soft and large */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {clouds.map((cloud) => (
          <motion.div
            key={`cloud-${cloud.id}`}
            className="absolute"
            style={{
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
              width: `${cloud.size * 1.3}px`,
              height: `${cloud.size * 0.6}px`,
              background: `radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.25) 35%, transparent 70%)`,
              filter: "blur(50px)",
              opacity: 0.85,
            }}
            animate={{ x: [0, 100, 0] }}
            transition={{ duration: 30 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* Moving Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {starsArray.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: "0 0 3px rgba(255,255,255,0.8)",
            }}
            animate={{ 
              x: [0, 100],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{ duration: 20 + (star.id % 10) * 2, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* Simplified stars - static for performance */}

      {/* Floating particles disabled for performance */}

      {/* User Menu Bar */}
      <UserMenuBar
        progress={progress}
        playerCoins={playerCoins}
        onInventory={() => setShowInventory(true)}
        onJournal={() => setShowJournal(true)}
        onStats={onViewStats}
        onSkills={() => setShowSkillTree(true)}
        onAchievements={() => setShowAchievements(true)}
        onPlayers={() => setShowOnlinePlayers(true)}
        onMessages={() => setShowMessages(true)}
        onCoins={() => setShowCoinStore(true)}
        onSettings={() => setShowMenu(!showMenu)}
      />

      {/* Coin Balance HUD */}
      <CoinBalance playerEmail={userEmail} />

      {/* World Boss Event */}
      <WorldBossEvent
        playerEmail={userEmail}
        playerName={character.name}
        playerLevel={progress.level}
      />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur border-b border-white/10 p-2 md:p-4 max-h-20 md:max-h-auto overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          <div className="hidden md:block">
            <h2 className="font-display text-2xl font-bold text-white">{character.name}'s Realm</h2>
            <p className="text-white/60 text-sm">
              {currentLevelTitle} • Level {progress.level} • {progress.xp} XP • Difficulty: {(difficulty * 100).toFixed(0)}%
            </p>
          </div>
          <div className="md:hidden text-white/60 text-xs">
            <p className="font-bold text-white">{character.name}</p>
            <p>Level {progress.level}</p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 flex-wrap md:flex-nowrap">
            <button
              onClick={() => setShowCoinStore(true)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white relative"
              title="Coin Store"
            >
              <Zap className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button
              onClick={() => setShowOnlinePlayers(!showOnlinePlayers)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white hidden sm:block"
              title="Online Players"
            >
              <Users className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button
              onClick={() => setShowSkillTree(true)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white hidden sm:block"
              title="Skill Tree"
            >
              <GitBranch className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button
              onClick={() => setShowInventory(true)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title="Inventory"
            >
              <Backpack className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button
              onClick={() => setShowJournal(true)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title="Quest Journal"
            >
              <BookOpen className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button
              onClick={onViewStats}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white hidden md:block"
            >
              <BarChart3 className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white relative hidden md:block"
              title="Achievements"
            >
              <Trophy className="w-4 md:w-5 h-4 md:h-5" />
              {unlockedAchievements.length > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </button>
            <button
              onClick={onViewLeaderboard}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white hidden md:block"
            >
              <BarChart3 className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <Menu className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-14 right-4 bg-black/90 border border-white/20 rounded-lg overflow-hidden"
              >
                <button
                  onClick={onReset}
                  className="w-full px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  New Game
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute top-24 md:top-20 left-4 z-10 bg-black/70 backdrop-blur border border-white/20 rounded-lg p-3 max-w-xs">
        <p className="text-white/60 text-xs font-body uppercase tracking-wider mb-1">World Map</p>
        <p className="text-white/80 text-xs">{totalMissionsCompleted} missions completed</p>
        <p className="text-white/50 text-xs mt-0.5">{LOCATION_MAP.filter(l => isUnlocked(l)).length}/{LOCATION_MAP.length} regions unlocked</p>
      </div>

      {/* World Canvas - connection lines between unlocked locations */}
      <div className="absolute inset-0 top-20 pointer-events-none">
        <svg className="w-full h-full opacity-20">
          {LOCATION_MAP.map((loc, i) => {
            if (i === 0) return null;
            const prev = LOCATION_MAP[i - 1];
            if (!isUnlocked(loc)) return null;
            return (
              <line
                key={loc.name}
                x1={`${prev.x}%`} y1={`${prev.y}%`}
                x2={`${loc.x}%`} y2={`${loc.y}%`}
                stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4,4"
              />
            );
          })}
        </svg>
      </div>

      {/* Location Portals scattered across map */}
      <div className="absolute inset-0 top-20">
        {LOCATION_MAP.map((loc) => {
          const unlocked = isUnlocked(loc);
          const next = isNext(loc);
          const complete = isComplete(loc);
          const done = missionsCompletedAtLocation(loc);
          if (!unlocked && !next) return null;
          return (
            <div
              key={loc.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            >
              <div className="relative group">
                <motion.button
                  whileHover={unlocked ? { scale: 1.15 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  onClick={() => unlocked && (playSound("missionSelect"), setSelectedLocation(loc))}
                  className={`relative flex flex-col items-center gap-1 ${unlocked ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
                >
                  {/* Glow ring for active/unlocked */}
                  {unlocked && !complete && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-accent"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      style={{ width: 48, height: 48, margin: "auto", left: 0, right: 0, top: 0, bottom: 0 }}
                    />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                    complete ? "bg-green-500/20 border-green-500" :
                    next ? "bg-white/5 border-white/20" :
                    "bg-black/60 border-accent/60"
                  }`}>
                    {complete ? "✅" : loc.emoji}
                  </div>
                  <p className={`font-display text-xs font-bold text-center leading-tight max-w-16 ${
                    complete ? "text-green-400" : unlocked ? "text-white" : "text-white/40"
                  }`}>{loc.name}</p>
                  {unlocked && !complete && (
                    <div className="flex gap-0.5">
                      {[0,1,2].map(i => (
                        <div key={i} className={`w-2 h-1 rounded-full ${ i < done ? "bg-accent" : "bg-white/20"}`} />
                      ))}
                    </div>
                  )}
                  {next && <p className="text-white/30 text-xs">{loc.unlockAt - totalMissionsCompleted} more</p>}
                </motion.button>

                {/* Tooltip */}
                {unlocked && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 border border-white/20 rounded-lg p-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <p className="text-white/50 text-xs mb-0.5">{loc.region}</p>
                    <p className="text-white text-xs font-semibold">{loc.description}</p>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Player orb */}
      <motion.div
        className="absolute w-8 h-8 bg-white rounded-full shadow-2xl shadow-white/50 pointer-events-none z-10"
        style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%`, transform: "translate(-50%, -50%)" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-white blur-xl"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Mission Selection Modal */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedLocation(null)}
          className="absolute inset-0 bg-black/60 flex items-center justify-center z-30 pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/90 border border-white/20 rounded-xl p-8 max-w-md w-full"
          >
            <h3 className="font-display text-3xl font-bold text-white mb-1 flex items-center gap-2">
              <span>{selectedLocation.emoji}</span> {selectedLocation.name}
            </h3>
            <p className="text-white/40 text-xs mb-1">{selectedLocation.region}</p>
            <p className="text-white/60 text-sm mb-4">{selectedLocation.description}</p>
            <p className="text-white/50 text-xs italic mb-6">{selectedLocation.context}</p>

            <div className="flex gap-1 mb-6">
              {[0,1,2].map(i => (
                <div key={i} className={`h-2 flex-1 rounded-full ${ i < missionsCompletedAtLocation(selectedLocation) ? "bg-accent" : "bg-white/20"}`} />
              ))}
            </div>

            <div className="space-y-2 mb-6">
              {[1, 2, 3].map((num) => {
                const done = missionsCompletedAtLocation(selectedLocation);
                const completed = num <= done;
                return (
                  <motion.button
                    key={num}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      playSound("missionSelect");
                      onStartMission(`trial_${selectedLocation.name}_${num}`, userEmail, characterId, selectedLocation);
                      setSelectedLocation(null);
                    }}
                    className={`w-full px-4 py-2 rounded-lg transition-colors text-left font-body text-sm flex items-center gap-2 ${
                      completed ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {completed ? "✅" : <Zap className="w-4 h-4" />}
                    Trial {num} {completed ? "(Completed)" : ""}
                  </motion.button>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedLocation(null)}
              className="w-full px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Skill Tree Modal */}
      {showSkillTree && (
        <SkillTreeView
          playerEmail={userEmail}
          progress={progress}
          onBack={() => setShowSkillTree(false)}
        />
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <InventoryView
          playerEmail={userEmail}
          character={character}
          progress={progress}
          onBack={() => setShowInventory(false)}
        />
      )}

      {/* Quest Journal Modal */}
      {showJournal && (
        <QuestJournal
          playerEmail={userEmail}
          character={character}
          progress={progress}
          onBack={() => setShowJournal(false)}
        />
      )}

      {/* Game Completion Screen */}
      {gameCompleted && (
        <GameCompletionModal
          character={character}
          finalStats={progress}
          onReset={onReset}
        />
      )}

      {/* Achievements Panel */}
      {showAchievements && !gameCompleted && (
        <AchievementPanel
          achievements={achievements}
          unlockedAchievements={unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Random Encounter Prompt */}
      <RandomEncounterPrompt
        encounter={encounter}
        playerProgress={progress}
        onDismiss={() => dismissEncounter()}
        onAccept={() => {
          playSound("combat");
          setActiveCombat(acceptEncounter());
        }}
      />

      {/* Online Players Panel - Modal */}
      {showOnlinePlayers && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowOnlinePlayers(false)}
          className="fixed inset-0 bg-black/60 z-40 pointer-events-auto"
        >
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-0 top-0 bottom-0 w-80 bg-black/90 border-r border-white/10 z-40 pointer-events-auto overflow-y-auto"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/95">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Online Players
              </h3>
              <button
                onClick={() => setShowOnlinePlayers(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <OnlinePlayersPanel
              currentPlayerEmail={userEmail}
              currentLocation={selectedLocation?.name || "wilderness"}
              onMessage={(player) => {
                setShowMessages(true);
                setShowOnlinePlayers(false);
              }}
              onCoopInvite={(player) => {
                playSound("decision");
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Messages Panel */}
      {showMessages && (
        <PlayerMessagesPanel
          playerEmail={userEmail}
          playerName={character.name}
          onClose={() => setShowMessages(false)}
        />
      )}

      {/* Coin Store Modal */}
      {showCoinStore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCoinStore(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-accent" />
                Coin Store
              </h3>
              <button
                onClick={() => setShowCoinStore(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <CoinStoreItems
              playerEmail={userEmail}
              coins={0}
              progress={progress}
              onPurchase={() => setShowCoinStore(false)}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Combat Encounter Modal */}
      {activeCombat && (
        <CombatEncounter
          character={character}
          progress={progress}
          enemyType={activeCombat.type}
          onCombatEnd={(victory) => {
            if (victory) {
              playSound("levelUp");
              // Optional: award random XP for defeating random encounter
            }
            setActiveCombat(null);
            dismissEncounter();
          }}
          playerEmail={userEmail}
        />
      )}

      {/* Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur border-t border-white/10 p-2 md:p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-2 md:gap-4">
          {[
            { label: "Faith", value: progress.faith_score, color: "from-blue-500 to-cyan-500" },
            { label: "Wisdom", value: progress.wisdom_score, color: "from-purple-500 to-pink-500" },
            { label: "Obedience", value: progress.obedience_score, color: "from-green-500 to-emerald-500" },
            { label: "Integrity", value: progress.integrity_score, color: "from-yellow-500 to-orange-500" },
          ].map((stat) => {
            const level = Math.floor(stat.value / 100) + 1;
            const progress = stat.value % 100;
            const nextLevelAt = 100;
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-0.5 md:mb-1">
                  <p className="text-white/60 text-xs font-semibold hidden md:block">{stat.label}</p>
                  <p className="text-white/60 text-xs font-semibold md:hidden">{stat.label.charAt(0)}</p>
                  <p className="text-accent text-xs font-bold">L{level}</p>
                </div>
                <div className="h-2 md:h-3 bg-white/10 rounded-full overflow-hidden border border-white/20 group-hover:border-white/40 transition-colors">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress / nextLevelAt) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-white/70 text-xs mt-0.5 md:mt-1 hidden md:block">{progress}/{nextLevelAt}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}