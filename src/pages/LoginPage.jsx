import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, User, Shield, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const urlMode = new URLSearchParams(window.location.search).get("mode");
  const [mode, setMode] = useState(urlMode === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const fromUrl = new URLSearchParams(window.location.search).get("from_url") || "/";
  const initialError = new URLSearchParams(window.location.search).get("error");
  const [error, setError] = useState(
    initialError ? decodeURIComponent(initialError).replace(/\+/g, " ") : ""
  );

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm your address.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = fromUrl;
      }
    } catch (err) {
      setError(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err?.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #040d1a 0%, #071435 40%, #0a1e50 100%)" }}>

      {/* Cross pattern background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* Radial glow center */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,175,55,0.07) 0%, transparent 70%)"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-[60px]" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.6))" }} />
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)" }}>
              <Shield className="w-7 h-7" style={{ color: "#d4af37" }} />
            </div>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: "linear-gradient(to left, transparent, rgba(212,175,55,0.6))" }} />
          </div>
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: "#d4af37" }}>
            The Condition of Man
          </p>
          <h1 className="text-3xl font-bold text-white leading-tight">
            {mode === "signin" ? "Welcome Back" : mode === "forgot" ? "Reset Password" : "Join Free"}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {mode === "signin"
              ? "Sign in to continue your Biblical journey"
              : mode === "forgot"
              ? "We'll send a reset link to your inbox"
              : "Free forever — no credit card required"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "rgba(10,20,50,0.85)", border: "1px solid rgba(212,175,55,0.2)", backdropFilter: "blur(20px)" }}>

          {/* Mode toggle */}
          {mode !== "forgot" && (
            <div className="flex" style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
              {["signin", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                  className="flex-1 py-4 text-sm font-semibold transition-all relative"
                  style={{ color: mode === m ? "#d4af37" : "rgba(255,255,255,0.35)" }}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                  {mode === m && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: "#d4af37" }} />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="p-8">
            {mode === "forgot" ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(""); setSuccess(""); }}
                  className="flex items-center gap-1.5 text-xs mb-4 transition-colors hover:opacity-80"
                  style={{ color: "rgba(212,175,55,0.7)" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Enter your email and we'll send you a link to reset your password. Your account data will not be affected.
                </p>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/30"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,175,55,0.2)", color: "#fff" }}
                    onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.5)"}
                    onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.2)"}
                  />
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm text-center py-2 px-3 rounded-lg"
                      style={{ color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      {error}
                    </motion.p>
                  )}
                  {success && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm text-center py-2 px-3 rounded-lg"
                      style={{ color: "#86efac", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                      {success}
                    </motion.p>
                  )}
                </AnimatePresence>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #d4af37 0%, #f0c94d 50%, #d4af37 100%)", color: "#0a0f1a" }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Reset Email
                </button>
              </form>
            ) : (<>
            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    key="fullname"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/30"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(212,175,55,0.2)",
                          color: "#fff",
                        }}
                        onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.5)"}
                        onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.2)"}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/30"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    color: "#fff",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.2)"}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/30"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    color: "#fff",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.2)"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                  style={{ color: "rgba(212,175,55,0.5)" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(212,175,55,0.5)" }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/30"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(212,175,55,0.2)",
                          color: "#fff",
                        }}
                        onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.5)"}
                        onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.2)"}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-sm text-center py-2 px-3 rounded-lg"
                    style={{ color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-sm text-center py-2 px-3 rounded-lg"
                    style={{ color: "#86efac", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] mt-1"
                style={{ background: "linear-gradient(135deg, #d4af37 0%, #f0c94d 50%, #d4af37 100%)", color: "#0a0f1a" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>

              {mode === "signin" && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                    className="text-xs transition-colors hover:opacity-80"
                    style={{ color: "rgba(212,175,55,0.6)" }}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>
            </>)}

            <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
              By continuing, you agree to our{" "}
              <a href="/legal" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: "rgba(212,175,55,0.5)" }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/legal" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: "rgba(212,175,55,0.5)" }}>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="flex items-center justify-center gap-2 mt-6 opacity-30">
          <div className="h-px w-8" style={{ background: "rgba(212,175,55,0.5)" }} />
          <Shield className="w-3 h-3" style={{ color: "#d4af37" }} />
          <div className="h-px w-8" style={{ background: "rgba(212,175,55,0.5)" }} />
        </div>
      </motion.div>
    </div>
  );
}
