import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Menu, X, Sun, Moon, Settings, Shield, HelpCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { GuidanceContext } from "@/lib/GuidanceContext";
import NotificationsBell from "@/components/shared/NotificationsBell";
import ProfileModal from "@/components/shared/ProfileModal";
import SupportModal from "@/components/shared/SupportModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const location = useLocation();
  const { isDark, toggle } = useTheme();
  const { guidanceEnabled, setGuidanceEnabled } = useContext(GuidanceContext);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        // Fetch user's profile to get avatar
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      }
    });
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Bible", path: "/bible" },
    { label: "Explore", path: "/forums" },
    { label: "Community", path: "/community" },
    { label: "Games", path: "/games" },
    { label: "Inventory", path: "/inventory" },
    { label: "About", path: "/about" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="font-body font-semibold text-base whitespace-nowrap">
              The Condition <span className="text-accent">of Man</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 ml-16">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.path
                    ? "text-accent"
                    : "text-primary-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/donate"
              className="font-body text-sm font-semibold bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
            >
              Give
            </Link>

            {user ? (
               <div className="flex items-center gap-4">
                 {userProfile && userProfile.total_points > 0 && (
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/30">
                     <span className="font-body text-xs font-semibold text-accent">⭐ {userProfile.total_points}</span>
                   </div>
                 )}
                 <NotificationsBell currentUser={user} />
                {user.role === "admin" && (
                   <div className="flex items-center gap-2">
                     <Link
                       to="/admin"
                       className="font-body text-xs text-primary-foreground/50 hover:text-accent transition-colors flex items-center gap-1"
                       title="Admin Panel"
                     >
                       <Shield className="w-3.5 h-3.5" />
                       Manage
                     </Link>
                     <Link
                       to="/admin/content"
                       className="font-body text-xs text-primary-foreground/50 hover:text-accent transition-colors flex items-center gap-1"
                       title="Content Editor"
                     >
                       <Settings className="w-3.5 h-3.5" />
                       Edit
                     </Link>
                   </div>
                 )}
                <button
                  onClick={() => setShowProfile(true)}
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-accent font-display font-bold text-sm hover:opacity-80 transition-opacity flex-shrink-0 border border-accent/30"
                  style={{ backgroundColor: userProfile?.avatar_url ? "transparent" : "var(--accent)/30" }}
                  title="My Profile"
                >
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.full_name || user.email || "U")[0].toUpperCase()}</span>
                  )}
                </button>
                <button
                  onClick={() => base44.auth.logout()}
                  className="font-body text-xs text-primary-foreground/50 hover:text-accent transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="font-body text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Sign In
                </button>
                <a
                  href="/login?mode=signup"
                  className="font-body text-sm font-semibold bg-accent/20 border border-accent/30 text-accent px-3 py-1.5 rounded-lg hover:bg-accent/30 transition-colors"
                >
                  Join Free
                </a>
              </div>
            )}

            <button
              onClick={() => setShowGuidanceModal(true)}
              className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-accent transition-colors"
              title="Toggle guidance mode"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSupport(true)}
              className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-accent transition-colors"
              title="Get help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={toggle}
              className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-accent transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-1.5 text-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="font-body text-xs font-medium text-green-400">Live</span>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-1">
            {user && <NotificationsBell currentUser={user} />}
            <button
              onClick={toggle}
              className="p-2 text-primary-foreground/70 hover:text-accent transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="text-primary-foreground p-2 -mr-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showProfile && (
          <ProfileModal currentUser={user} onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSupport && (
          <SupportModal currentUser={user} onClose={() => setShowSupport(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGuidanceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGuidanceModal(false)}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-6 h-6 text-accent" />
                <h2 className="font-display text-2xl font-bold text-foreground">Guidance Mode</h2>
              </div>
              <p className="text-muted-foreground font-body text-sm mb-6">
                Enable guidance mode to see helpful descriptions when you hover over elements on the page. Perfect for understanding what each feature does.
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/50 mb-6">
                <span className="font-body font-semibold text-foreground">Guidance Enabled</span>
                <button
                  onClick={() => setGuidanceEnabled(!guidanceEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    guidanceEnabled ? 'bg-accent' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      guidanceEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={() => setShowGuidanceModal(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-40 bg-primary flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-display text-3xl text-primary-foreground hover:text-accent transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/donate"
              className="font-display text-3xl text-accent py-2"
            >
              Give
            </Link>
            {user ? (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => { setIsOpen(false); setShowProfile(true); }}
                  className="font-body text-xl text-accent py-2 px-4"
                >
                  My Profile
                </button>
                <button
                  onClick={() => { setIsOpen(false); setShowSupport(true); }}
                  className="font-body text-xl text-primary-foreground/70 hover:text-accent transition-colors py-2 px-4 flex items-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  Help
                </button>
                <button
                  onClick={() => base44.auth.logout()}
                  className="font-body text-xl text-primary-foreground/70 hover:text-accent transition-colors py-2 px-4"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => { setIsOpen(false); setShowSupport(true); }}
                  className="font-body text-xl text-primary-foreground/70 hover:text-accent transition-colors py-2 px-4 flex items-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  Help
                </button>
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="font-body text-xl text-primary-foreground/70 hover:text-accent transition-colors py-2 px-4"
                >
                  Sign In
                </button>
                <a
                  href="/login?mode=signup"
                  className="font-body text-lg font-semibold bg-accent text-accent-foreground px-8 py-3 rounded-xl hover:bg-accent/90 transition-colors"
                >
                  Join Free
                </a>
              </div>
            )}
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}