import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, Shield, BookOpen } from "lucide-react";

// Combat skills based on character stats
const SKILL_SETS = {
  faith: [
    { id: "prayer", name: "Divine Prayer", icon: BookOpen, damage: (stat) => stat * 0.8, cost: 15, description: "Invoke faith for judgment" },
    { id: "shield_faith", name: "Shield of Faith", icon: Shield, heal: (stat) => stat * 0.5, defense: 0.3, cost: 10, description: "Protect yourself with faith" },
    { id: "smite", name: "Divine Smite", icon: Zap, damage: (stat) => stat * 1.2, cost: 20, description: "Strike with holy power" },
  ],
  wisdom: [
    { id: "judgement", name: "Discernment", icon: BookOpen, damage: (stat) => stat * 0.9, cost: 15, description: "See weakness, strike true" },
    { id: "healing", name: "Restoration", icon: Heart, heal: (stat) => stat * 0.7, cost: 20, description: "Restore life and vitality" },
    { id: "counter", name: "Parry", icon: Shield, defense: 0.4, cost: 10, description: "Dodge incoming damage" },
  ],
  obedience: [
    { id: "steadfast", name: "Steadfast Blow", icon: Zap, damage: (stat) => stat * 1.0, cost: 12, description: "Unwavering strike" },
    { id: "fortify", name: "Inner Strength", icon: Shield, heal: (stat) => stat * 0.4, defense: 0.25, cost: 10, description: "Steel yourself" },
    { id: "discipline", name: "Discipline", icon: BookOpen, damage: (stat) => stat * 0.7, heal: (stat) => stat * 0.3, cost: 15, description: "Balanced attack and healing" },
  ],
  integrity: [
    { id: "righteousness", name: "Righteous Fury", icon: Zap, damage: (stat) => stat * 1.1, cost: 18, description: "Strike with conviction" },
    { id: "honor", name: "Code of Honor", icon: Shield, defense: 0.35, cost: 12, description: "Stand firm in honor" },
    { id: "truth", name: "Truth's Light", icon: BookOpen, damage: (stat) => stat * 0.75, heal: (stat) => stat * 0.4, cost: 16, description: "Heal through truth" },
  ],
};

const ENEMIES = {
  // Original
  demon: { name: "Demon of Temptation", maxHp: 80, baseDamage: 15, emoji: "👹", weakness: "faith", taunt: "Your faith is a lie!" },
  fallen_angel: { name: "Fallen Angel", maxHp: 100, baseDamage: 20, emoji: "🌑", weakness: "integrity", taunt: "Even the righteous fall." },
  shadow_self: { name: "Your Shadow Self", maxHp: 70, baseDamage: 18, emoji: "🪞", weakness: "wisdom", taunt: "You are no better than me." },
  // Theological Adversaries
  gnostic: { name: "Gnostic Deceiver", maxHp: 90, baseDamage: 16, emoji: "📜", weakness: "wisdom", taunt: "Secret knowledge is above Scripture!" },
  false_prophet: { name: "False Prophet", maxHp: 85, baseDamage: 19, emoji: "🐍", weakness: "integrity", taunt: "My words are just as divine!" },
  prosperity_spirit: { name: "Spirit of Prosperity Gospel", maxHp: 95, baseDamage: 17, emoji: "💰", weakness: "obedience", taunt: "God wants you wealthy above all!" },
  legalist: { name: "Pharisaical Legalist", maxHp: 75, baseDamage: 22, emoji: "⚖️", weakness: "faith", taunt: "Works alone will save you!" },
  syncretist: { name: "Syncretist Spirit", maxHp: 110, baseDamage: 14, emoji: "🌀", weakness: "integrity", taunt: "All paths lead to the same God!" },
  nihilist: { name: "Spirit of Nihilism", maxHp: 80, baseDamage: 21, emoji: "🕳️", weakness: "faith", taunt: "Nothing has meaning. Give up." },
  doubt_specter: { name: "Specter of Doubt", maxHp: 65, baseDamage: 24, emoji: "❓", weakness: "obedience", taunt: "Are you really sure God is real?" },
  heretic: { name: "Arch-Heretic", maxHp: 130, baseDamage: 18, emoji: "🔥", weakness: "wisdom", taunt: "I have rewritten the truth!" },
  // Location-specific
  soldier: { name: "Roman Soldier", maxHp: 70, baseDamage: 16, emoji: "⚔️", weakness: "obedience", taunt: "Bow to Caesar!" },
  guard: { name: "Temple Guard", maxHp: 75, baseDamage: 14, emoji: "🛡️", weakness: "faith", taunt: "This place is ours now!" },
  oppressor: { name: "Oppressor Spirit", maxHp: 85, baseDamage: 18, emoji: "😤", weakness: "integrity", taunt: "You will never be free!" },
  beast: { name: "Wild Beast", maxHp: 60, baseDamage: 20, emoji: "🐺", weakness: "wisdom", taunt: "*growls*" },
  outlaw: { name: "Bandit", maxHp: 55, baseDamage: 15, emoji: "🗡️", weakness: "obedience", taunt: "Hand over your faith!" },
  rebel: { name: "Zealot", maxHp: 65, baseDamage: 17, emoji: "✊", weakness: "integrity", taunt: "Violence is the only way!" },
  priest: { name: "Pagan Priest", maxHp: 88, baseDamage: 16, emoji: "🏛️", weakness: "faith", taunt: "Your God is just one among many!" },
};

function HealthBar({ current, max, label, color }) {
  const percentage = Math.max(0, (current / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-white/70 text-sm font-body">{label}</p>
        <p className="text-white font-display font-bold">{Math.max(0, current)}/{max}</p>
      </div>
      <div className="w-full h-3 rounded-full bg-white/10 border border-white/20 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          initial={{ width: "100%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function DamageNumber({ x, y, amount, type }) {
  return (
    <motion.div
      className={`fixed font-display font-bold text-lg pointer-events-none ${
        type === "damage" ? "text-red-400" : "text-green-400"
      }`}
      style={{ left: x, top: y }}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -50 }}
      transition={{ duration: 1.5 }}
    >
      {type === "damage" ? "-" : "+"}{Math.round(amount)}
    </motion.div>
  );
}

export default function CombatEncounter({ character, progress, enemyType = "demon", onCombatEnd, playerEmail }) {
  const enemy = ENEMIES[enemyType] || ENEMIES.demon;
  const queryClient = useQueryClient();
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(enemy.maxHp);
  const [skillsToChoose, setSkillsToChoose] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [combatLog, setCombatLog] = useState([`${enemy.emoji} ${enemy.name} appears! "${enemy.taunt}"`]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [playerSkills, setPlayerSkills] = useState({});
  const [itemBonuses, setItemBonuses] = useState({ faith: 0, wisdom: 0, obedience: 0, integrity: 0 });

  // Fetch equipped items and compute stat bonuses
  const { data: equippedInventory = [] } = useQuery({
    queryKey: ["equipped-inventory", playerEmail],
    queryFn: () => db.entities.PlayerInventory.filter({ player_email: playerEmail, equipped: true }),
    enabled: !!playerEmail,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["all-items"],
    queryFn: () => db.entities.Item.list(),
    enabled: !!playerEmail,
  });

  // Fetch player skills
  const { data: fetchedPlayerSkills } = useQuery({
    queryKey: ["player-skills", playerEmail],
    queryFn: () => db.entities.PlayerSkill.filter({ player_email: playerEmail }),
    enabled: !!playerEmail,
  });

  // Update mutation for skill progression
  const updateSkillMutation = useMutation({
    mutationFn: async (skillId) => {
      const existingSkill = fetchedPlayerSkills?.find((s) => s.skill_id === skillId);
      if (existingSkill) {
        const newLevel = Math.floor(existingSkill.uses_count / 5) + 1;
        await db.entities.PlayerSkill.update(existingSkill.id, {
          uses_count: existingSkill.uses_count + 1,
          level: newLevel,
        });
      } else {
        await db.entities.PlayerSkill.create({
          player_email: playerEmail,
          skill_id: skillId,
          skill_name: skillId.replace(/_/g, " ").toUpperCase(),
          level: 1,
          uses_count: 1,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["player-skills", playerEmail] });
    },
  });

  // Compute item bonuses whenever equipped inventory changes
  useEffect(() => {
    if (equippedInventory.length === 0 || allItems.length === 0) return;
    const bonuses = { faith: 0, wisdom: 0, obedience: 0, integrity: 0 };
    equippedInventory.forEach((inv) => {
      const item = allItems.find((i) => i.id === inv.item_id);
      if (!item) return;
      if (item.faith_boost) bonuses.faith += item.faith_boost;
      if (item.wisdom_boost) bonuses.wisdom += item.wisdom_boost;
      if (item.obedience_boost) bonuses.obedience += item.obedience_boost;
      if (item.integrity_boost) bonuses.integrity += item.integrity_boost;
    });
    setItemBonuses(bonuses);
  }, [equippedInventory, allItems]);

  // Initialize skills and map to player progression
  useEffect(() => {
    const stats = {
      faith: (progress.faith_score || 0) + itemBonuses.faith,
      wisdom: (progress.wisdom_score || 0) + itemBonuses.wisdom,
      obedience: (progress.obedience_score || 0) + itemBonuses.obedience,
      integrity: (progress.integrity_score || 0) + itemBonuses.integrity,
    };

    const topStat = Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0];
    setSkillsToChoose(SKILL_SETS[topStat] || SKILL_SETS.faith);

    if (fetchedPlayerSkills) {
      const skillMap = {};
      fetchedPlayerSkills.forEach((skill) => { skillMap[skill.skill_id] = skill; });
      setPlayerSkills(skillMap);
    }
  }, [progress, fetchedPlayerSkills, itemBonuses]);

  // Stats include equipped item bonuses
  const getEffectiveStats = () => ({
    faith: (progress.faith_score || 0) + itemBonuses.faith,
    wisdom: (progress.wisdom_score || 0) + itemBonuses.wisdom,
    obedience: (progress.obedience_score || 0) + itemBonuses.obedience,
    integrity: (progress.integrity_score || 0) + itemBonuses.integrity,
  });

  const castSkill = (skill) => {
    if (!isPlayerTurn) return;

    let damage = 0;
    let healing = 0;
    let defense = 0;

    // Get skill progression
    const skillProgress = playerSkills[skill.id];
    const skillLevel = skillProgress?.level || 1;
    const skillUses = skillProgress?.uses_count || 0;

    // Calculate damage multiplier: +10% per level (1.0 + (level-1) * 0.1)
    const damageMultiplier = 1 + (skillLevel - 1) * 0.1;
    
    // Calculate cost reduction: -5% per level (capped at 50% reduction)
    const costReduction = Math.min(0.5, (skillLevel - 1) * 0.05);

    // Calculate damage using effective stats (base + item bonuses)
    const effectiveStats = getEffectiveStats();
    const topStat = Math.max(...Object.values(effectiveStats));
    // Bonus multiplier if player's top stat matches enemy weakness
    const weaknessBonus = enemy.weakness && effectiveStats[enemy.weakness] === topStat ? 1.35 : 1.0;

    if (skill.damage) {
      damage = skill.damage(topStat + 10) * damageMultiplier * weaknessBonus;
    }
    if (skill.heal) {
      healing = skill.heal(topStat + 10) * damageMultiplier;
    }

    // Apply damage to enemy
    const newEnemyHp = enemyHp - damage;
    setEnemyHp(newEnemyHp);

    // Apply healing to player
    const newPlayerHp = Math.min(100, playerHp + healing);
    setPlayerHp(newPlayerHp);

    // Add damage number
    if (damage > 0) {
      setDamageNumbers((prev) => [...prev, { id: Date.now(), x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", amount: damage, type: "damage" }]);
    }
    if (healing > 0) {
      setDamageNumbers((prev) => [...prev, { id: Date.now() + 1, x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", amount: healing, type: "heal" }]);
    }

    // Build log message
    let logEntry = `You cast ${skill.name}`;
    if (skillLevel > 1) {
      logEntry += ` (Level ${skillLevel})`;
    }
    logEntry += `!${damage > 0 ? ` Dealt ${Math.round(damage)} damage.` : ""}${healing > 0 ? ` Healed ${Math.round(healing)} HP.` : ""}`;
    
    setCombatLog((prev) => [logEntry, ...prev.slice(0, 3)]);

    // Update skill progression
    updateSkillMutation.mutate(skill.id);

    // Check if enemy is defeated
    if (newEnemyHp <= 0) {
      setGameOver(true);
      setWinner("player");
      setCombatLog((prev) => [`You defeated the ${enemy.name}!`, ...prev]);
      return;
    }

    setIsPlayerTurn(false);
    setSelectedSkill(null);

    // Enemy turn after delay
    setTimeout(() => {
      enemyAttack();
    }, 800);
  };

  const enemyAttack = () => {
    const damage = enemy.baseDamage + Math.random() * 10;
    const newPlayerHp = playerHp - damage;
    setPlayerHp(newPlayerHp);

    setDamageNumbers((prev) => [...prev, { id: Date.now(), x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", amount: damage, type: "damage" }]);

    setCombatLog((prev) => [`${enemy.name} attacks! Dealt ${Math.round(damage)} damage.`, ...prev.slice(0, 3)]);

    // Check if player is defeated
    if (newPlayerHp <= 0) {
      setGameOver(true);
      setWinner("enemy");
      setCombatLog((prev) => [`You were defeated...`, ...prev]);
      return;
    }

    setIsPlayerTurn(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
    >
      {/* Damage numbers */}
      <AnimatePresence>
        {damageNumbers.map((dmg) => (
          <DamageNumber key={dmg.id} x={dmg.x} y={dmg.y} amount={dmg.amount} type={dmg.type} />
        ))}
      </AnimatePresence>

      <div className="max-w-2xl w-full">
        {/* Enemy Card */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-red-500/20 to-red-500/5 border-2 border-red-500/40 rounded-xl p-6 mb-8">
          <h2 className="font-display text-2xl font-bold text-red-400 mb-4">{enemy.name}</h2>
          <HealthBar current={enemyHp} max={enemy.maxHp} label="Enemy HP" color="from-red-500 to-red-600" />
        </motion.div>

        {/* Player Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/40 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-blue-400">{character.name}</h2>
            {/* Enemy weakness indicator */}
            {enemy.weakness && (
              <span className="text-xs font-body px-2 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                ⚡ Weak to {enemy.weakness}
              </span>
            )}
          </div>
          <HealthBar current={playerHp} max={100} label="Your HP" color="from-blue-500 to-blue-600" />
          {/* Item bonuses display */}
          {Object.values(itemBonuses).some((v) => v > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(itemBonuses).filter(([, v]) => v > 0).map(([stat, val]) => (
                <span key={stat} className="text-xs font-body px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  +{val} {stat}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Combat Log */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 h-20 overflow-y-auto">
          <div className="space-y-1 font-body text-xs text-white/70">
            {combatLog.map((log, idx) => (
              <motion.p key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                {log}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Skills or Game Over */}
        {!gameOver ? (
          <div className="space-y-3">
            <p className="text-white/60 text-sm font-body">{isPlayerTurn ? "Select a skill:" : "Enemy is attacking..."}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {skillsToChoose.map((skill) => {
                const Icon = skill.icon;
                const skillData = playerSkills[skill.id];
                const skillLevel = skillData?.level || 1;
                return (
                  <motion.button
                    key={skill.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => castSkill(skill)}
                    disabled={!isPlayerTurn}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isPlayerTurn
                        ? "border-white/30 hover:border-accent bg-white/5 hover:bg-white/10 cursor-pointer"
                        : "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-accent" />
                        <p className="font-display font-bold text-white text-sm">{skill.name}</p>
                      </div>
                      {skillLevel > 1 && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-accent/20 text-accent">
                          Lv{skillLevel}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-white/60">{skill.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-accent rounded-xl p-8 text-center">
            <h3 className={`font-display text-3xl font-bold mb-4 ${winner === "player" ? "text-green-400" : "text-red-400"}`}>
              {winner === "player" ? "Victory!" : "Defeat..."}
            </h3>
            <p className="text-white/70 mb-6 font-body">
              {winner === "player" ? `You defeated the ${enemy.name} and grew stronger.` : "You have been defeated. Learn from this encounter."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCombatEnd(winner === "player")}
              className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
            >
              Continue
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}