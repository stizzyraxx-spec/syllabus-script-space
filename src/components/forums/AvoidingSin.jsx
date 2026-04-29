import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Volume2, VolumeX } from "lucide-react";
import { db } from "@/api/supabaseClient";

// Characters to choose from
const CHARACTERS = [
  { id: "david", name: "David", emoji: "👨", color: "#60a5fa" },
  { id: "ruth", name: "Ruth", emoji: "👩", color: "#ec4899" },
  { id: "timothy", name: "Timothy", emoji: "🧑", color: "#8b5cf6" },
  { id: "priscilla", name: "Priscilla", emoji: "👸", color: "#f59e0b" },
];

// Sin types represented by symbols
const SIN_TYPES = [
  { id: "pride", symbol: "👑", label: "Pride", color: "#fbbf24" },
  { id: "greed", symbol: "💰", label: "Greed", color: "#ef4444" },
  { id: "wrath", symbol: "🔥", label: "Wrath", color: "#dc2626" },
  { id: "lust", symbol: "💔", label: "Lust", color: "#f43f5e" },
  { id: "envy", symbol: "👀", label: "Envy", color: "#06b6d4" },
  { id: "gluttony", symbol: "🍔", label: "Gluttony", color: "#f97316" },
  { id: "sloth", symbol: "😴", label: "Sloth", color: "#6366f1" },
];

// Game constants
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 40;
const GRAVITY = 0.4;
const JUMP_POWER = -10;
const OBSTACLE_WIDTH = 100;
const OBSTACLE_GAP = 140;
const OBSTACLE_SPEED = 5;
const SPAWN_RATE = 90; // pixels between obstacles

export default function AvoidingSin() {
  const [gameState, setGameState] = useState("character-select"); // character-select | playing | game-over
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(GAME_HEIGHT / 2);
  const [playerVelocity, setPlayerVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const gameRef = useRef(null);
  const obstacleCounterRef = useRef(0);
  const nextIdRef = useRef(0);
  const gameLoopRef = useRef(null);
  const spawnTimerRef = useRef(0);

  // Save score when game ends
  useEffect(() => {
    if (gameState !== "game-over" || score === 0) return;
    db.auth.isAuthenticated().then(async (authed) => {
      if (!authed) return;
      try {
        const user = await db.auth.me();
        if (user) {
          await db.entities.GameScore.create({
            player_email: user.email,
            player_name: user.full_name,
            game_type: "avoiding_sin",
            score,
            difficulty: "normal",
          });
        }
      } catch (error) {
        console.error("Failed to save score:", error);
      }
    });
  }, [gameState]);

  // Start game
  const startGame = (character) => {
    setSelectedCharacter(character);
    setGameState("playing");
    setScore(0);
    setPlayerY(GAME_HEIGHT / 2);
    setPlayerVelocity(0);
    setObstacles([]);
    setGameOver(false);
    obstacleCounterRef.current = 0;
    nextIdRef.current = 0;
    spawnTimerRef.current = 0;
  };

  // Handle jump
  const handleJump = useCallback(() => {
    if (gameState === "playing" && !gameOver) {
      setPlayerVelocity(JUMP_POWER);
    }
  }, [gameState, gameOver]);

  // Main game loop
  useEffect(() => {
    if (gameState !== "playing" || !gameRef.current) return;

    gameLoopRef.current = setInterval(() => {
      setPlayerY((prevY) => {
        let newY = prevY + playerVelocity;
        setPlayerVelocity((prev) => {
          const newVel = prev + GRAVITY;
          return newVel;
        });

        // Boundary check
        if (newY < 0 || newY + PLAYER_SIZE > GAME_HEIGHT) {
          setGameState("game-over");
          setGameOver(true);
          return prevY;
        }

        return newY;
      });

      // Move obstacles and check collision
      setObstacles((prevObstacles) => {
        let newObstacles = prevObstacles
          .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
          .filter((obs) => obs.x > -OBSTACLE_WIDTH);

        // Spawn new obstacle
        spawnTimerRef.current += OBSTACLE_SPEED;
        if (spawnTimerRef.current > SPAWN_RATE) {
          spawnTimerRef.current = 0;
          const gapStart = Math.random() * (GAME_HEIGHT - OBSTACLE_GAP);
          newObstacles.push({
            id: nextIdRef.current++,
            x: GAME_WIDTH,
            gapStart: gapStart,
            sin: SIN_TYPES[Math.floor(Math.random() * SIN_TYPES.length)],
          });
        }

        // Check collision with current playerY
        setPlayerY((currentY) => {
          for (let obs of newObstacles) {
            if (
              obs.x < GAME_WIDTH / 2 + PLAYER_SIZE / 2 &&
              obs.x + OBSTACLE_WIDTH > GAME_WIDTH / 2 - PLAYER_SIZE / 2
            ) {
              // Check if player passed through gap
              if (
                currentY < obs.gapStart ||
                currentY + PLAYER_SIZE > obs.gapStart + OBSTACLE_GAP
              ) {
                setGameState("game-over");
                setGameOver(true);
              } else {
                // Player made it through
                if (!obs.scored) {
                  setScore((s) => s + 1);
                  obs.scored = true;
                }
              }
            }
          }
          return currentY;
        });

        return newObstacles;
      });
    }, 30);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState]);

  // Keyboard/click listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    gameRef.current?.addEventListener("click", handleJump);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      gameRef.current?.removeEventListener("click", handleJump);
    };
  }, [handleJump]);

  // Character selection screen
  if (gameState === "character-select") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Avoiding Sin
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Navigate your faith through temptations. Tap to jump and avoid sin!
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="font-body text-sm font-semibold text-foreground mb-4">
            Choose Your Character:
          </p>
          <div className="grid grid-cols-4 gap-3">
            {CHARACTERS.map((char) => (
              <motion.button
                key={char.id}
                onClick={() => startGame(char)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border bg-card hover:border-accent transition-colors"
              >
                <span className="text-4xl">{char.emoji}</span>
                <span className="font-body text-xs font-semibold text-foreground">
                  {char.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-4">
          <p className="font-body text-xs text-muted-foreground mb-3">
            <span className="font-semibold text-foreground">How to Play:</span>
          </p>
          <ul className="font-body text-xs text-muted-foreground space-y-1">
            <li>• Click or tap the screen to jump</li>
            <li>• Avoid the 7 sins represented by symbols</li>
            <li>• Stay on the straight path through temptation</li>
            <li>• Each sin you dodge earns you 1 point</li>
          </ul>
        </div>
      </div>
    );
  }

  // Game screen
  if (gameState === "playing") {
    const char = selectedCharacter;

    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {char.name}'s Journey
            </h2>
            <p className="font-body text-lg font-bold text-accent">
              Score: {score}
            </p>
          </div>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            {soundOn ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="w-full overflow-x-auto flex justify-center">
        <motion.div
          ref={gameRef}
          className="relative rounded-xl overflow-hidden bg-gradient-to-b from-blue-900/30 to-purple-900/30 border-2 border-border cursor-pointer flex-shrink-0"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-purple-900 opacity-50" />

          {/* Player */}
          <motion.div
            animate={{ y: playerY, rotate: playerVelocity * 2 }}
            transition={{ type: "tween", duration: 0 }}
            className="absolute left-12 w-10 h-10 flex items-center justify-center text-2xl z-20"
            style={{ width: PLAYER_SIZE, height: PLAYER_SIZE }}
          >
            {char.emoji}
          </motion.div>

          {/* Obstacles */}
          <AnimatePresence>
            {obstacles.map((obs) => (
              <div
                key={obs.id}
                className="absolute top-0 w-full pointer-events-none"
                style={{ left: obs.x }}
              >
                {/* Top obstacle */}
                <div
                  className="bg-gradient-to-b from-red-600/60 to-red-700/40 border-2 border-red-500 flex items-center justify-center text-3xl font-bold"
                  style={{
                    height: obs.gapStart,
                    width: OBSTACLE_WIDTH,
                    color: obs.sin.color,
                  }}
                >
                  {obs.sin.symbol}
                </div>

                {/* Bottom obstacle */}
                <div
                  className="bg-gradient-to-t from-red-600/60 to-red-700/40 border-2 border-red-500 flex items-center justify-center text-3xl font-bold"
                  style={{
                    marginTop: OBSTACLE_GAP,
                    height: GAME_HEIGHT - obs.gapStart - OBSTACLE_GAP,
                    width: OBSTACLE_WIDTH,
                    color: obs.sin.color,
                  }}
                >
                  {obs.sin.symbol}
                </div>
              </div>
            ))}
          </AnimatePresence>

          {/* Tap instruction */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="font-body text-sm text-white/40 text-center">
              Tap to Jump
            </p>
          </div>
        </motion.div>
        </div>

        <p className="font-body text-xs text-muted-foreground text-center mt-2">
          Press SPACE or tap the game area to jump
        </p>
      </div>
    );
  }

  // Game over screen
  if (gameState === "game-over") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto p-6 text-center"
      >
        <div className="mb-6">
          <div className="text-6xl mb-4">⛪</div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            Game Over
          </h2>
          <p className="font-body text-lg text-muted-foreground mb-4">
            {selectedCharacter?.name} encountered temptation...
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 mb-6 border border-accent/20">
          <p className="font-display text-5xl font-bold text-accent mb-2">
            {score}
          </p>
          <p className="font-body text-sm text-muted-foreground">
            {score === 1
              ? "Sin avoided"
              : "Sins avoided"}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setGameState("character-select")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>
          <button
            onClick={() => startGame(selectedCharacter)}
            className="w-full px-6 py-3 rounded-lg border border-border text-foreground font-body font-semibold hover:bg-secondary transition-colors"
          >
            Try Again with {selectedCharacter?.name}
          </button>
        </div>

        <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
          <p className="font-body text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Remember:</span> "No temptation has overtaken you
            except what is common to mankind. And God is faithful; he will not
            let you be tempted beyond what you can bear." — 1 Corinthians 10:13
          </p>
        </div>
      </motion.div>
    );
  }
}