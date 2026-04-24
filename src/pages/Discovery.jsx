import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Compass } from "lucide-react";

import TrendingSection from "@/components/discovery/TrendingSection";
import PersonalizedRecommendations from "@/components/discovery/PersonalizedRecommendations";
import AdvancedSearch from "@/components/discovery/AdvancedSearch";

export default function Discovery() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
      setLoading(false);
    });
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ["profile", user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.UserProfile.filter({ user_email: user.email }).then((data) => data[0])
        : Promise.resolve(null),
    enabled: !!user?.email,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="w-8 h-8 text-accent" />
            <h1 className="font-display text-4xl font-bold text-foreground">Discover Content</h1>
          </div>
          <p className="font-body text-muted-foreground">
            Find posts, forums, and people that match your interests
          </p>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Search & Trending */}
          <div className="lg:col-span-2 space-y-8">
            {/* Advanced Search */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Search</h2>
              <AdvancedSearch userProfile={userProfile} user={user} />
            </div>

            {/* Trending */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <TrendingSection />
            </div>
          </div>

          {/* Right: Personalized */}
          <div className="p-6 rounded-2xl border border-border bg-card h-fit sticky top-4">
            {user && userProfile ? (
              <PersonalizedRecommendations userProfile={userProfile} />
            ) : (
              <div className="text-center py-6">
                <p className="font-body text-sm text-muted-foreground mb-3">
                  Sign in to get personalized recommendations
                </p>
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}