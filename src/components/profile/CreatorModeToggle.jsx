import React from "react";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";

export default function CreatorModeToggle({ isCreator, onChange }) {
  return (
    <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <div>
            <p className="font-body font-semibold text-foreground">Creator Mode</p>
            <p className="font-body text-xs text-muted-foreground">
              Get a special badge & profile layout
            </p>
          </div>
        </div>
        <Switch checked={isCreator} onCheckedChange={onChange} />
      </div>
    </div>
  );
}