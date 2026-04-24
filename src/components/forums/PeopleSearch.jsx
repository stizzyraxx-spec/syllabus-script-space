import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function PeopleSearch({ currentUser, onViewProfile }) {
  const [query, setQuery] = useState("");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["user-profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 100),
  });

  const filtered = query.trim()
    ? profiles.filter(
        (p) =>
          p.display_name?.toLowerCase().includes(query.toLowerCase()) ||
          p.username?.toLowerCase().includes(query.toLowerCase()) ||
          p.user_email?.toLowerCase().includes(query.toLowerCase()) ||
          p.bio?.toLowerCase().includes(query.toLowerCase())
      )
    : profiles;

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, @username, or bio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 font-body text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-muted-foreground text-sm">
            {query ? "No users match your search." : "No users found yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onViewProfile && onViewProfile(profile.user_email)}
              className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors ${onViewProfile ? "cursor-pointer" : ""}`}
            >
              <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-bold text-accent text-base">
                    {(profile.display_name || profile.user_email || "?")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm text-foreground truncate">
                  {profile.display_name || profile.user_email}
                </p>
                {profile.username && (
                  <p className="font-body text-xs text-accent truncate">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-1">{profile.bio}</p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-body text-xs text-muted-foreground">
                  {profile.followers?.length || 0} followers
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {profile.post_count || 0} posts
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}