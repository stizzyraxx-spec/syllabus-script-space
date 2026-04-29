import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { RefreshCw, Loader2, Sun, BookOpen, MessageSquare, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function DailyDevotional() {
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(false);

  const getTodayKey = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const FALLBACK_DEVOTIONALS = [
    { title: "Walk in the Light", verse: "Thy word is a lamp unto my feet, and a light unto my path.", verse_reference: "Psalm 119:105", reflection: "God's Word illuminates every step we take in this life. When uncertainty clouds our path, Scripture reminds us that we are never left in darkness. Open the Bible today and let its truth guide your decisions, relationships, and heart." },
    { title: "Strength in Stillness", verse: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.", verse_reference: "Psalm 46:10", reflection: "In a world of constant noise and motion, God invites us to pause and acknowledge His sovereignty. Stillness is not inactivity—it is trust. When we quiet our hearts, we create space to hear the voice that calms every storm." },
    { title: "Hope Does Not Disappoint", verse: "And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy Ghost which is given unto us.", verse_reference: "Romans 5:5", reflection: "Biblical hope is not wishful thinking—it is confident expectation grounded in God's character. His love has been poured into our hearts, guaranteeing that no trial we face is without purpose or end. Rest in His faithfulness today." },
    { title: "Cast Every Care", verse: "Casting all your care upon him; for he careth for you.", verse_reference: "1 Peter 5:7", reflection: "God does not simply observe our burdens from a distance—He actively invites us to transfer them to Him. Every anxiety, every worry, every sleepless thought is something He is equipped and willing to carry. You were not designed to bear it alone." },
    { title: "Renewed Every Morning", verse: "It is of the Lord's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.", verse_reference: "Lamentations 3:22-23", reflection: "No matter what yesterday held, today is a fresh expression of God's mercy. His faithfulness is not a fleeting feeling but an unchanging reality. Each morning is a gift—an invitation to begin again in His grace." },
    { title: "Seek and You Will Find", verse: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.", verse_reference: "Matthew 7:7", reflection: "God is not hidden from those who sincerely seek Him. Prayer is not a formality but a living conversation with the Creator who knows our needs before we voice them. Come boldly today, trusting that the Father hears every prayer." },
    { title: "More Than Conquerors", verse: "Nay, in all these things we are more than conquerors through him that loved us.", verse_reference: "Romans 8:37", reflection: "Victory in Christ is not the absence of struggle—it is triumph through it. Whatever opposition you face today, you face it with the power of the Risen Lord. You are not fighting for victory; you are fighting from it." },
  ];

  const fetchDevotional = async () => {
    const todayKey = getTodayKey();
    const cached = localStorage.getItem("daily_devotional");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayKey) {
          setDevotional(parsed.data);
          return;
        }
      } catch (_) {}
    }

    setLoading(true);
    try {
      const res = await db.functions.invoke("getDailyDevotional", {});
      const result = res.data;
      if (result && result.title) {
        localStorage.setItem("daily_devotional", JSON.stringify({ date: getTodayKey(), data: result }));
        setDevotional(result);
      } else {
        throw new Error("Invalid response");
      }
    } catch (_) {
      // Use a deterministic fallback based on day of year
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const fallback = FALLBACK_DEVOTIONALS[dayOfYear % FALLBACK_DEVOTIONALS.length];
      localStorage.setItem("daily_devotional", JSON.stringify({ date: getTodayKey(), data: fallback }));
      setDevotional(fallback);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevotional();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Sun className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="font-body text-xs font-semibold text-accent tracking-[0.15em] uppercase block">
                Daily Devotional
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                Today's Word
              </h2>
            </div>
          </div>
          <button
            onClick={fetchDevotional}
            disabled={loading}
            className="inline-flex items-center gap-2 font-body text-xs h-8 rounded-md px-3 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </motion.div>
          ) : devotional ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-5 gap-8"
            >
              {/* Verse card */}
              <div className="md:col-span-2 bg-accent/10 border border-accent/20 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="font-body text-xs font-semibold text-accent tracking-wide uppercase">
                      {devotional.title}
                    </span>
                  </div>
                  <blockquote className="font-display italic text-lg md:text-xl leading-relaxed text-primary-foreground mb-4">
                    "{devotional.verse}"
                  </blockquote>
                </div>
                <p className="font-body text-sm font-bold text-accent">
                  — {devotional.verse_reference}
                </p>
              </div>

              {/* Reflection */}
              <div className="md:col-span-3 flex flex-col justify-center">
                <div className="h-px w-12 bg-accent mb-6" />
                <p className="font-body text-primary-foreground/80 leading-relaxed text-base md:text-lg">
                  {devotional.reflection}
                </p>
                <p className="font-body text-xs text-primary-foreground/30 mt-6">
                  {today}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link
            to="/forums"
            className="inline-flex items-center justify-center gap-2 font-body font-semibold text-sm px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Join the Discussion
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center justify-center gap-2 font-body font-semibold text-sm px-6 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            <Heart className="w-4 h-4" />
            Support the Mission
          </Link>
        </motion.div>
      </div>
    </section>
  );
}