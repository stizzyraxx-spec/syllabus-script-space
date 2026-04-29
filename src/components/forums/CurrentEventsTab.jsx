import React from "react";
import { BookOpen } from "lucide-react";

const foundations = [
  {
    title: "Consequence of Sin",
    verse: "For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.",
    ref: "Romans 6:23",
  },
  {
    title: "Divine Justice",
    verse: "Do not be deceived: God cannot be mocked. A man reaps what he sows.",
    ref: "Galatians 6:7",
  },
  {
    title: "Moral Authority",
    verse: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.",
    ref: "2 Timothy 3:16",
  },
];

export default function CurrentEventsTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Current Events</h2>
        <p className="font-body text-xs text-muted-foreground mb-6">
          Real-world news examined through Biblical principles
        </p>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-10 h-10 text-accent/40 mb-4" />
          <p className="font-body text-muted-foreground text-sm">
            Live news analysis is coming soon.
          </p>
          <p className="font-body text-muted-foreground text-xs mt-1">
            Check back to see today's world events examined through Scripture.
          </p>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-accent" />
            <h3 className="font-display text-lg font-bold text-foreground">Moral Foundations</h3>
          </div>
          <p className="font-body text-muted-foreground text-sm leading-relaxed mb-5">
            The Bible provides the most comprehensive moral system known to mankind —
            one rooted in absolute truth, justice, and love for neighbor.
          </p>
          <div className="space-y-4">
            {foundations.map((f, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                  <span className="font-body text-xs font-semibold tracking-wider uppercase text-accent">
                    {f.title}
                  </span>
                </div>
                <p className="font-display text-sm italic text-foreground/80 leading-relaxed">
                  '{f.verse}'
                </p>
                <cite className="font-body text-accent text-xs font-semibold mt-2 block">— {f.ref}</cite>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}