import React from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function CompletedBiblePlans({ planIds = [] }) {
  if (planIds.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-accent" />
        <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Completed Bible Plans
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {planIds.map((id) => (
          <div
            key={id}
            className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-200/30"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="font-body text-xs font-medium text-green-700">
              Plan #{id.slice(0, 5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}