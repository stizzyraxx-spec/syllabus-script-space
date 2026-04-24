import React from "react";
import { Shield, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ModerationNav({ isModerator = false }) {
  if (!isModerator) return null;

  return (
    <Link
      to="/moderation"
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-accent hover:border-accent/30 transition-colors font-body text-sm font-medium"
      title="Moderation Dashboard"
    >
      <Shield className="w-4 h-4" />
      <span className="hidden sm:inline">Moderation</span>
    </Link>
  );
}