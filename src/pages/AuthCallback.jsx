import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/api/supabaseClient";

export default function AuthCallback() {
  const [state, setState] = useState({ phase: "loading", message: "", redirect: "/" });

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const redirect = params.get("redirect") || "/";
      const type = params.get("type") || hashParams.get("type");

      const oauthError = params.get("error") || hashParams.get("error");
      const oauthErrorDesc = params.get("error_description") || hashParams.get("error_description") || "";

      if (oauthError) {
        const friendly = oauthErrorDesc
          ? oauthErrorDesc.replace(/\+/g, " ")
          : "Sign-in failed.";
        setState({ phase: "error", message: friendly, redirect: "/login" });
        return;
      }

      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          setState({ phase: "error", message: error.message || "We couldn't verify that link.", redirect: "/login" });
          return;
        }
      }

      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        setState({
          phase: "error",
          message: "This link is invalid or has expired. Please request a new one.",
          redirect: "/login",
        });
        return;
      }

      if (type === "recovery") {
        window.location.href = "/reset-password";
        return;
      }

      const isEmailConfirmation = type === "signup" || type === "email" || type === "email_change" || type === "invite";

      if (isEmailConfirmation) {
        setState({
          phase: "success",
          message: "Email confirmed! You're signed in and ready to go.",
          redirect,
        });
        // Auto-continue after 3s
        setTimeout(() => { window.location.href = redirect; }, 3000);
        return;
      }

      // OAuth or standard sign-in — go straight through
      window.location.href = redirect;
    };

    handleCallback();
  }, []);

  if (state.phase === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (state.phase === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Email Confirmed</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">{state.message}</p>
          <Link
            to={state.redirect}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Continue
          </Link>
          <p className="font-body text-xs text-muted-foreground/70 mt-4">Redirecting automatically in a few seconds…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">{state.message}</p>
        <Link
          to={state.redirect}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
