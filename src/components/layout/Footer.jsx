import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="font-display font-bold text-lg">The Condition of Man</p>
          <p className="font-body text-xs text-primary-foreground/60 mt-1">
            &copy; {year} All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to="/legal?tab=terms" className="font-body text-xs text-primary-foreground/70 hover:text-accent transition-colors">
            Terms of Service
          </Link>
          <Link to="/legal?tab=privacy" className="font-body text-xs text-primary-foreground/70 hover:text-accent transition-colors">
            Privacy Policy
          </Link>
          <Link to="/legal?tab=compliance" className="font-body text-xs text-primary-foreground/70 hover:text-accent transition-colors">
            Legal & Compliance
          </Link>
        </nav>

        <Link
          to="/donate"
          className="inline-flex items-center gap-2 border border-accent text-accent font-body font-semibold px-5 py-2 rounded-lg hover:bg-accent/10 transition-colors text-sm"
        >
          <Heart className="w-4 h-4" />
          Support This Ministry
        </Link>
      </div>
    </footer>
  );
}