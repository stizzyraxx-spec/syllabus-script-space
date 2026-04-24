import React from "react";
import { MessageSquare, Pen, Radio } from "lucide-react";

export default function ContributionStats({ stats = { posts: 0, comments: 0, streams_hosted: 0 } }) {
  const items = [
    { icon: Pen, label: "Posts", value: stats.posts },
    { icon: MessageSquare, label: "Comments", value: stats.comments },
    { icon: Radio, label: "Streams", value: stats.streams_hosted },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="p-3 rounded-lg bg-secondary/30 border border-border text-center">
          <Icon className="w-4 h-4 text-accent mx-auto mb-1.5" />
          <p className="font-display font-bold text-foreground text-lg">{value}</p>
          <p className="font-body text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}