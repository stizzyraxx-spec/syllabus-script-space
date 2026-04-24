import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { RefreshCw, Loader2, ExternalLink, BookOpen, MessageSquare, Heart } from "lucide-react";
import ShareButton from "@/components/shared/ShareButton";
import { motion, AnimatePresence } from "framer-motion";

export default function CurrentEvents() {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const now = new Date();
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Christian Biblical analyst. Today is ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

Go to CNN.com RIGHT NOW and retrieve 4 real, currently published news stories from CNN's homepage or CNN's top sections (cnn.com/us, cnn.com/world, cnn.com/politics). Only use stories that are actually live on CNN.com today.

STRICT RULES:
- Every story MUST be sourced exclusively from CNN.com. Do not use any other outlet.
- Use the exact CNN headline as published on their site.
- Include the exact CNN article URL (e.g. https://www.cnn.com/2026/04/05/...).
- Include the exact publish date from the CNN article (e.g. "April 5, 2026").
- Do NOT fabricate, estimate, or invent any detail. If you cannot confirm it from CNN, do not include it.
- Focus on: crime, political corruption, wars, injustice, moral/cultural issues, persecution.

For each story return:
- headline: The exact CNN headline
- source_url: The full CNN article URL
- published_date: The exact publish date as shown on CNN (e.g. "April 5, 2026")
- summary: 2-3 sentences using only facts stated in the CNN article — include who, what, where, when
- verse: Full text of a relevant Bible verse
- verse_reference: The book, chapter and verse (e.g. Jeremiah 22:3)
- biblical_perspective: 2-3 sentences connecting this CNN story to Scripture's teaching on justice, sin, or God's sovereignty`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                source_url: { type: "string" },
                published_date: { type: "string" },
                summary: { type: "string" },
                verse: { type: "string" },
                verse_reference: { type: "string" },
                biblical_perspective: { type: "string" },
              },
            },
          },
        },
      },
    });
    setEvents(result.events);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
        {/* Left: Events */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Current Events
              </h2>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Real-world news examined through Biblical principles
              </p>
            </div>
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="inline-flex items-center gap-2 font-body text-xs border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="font-body text-muted-foreground text-sm">
                  Gathering today's world events and Biblical connections...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="events"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {events?.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="group p-6 rounded-xl border border-border hover:border-accent/30 transition-all duration-300 bg-card"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ExternalLink className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-bold mb-1 text-foreground group-hover:text-accent transition-colors">
                          {event.headline}
                        </h3>
                        <div className="flex items-center gap-3 mb-3">
                          {event.published_date && (
                            <span className="font-body text-xs text-muted-foreground">{event.published_date}</span>
                          )}
                          {event.source_url && (
                            <a
                              href={event.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-body text-xs text-accent hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> CNN
                            </a>
                          )}
                        </div>
                        <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">
                          {event.summary}
                        </p>
                        <blockquote className="border-l-2 border-accent/40 pl-4 mb-3">
                          <p className="font-display text-sm italic text-foreground/80 leading-relaxed">
                            "{event.verse}"
                          </p>
                          <cite className="font-body text-accent text-xs font-semibold mt-1 block">
                            — {event.verse_reference}
                          </cite>
                        </blockquote>
                        <p className="font-body text-muted-foreground text-sm leading-relaxed">
                          {event.biblical_perspective}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <ShareButton
                            title={event.headline}
                            text={`${event.headline} — ${event.verse_reference} | The Condition of Man`}
                            url={window.location.origin}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Moral Foundations */}
        <div className="lg:col-span-1">
          <MoralFoundations />
        </div>
      </div>

      {/* CTA strip after articles */}
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
          <div
            key={i}
            className="p-5 rounded-xl border border-border bg-card"
          >
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