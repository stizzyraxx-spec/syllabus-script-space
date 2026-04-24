import React from "react";
import { Shield, Trophy, Award, Zap } from "lucide-react";

export default function ReputationBadge({ isModerator = false, trustScore = 0 }) {
  const getBadge = () => {
    if (isModerator) {
      return {
        icon: Shield,
        label: "Community Moderator",
        color: "text-blue-600",
        bg: "bg-blue-500/10",
      };
    }

    if (trustScore >= 100) {
      return {
        icon: Trophy,
        label: "Trusted Community Member",
        color: "text-gold",
        bg: "bg-amber-500/10",
      };
    }

    if (trustScore >= 50) {
      return {
        icon: Award,
        label: "Active Contributor",
        color: "text-green-600",
        bg: "bg-green-500/10",
      };
    }

    if (trustScore > 0) {
      return {
        icon: Zap,
        label: "Community Builder",
        color: "text-accent",
        bg: "bg-accent/10",
      };
    }

    return null;
  };

  const badge = getBadge();
  if (!badge) return null;

  const { icon: Icon, label, color, bg } = badge;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`font-body text-xs font-semibold ${color}`}>{label}</span>
    </div>
  );
}