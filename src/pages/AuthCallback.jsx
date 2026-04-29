import { useEffect } from "react";
import { supabase } from "@/api/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const redirect = params.get("redirect") || "/";

      // Supabase may return OAuth errors directly in the query string
      const oauthError = params.get("error") || hashParams.get("error");
      const oauthErrorDesc = params.get("error_description") || hashParams.get("error_description") || "";

      if (oauthError) {
        const msg = oauthErrorDesc
          ? encodeURIComponent(oauthErrorDesc.replace(/\+/g, " "))
          : "oauth_failed";
        window.location.href = `/login?error=${msg}`;
        return;
      }

      // For PKCE flow: exchange the code for a session
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
          return;
        }
      }

      // Check session (covers implicit flow too)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        window.location.href = `/login?error=oauth_failed`;
        return;
      }

      // Password recovery — send to reset page so user can set new password
      const type = params.get("type") || hashParams.get("type");
      if (type === "recovery") {
        window.location.href = "/reset-password";
        return;
      }

      window.location.href = redirect;
    };

    handleCallback();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
