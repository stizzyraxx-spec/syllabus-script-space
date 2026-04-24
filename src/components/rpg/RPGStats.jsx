import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Shield, BookOpen, Star, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

// --- Radar Chart ---
function RadarChart({ stats }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const labels = stats.map(s => s.label);
  const values = stats.map(s => Math.min(s.value, 200)); // cap for display
  const maxVal = 200;
  const n = stats.length;

  const angleStep = (2 * Math.PI) / n;
  const getPoint = (i, r) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPaths = gridLevels.map(level => {
    const pts = Array.from({ length: n }, (_, i) => getPoint(i, radius * level));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  });

  const dataPath = values.map((v, i) => {
    const r = (v / maxVal) * radius;
    const p = getPoint(i, r);
    return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
  }).join(" ") + " Z";

  const statColors = ["#60a5fa", "#c084fc", "#34d399", "#fbbf24"];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid lines */}
      {gridPaths.map((path, i) => (
        <path key={i} d={path} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      ))}
      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const end = getPoint(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
      })}
      {/* Data fill */}
      <path d={dataPath} fill="rgba(251,191,36,0.15)" stroke="#fbbf24" strokeWidth={2} />
      {/* Data points */}
      {values.map((v, i) => {
        const r = (v / maxVal) * radius;
        const p = getPoint(i, r);
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill={statColors[i]} />;
      })}
      {/* Labels */}
      {stats.map((stat, i) => {
        const p = getPoint(i, radius + 20);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fill={statColors[i]} fontSize={10} fontWeight="bold" fontFamily="sans-serif">
            {stat.label}
          </text>
        );
      })}
    </svg>
  );
}

// --- Alignment Badge ---
function AlignmentBadge({ alignment }) {
  const config = {
    righteous: { label: "Righteous", color: "text-green-400 bg-green-400/10 border-green-400/30" },
    neutral: { label: "Mixed", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
    fallen: { label: "Fallen", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  };
  const c = config[alignment] || config.neutral;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${c.color}`}>
      {c.label}
    </span>
  );
}

export default function RPGStats({ character, progress, onBack }) {
  const [decisions, setDecisions] = useState([]);
  const [loadingDecisions, setLoadingDecisions] = useState(true);

  const levelTitles = ["Seeker", "Disciple", "Servant", "Warrior", "Prophet"];
  const currentLevelTitle = levelTitles[Math.min(progress.level - 1, 4)];

  const stats = [
    { label: "Faith", value: progress.faith_score || 0, color: "from-blue-400 to-blue-600", icon: Star },
    { label: "Wisdom", value: progress.wisdom_score || 0, color: "from-purple-400 to-purple-600", icon: BookOpen },
    { label: "Obedience", value: progress.obedience_score || 0, color: "from-green-400 to-green-600", icon: Shield },
    { label: "Integrity", value: progress.integrity_score || 0, color: "from-yellow-400 to-yellow-600", icon: Flame },
  ];

  const totalStats = stats.reduce((sum, s) => sum + s.value, 0);
  const dominantStat = stats.reduce((a, b) => a.value > b.value ? a : b);

  // Compute overall moral alignment from decision history
  const righteousCount = decisions.filter(d => d.moral_alignment === "righteous").length;
  const fallenCount = decisions.filter(d => d.moral_alignment === "fallen").length;
  const totalDecisions = decisions.length;
  const overallAlignment = totalDecisions === 0 ? "neutral"
    : righteousCount / totalDecisions > 0.6 ? "righteous"
    : fallenCount / totalDecisions > 0.4 ? "fallen"
    : "neutral";

  useEffect(() => {
    if (!progress.player_email) { setLoadingDecisions(false); return; }
    base44.entities.RPGMissionDecision.filter({ player_email: progress.player_email })
      .then(res => { setDecisions(res || []); setLoadingDecisions(false); })
      .catch(() => setLoadingDecisions(false));
  }, [progress.player_email]);

  // Group decisions by mission for the path history
  const missionGroups = decisions.reduce((acc, d) => {
    if (!acc[d.mission_id]) acc[d.mission_id] = [];
    acc[d.mission_id].push(d);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-y-auto py-8 px-4"
    >
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="max-w-2xl mx-auto pt-16 pb-16 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-3">
            <p className="text-white/70 text-xs font-semibold tracking-widest uppercase">{currentLevelTitle} · Level {progress.level}</p>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">{character.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <AlignmentBadge alignment={overallAlignment} />
            <span className="text-white/40 text-xs">{totalDecisions} decisions made</span>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-4 text-center">Moral Character</p>
          <RadarChart stats={stats} />
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-xs mb-0.5">Dominant Trait</p>
              <p className="text-white font-bold text-sm">{dominantStat.label}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-xs mb-0.5">Total Spirit</p>
              <p className="text-white font-bold text-sm">{totalStats}</p>
            </div>
          </div>
        </motion.div>

        {/* Stat Bars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <p className="text-white/60 text-xs font-semibold tracking-widest uppercase">Attributes</p>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const pct = Math.min((stat.value / 200) * 100, 100);
            const tier = stat.value > 150 ? "Mastered" : stat.value > 100 ? "Strong" : stat.value > 50 ? "Developing" : "Emerging";
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + idx * 0.08 }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-white/60" />
                    <span className="text-white font-semibold text-sm">{stat.label}</span>
                    <span className="text-white/40 text-xs">{tier}</span>
                  </div>
                  <span className="text-white font-bold">{stat.value}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.3 + idx * 0.08 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* XP & Score */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Total XP</p>
            <p className="font-display text-3xl font-bold text-white">{(progress.xp || 0).toLocaleString()}</p>
            <p className="text-white/30 text-xs mt-1">{progress.xp % 100}/100 to next level</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Moral Score</p>
            <p className="font-display text-3xl font-bold text-accent">{(progress.total_score || 0).toLocaleString()}</p>
            <p className="text-white/30 text-xs mt-1">{progress.completed_missions?.length || 0} missions</p>
          </div>
        </motion.div>

        {/* Alignment Timeline */}
        {totalDecisions > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-4">Alignment Timeline</p>
            <div className="flex gap-1 mb-3">
              {decisions.map((d, i) => (
                <div
                  key={i}
                  title={d.choice_text}
                  className={`flex-1 h-3 rounded-sm ${
                    d.moral_alignment === "righteous" ? "bg-green-400" :
                    d.moral_alignment === "fallen" ? "bg-red-400" : "bg-yellow-400"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>← Start</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400 inline-block" /> Righteous ({righteousCount})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-400 inline-block" /> Mixed ({totalDecisions - righteousCount - fallenCount})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Fallen ({fallenCount})</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Path History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-4">Path History</p>
          {loadingDecisions ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : decisions.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">No decisions recorded yet. Complete missions to build your path.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {decisions.slice().reverse().map((d, i) => (
                <motion.div
                  key={d.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    d.moral_alignment === "righteous" ? "bg-green-400" :
                    d.moral_alignment === "fallen" ? "bg-red-400" : "bg-yellow-400"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white/80 text-sm leading-snug">{d.choice_text || "A choice was made"}</p>
                    {d.xp_earned > 0 && (
                      <p className="text-white/40 text-xs mt-0.5">+{d.xp_earned} XP</p>
                    )}
                  </div>
                  <AlignmentBadge alignment={d.moral_alignment} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}