import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, MessageSquare, Heart } from "lucide-react";

export default function CurrentEvents() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Current Events
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Real-world news examined through Biblical principles
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-12 h-12 text-accent/40 mb-4" />
            <p className="font-body text-muted-foreground text-sm">
              Live news analysis is coming soon.
            </p>
            <p className="font-body text-muted-foreground text-xs mt-1">
              Check back to see today's world events examined through Scripture.
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <MoralFoundations />
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/forums"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm w-full sm:w-auto justify-center"
        >
          <MessageSquare className="w-4 h-4" />
          Discuss in Forums
        </Link>
        <Link
          to="/donate"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors text-sm w-full sm:w-auto justify-center"
        >
          <Heart className="w-4 h-4" />
          Support This Mission
        </Link>
      </div>
    </main>
  );
}

function MoralFoundations() {
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

  return (
    <div className="lg:sticky lg:top-8">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-accent" />
        <h3 className="font-display text-xl font-bold text-foreground">
          Moral Foundations
        </h3>
      </div>
      <p className="font-body text-muted-foreground text-sm leading-relaxed mb-6">
        The Bible provides the most comprehensive moral system known to mankind —
        one rooted in absolute truth, justice, and love for neighbor.
      </p>
      <div className="space-y-4">
        {foundations.map((f, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span className="font-body text-xs font-semibold tracking-wider uppercase text-accent">
                {f.title}
              </span>
            </div>
            <p className="font-display text-sm italic text-foreground/80 leading-relaxed">
              '{f.verse}'
            </p>
            <cite className="font-body text-accent text-xs font-semibold mt-2 block">
              — {f.ref}
            </cite>
          </div>
        ))}
      </div>
    </div>
  );
}
