import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";
import { MouseContext } from "@/lib/MouseContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { db } from "@/api/supabaseClient";
import CombatEncounter from "./CombatEncounter";
import { useCombatEncounter } from "@/hooks/useCombatEncounter";
import MissionTypeFetchQuest from "./MissionTypeFetchQuest";
import MissionTypeTimedChallenge from "./MissionTypeTimedChallenge";

// Fallback missions for offline support
const FALLBACK_MISSIONS = {
  david_bathsheba: {
    title: "David and Bathsheba",
    location: "Jerusalem",
    scripture: "2 Samuel 11 & 1 Corinthians 10:13",
    narrative: `You are King David, standing on your palace rooftop at sunset. A woman bathes below—Bathsheba, wife of Uriah, one of your finest soldiers away fighting your wars. She is striking. Desire stirs in your chest, and for a moment, you imagine how simple it would be. Your power is absolute; no one would dare oppose you.

But you know what this temptation costs. You also know that Uriah is a loyal man, and that your nation depends on your moral authority as much as your military strength.`,
    decisions: [
      {
        text: "Leave the rooftop immediately and immerse yourself in prayer and fasting",
        moralAlignment: "righteous",
        xp: 25,
        scoreChanges: { faith_score: 12, integrity_score: 15, obedience_score: 10, wisdom_score: 5 },
        consequence: "You flee temptation head-on, seeking God's strength. This honesty with yourself and the divine deepens your faith.",
        scripture: "1 Corinthians 10:13 - 'He will provide a way out so that you can endure it.'"
      },
      {
        text: "Send for her but confess your struggle to a trusted counselor before anything happens",
        moralAlignment: "righteous",
        xp: 24,
        scoreChanges: { faith_score: 10, integrity_score: 13, obedience_score: 9, wisdom_score: 8 },
        consequence: "You seek accountability and wisdom from others. This humility and transparency strengthen your resolve, though the path is harder.",
        scripture: "Proverbs 27:12 - 'The prudent see danger and take refuge, but the simple keep going and pay the penalty.'"
      },
      {
        text: "Send for her, treating it as a brief moment of weakness you'll repent for afterward",
        moralAlignment: "neutral",
        xp: 18,
        scoreChanges: { faith_score: -5, integrity_score: -10, obedience_score: -8, wisdom_score: 3 },
        consequence: "You rationalize sin as forgivable, but you underestimate how one choice multiplies into others. Repentance will be far harder than you imagine.",
        scripture: "Romans 6:16 - 'Don't you know that when you offer yourselves to someone as obedient slaves, you are slaves to the one you obey?'"
      }
    ]
  }
};

export default function RPGMission({ missionTheme, character, characterData, progress, onMissionComplete, onReturn, userEmail, theologianMode }) {
  const mousePos = useContext(MouseContext);
  const { playSound } = useSoundEffects();
  const { activeCombat, triggerCombat, clearCombat } = useCombatEncounter();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDecision, setCurrentDecision] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState(0);
  const [decisionMap, setDecisionMap] = useState(null);

  // Generate stars and clouds once (stable references)
  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 40,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
    })), []);

  const clouds = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (i * 15) % 100,
      y: Math.random() * 30 + 5,
      size: Math.random() * 80 + 60,
    })), []);

  // Force night time for mission atmosphere
  useEffect(() => {
    setTimeOfDay(0.9);
  }, []);

  // Calculate sky colors based on time of day
  const getSkyGradient = () => {
    let t = timeOfDay;
    if (t < 0.25) {
      const p = t / 0.25;
      return `linear-gradient(180deg, hsl(${220 + p * 30}, 50%, ${15 + p * 20}%), hsl(${200 + p * 40}, 60%, ${10 + p * 25}%))`;
    } else if (t < 0.5) {
      const p = (t - 0.25) / 0.25;
      return `linear-gradient(180deg, hsl(${250 - p * 100}, 70%, ${35 + p * 40}%), hsl(${240 - p * 80}, 80%, ${35 + p * 45}%))`;
    } else if (t < 0.75) {
      const p = (t - 0.5) / 0.25;
      return `linear-gradient(180deg, hsl(${150 + p * 100}, 70%, ${75 - p * 25}%), hsl(${160 + p * 80}, 80%, ${80 - p * 30}%))`;
    } else {
      const p = (t - 0.75) / 0.25;
      return `linear-gradient(180deg, hsl(${250 - p * 30}, 60%, ${50 - p * 35}%), hsl(${240 - p * 40}, 70%, ${30 - p * 20}%))`;
    }
  };

  // Load dynamic mission
  const loadMission = useCallback(async () => {
    setLoading(true);
    setMission(null);
    setCurrentDecision(0);
    setSelectedChoice(null);
    setShowConsequence(false);
    setAwaitingConfirm(false);
    setDecisionMap(null);
    try {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const trialNum = decisionHistory.length + 1;
      const response = await db.functions.invoke("generateDynamicMission", {
        character: characterData?.name || character,
        sessionId: uniqueId,
        missionCount: trialNum,
        completedThemes: missionTheme.completedThemes || [],
        theologianMode: theologianMode || false,
        locationName: missionTheme.location?.name || "Jerusalem",
        locationContext: missionTheme.location?.context || "",
        locationRegion: missionTheme.location?.region || "",
      });
      
      if (!response.data) {
        console.warn("Empty response from generateDynamicMission");
        setMission(FALLBACK_MISSIONS.david_bathsheba);
        setLoading(false);
        return;
      }
      
      const missionData = response.data;
      if (missionData.title && missionData.narrative) {
        setMission({
          title: missionData.title,
          location: missionData.location,
          scripture: missionData.scripture,
          narrative: missionData.narrative,
          decisions: missionData.decisions,
          missionType: missionData.missionType || "moral_choice",
          objective: missionData.objective,
          locations: missionData.locations,
          challenge: missionData.challenge,
          timeLimit: missionData.timeLimit,
          hints: missionData.hints,
          correctAnswer: missionData.correctAnswer,
          reward_xp: missionData.reward_xp,
          scoreChanges: missionData.scoreChanges,
          successMessage: missionData.successMessage,
          failureMessage: missionData.failureMessage,
          completionMessage: missionData.completionMessage,
          correctIndex: missionData.correctIndex
        });
      } else {
        console.warn("Mission response missing required fields", { title: missionData.title, hasNarrative: !!missionData.narrative });
        setMission(FALLBACK_MISSIONS.david_bathsheba);
      }
    } catch (error) {
      console.error("Failed to load dynamic mission:", error);
      setMission(FALLBACK_MISSIONS.david_bathsheba);
    } finally {
      setLoading(false);
    }
  }, [missionTheme, character, characterData, theologianMode]);

  useEffect(() => {
    loadMission();
  }, []);

  // Shuffle decisions and track original indices
  useEffect(() => {
    if (mission && mission.missionType === "moral_choice" && !decisionMap && mission.decisions) {
      const indices = mission.decisions.map((_, i) => i);
      const shuffled = indices.sort(() => Math.random() - 0.5);
      setDecisionMap(shuffled);
    }
  }, [mission, decisionMap]);
  
  // For non-moral missions, ensure decisionMap is set to null
  useEffect(() => {
    if (mission && mission.missionType !== "moral_choice") {
      setDecisionMap(null);
    }
  }, [mission]);

  const handleChoose = (choiceIdx) => {
    playSound("decision");
    setSelectedChoice(choiceIdx);
    setAwaitingConfirm(true);
  };

  const handleConfirmChoice = () => {
    setAwaitingConfirm(false);
    setShowConsequence(true);
  };

  const handleReturnToWorld = () => {
    onReturn();
  };

  const handleContinue = () => {
    completeMission(decisionHistory);
  };

  const handleNextTrial = () => {
    const trialsAtThisLocation = decisionHistory.length + 1;
    if (trialsAtThisLocation >= 3) {
      const chosen = mission.decisions[decisionMap ? decisionMap[selectedChoice] : selectedChoice];
      const newHistory = [...decisionHistory, {
        decision: currentDecision,
        choice: selectedChoice,
        ...(chosen?.scoreChanges || {}),
        xp: chosen?.xp || 0,
      }];
      completeMission(newHistory);
    } else {
      const chosen = mission.decisions[decisionMap ? decisionMap[selectedChoice] : selectedChoice];
      const newHistory = [...decisionHistory, {
        decision: currentDecision,
        choice: selectedChoice,
        ...(chosen?.scoreChanges || {}),
        xp: chosen?.xp || 0,
      }];
      setDecisionHistory(newHistory);
      setMission(null);
      setCurrentDecision(0);
      setSelectedChoice(null);
      setShowConsequence(false);
      setAwaitingConfirm(false);
      setDecisionMap(null);
      loadMission();
    }
  };

  const handleCombatEnd = (victory) => {
    if (victory) {
      playSound("levelUp");
      const combatBonus = 30;
      setDecisionHistory([...decisionHistory, {
        decision: -1,
        choice: -1,
        xp: combatBonus,
        faith_score: 10,
        wisdom_score: 10,
        obedience_score: 10,
        integrity_score: 10,
      }]);
    }
    clearCombat();
    setShowConsequence(false);
  };

  const completeMission = (historyToUse) => {
    const totalScoreChanges = historyToUse.reduce((acc, hist) => {
      const { decision, choice, xp, ...changes } = hist;
      Object.entries(changes).forEach(([key, val]) => {
        acc[key] = (acc[key] || 0) + val;
      });
      acc.xp = (acc.xp || 0) + xp;
      return acc;
    }, {});

    const finalLevel = Math.floor((progress.xp + totalScoreChanges.xp) / 100) + 1;
    
    if (finalLevel > progress.level) {
      playSound("levelUp");
    }

    onMissionComplete({
      level: finalLevel,
      xp: progress.xp + totalScoreChanges.xp,
      faith_score: (progress.faith_score || 0) + (totalScoreChanges.faith_score || 0),
      wisdom_score: (progress.wisdom_score || 0) + (totalScoreChanges.wisdom_score || 0),
      obedience_score: (progress.obedience_score || 0) + (totalScoreChanges.obedience_score || 0),
      integrity_score: (progress.integrity_score || 0) + (totalScoreChanges.integrity_score || 0),
      total_score: progress.total_score + (totalScoreChanges.xp || 0),
      missionTitle: mission?.title,
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black flex items-center justify-center"
      >
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </motion.div>
    );
  }

  if (!mission) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black flex items-center justify-center"
      >
        <div className="text-white text-center">
          <p className="mb-4">Failed to load mission</p>
          <button
            onClick={onReturn}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            Return to World
          </button>
        </div>
      </motion.div>
    );
  }

  const choice = selectedChoice !== null && decisionMap ? mission.decisions[decisionMap[selectedChoice]] : null;

  const characterEmojis = {
    david: "👑",
    moses: "🔱",
    joseph: "✝️",
    daniel: "🙏",
    paul: "📖",
    esther: "👸",
    peter: "🧑‍🦳",
  };

  const characterEmoji = characterEmojis[character] || "✨";
  const showStars = true;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 overflow-y-auto py-8 px-4"
      style={{ background: getSkyGradient() }}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{ opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Mist Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
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

      {/* Combat Modal */}
      <AnimatePresence>
        {activeCombat && (
          <CombatEncounter
            character={characterData}
            progress={progress}
            enemyType={activeCombat.enemyType}
            onCombatEnd={handleCombatEnd}
            playerEmail={userEmail}
          />
        )}
      </AnimatePresence>

      {/* Mouse-tracking orb */}
      <motion.div
        className="fixed w-8 h-8 bg-white rounded-full shadow-2xl shadow-white/50 pointer-events-none z-50"
        style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%`, transform: "translate(-50%, -50%)" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-white blur-xl"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Header */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onReturn}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to World
        </button>
      </div>

      <div className="max-w-4xl mx-auto pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-9xl drop-shadow-2xl"
            >
              {characterEmoji}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 text-center md:text-left flex flex-col justify-center"
          >
            <p className="text-white/60 text-sm mb-2">{mission?.location} • {mission?.scripture}</p>
            <h1 className="font-display text-5xl font-bold text-white mb-4">{mission?.title}</h1>
            <p className="text-white/70 text-sm">Your choices shape your path...</p>
          </motion.div>
        </div>

        {mission?.missionType === "moral_choice" && (
          <motion.div
            key={currentDecision}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-600/80 border border-slate-500/30 rounded-xl p-8 mb-8"
          >
            {mission?.narrative ? (
              <p className="text-white text-lg leading-relaxed font-body whitespace-pre-line">
                {mission.narrative}
              </p>
            ) : (
              <p className="text-white/50 text-sm">Loading narrative...</p>
            )}
          </motion.div>
        )}

        {mission?.missionType === "fetch_quest" && (
          <MissionTypeFetchQuest mission={mission} onMissionComplete={onMissionComplete} />
        )}

        {mission?.missionType === "timed_challenge" && (
          <MissionTypeTimedChallenge mission={mission} onMissionComplete={onMissionComplete} />
        )}

        {mission?.missionType === "moral_choice" && !showConsequence && decisionMap && (
          <div className="space-y-4 mb-8">
            <p className="text-white/60 text-sm font-semibold">WHAT DO YOU DO?</p>
            {decisionMap.map((originalIdx, displayIdx) => {
              const dec = mission.decisions[originalIdx];
              return (
                <motion.button
                  key={displayIdx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + displayIdx * 0.1 }}
                  onClick={() => handleChoose(displayIdx)}
                  disabled={selectedChoice !== null && selectedChoice !== displayIdx}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedChoice === displayIdx
                      ? "border-white bg-white/10"
                      : "border-white/20 hover:border-white/40 hover:bg-white/5"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      selectedChoice === displayIdx ? "border-white bg-white/20" : "border-white/40"
                    }`}>
                      {selectedChoice === displayIdx && <Zap className="w-4 h-4 text-white" />}
                    </div>
                    <p className="text-white font-body">{dec.text}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {awaitingConfirm && selectedChoice !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 pointer-events-auto"
              onClick={() => {
                setAwaitingConfirm(false);
                setSelectedChoice(null);
              }}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 max-w-md text-center"
              >
                <p className="text-white/80 text-sm mb-6">
                  Are you sure about this choice? It will shape your path.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setAwaitingConfirm(false);
                      setSelectedChoice(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border border-white/30 hover:border-white/60 text-white/70 hover:text-white transition-colors"
                  >
                    Change Mind
                  </button>
                  <button
                    onClick={handleConfirmChoice}
                    className="flex-1 px-4 py-3 rounded-lg bg-accent hover:bg-accent/90 text-primary font-bold transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {mission?.missionType === "moral_choice" && (
          <AnimatePresence>
            {showConsequence && choice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-8 mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${
                    choice.moralAlignment === "righteous" ? "bg-green-500" :
                    choice.moralAlignment === "neutral" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`} />
                  <p className="text-white/80 text-sm font-semibold">
                    {choice.moralAlignment.toUpperCase()} CHOICE • +{choice.xp} XP
                  </p>
                </div>

                <p className="text-white text-lg mb-4 font-body">
                  {choice.consequence}
                </p>

                <blockquote className="border-l-2 border-white/30 pl-4 italic text-white/70 mb-6 font-body text-sm">
                  {choice.scripture}
                </blockquote>

                <div className="flex gap-3">
                  <button
                    onClick={handleContinue}
                    className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-display font-bold hover:bg-white/90 transition-colors"
                  >
                    {(decisionHistory.length + 1) >= 3 ? "Return to World" : "Complete Mission"}
                  </button>
                  {(decisionHistory.length + 1) < 3 && (
                    <button
                      onClick={handleNextTrial}
                      className="flex-1 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-display font-bold transition-colors"
                    >
                      Next Trial
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}