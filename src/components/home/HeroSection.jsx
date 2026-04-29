import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Shield, ArrowRight } from "lucide-react";
import { db } from "@/api/supabaseClient";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    db.auth.isAuthenticated().then(setIsAuthed);
  }, []);

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Cross/plus pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-accent" />
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-body text-accent text-sm font-semibold tracking-[0.2em] uppercase">
              The Condition of Man
            </span>
            <BookOpen className="w-5 h-5 text-accent" />
            <div className="h-px w-12 bg-accent" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            The World Through the
            <span className="block text-accent italic mt-1">
              Lens of Scripture
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Join faith-driven discussions in our forums, explore Bible study tools, test your knowledge with trivia, and connect with a community rooted in Scripture.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {isAuthed ? (
              <Link
                to="/forums"
                className="inline-flex items-center gap-2 font-body font-semibold text-base px-8 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg"
              >
                Explore Forums
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <a
                  href="/login?mode=signup"
                  className="inline-flex items-center font-body font-semibold text-base px-8 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg"
                >
                  Join Free — Get Started
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center font-body text-sm text-primary-foreground/60 hover:text-primary-foreground/90 transition-colors px-4 py-3"
                >
                  Already have an account? Sign in
                </a>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Wave transition to white */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 60V20C240 0 480 40 720 30C960 20 1200 0 1440 20V60H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
