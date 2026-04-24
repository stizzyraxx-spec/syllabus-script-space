import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Loader2, Search, Check, X } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.role !== "admin") {
          window.location.href = "/";
        }
      } else {
        window.location.href = "/";
      }
      setLoading(false);
    });
  }, []);

  const { data: userProfiles = [], isLoading } = useQuery({
    queryKey: ["all-user-profiles"],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: !!user,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, isModerator, role }) => {
      const updates = {};
      if (isModerator !== undefined) {
        // Update UserProfile is_moderator
        const profile = userProfiles.find((p) => p.user_email === userId);
        if (profile) {
          await base44.entities.UserProfile.update(profile.id, {
            is_moderator: isModerator,
          });
        }
      }
      if (role !== undefined) {
        // Update User role
        await base44.entities.User.update(userId, { role });
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    },
  });

  const filteredUsers = allUsers.filter((u) =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-body text-muted-foreground">Access denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-accent" />
            <h1 className="font-display text-4xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="font-body text-muted-foreground">Manage moderators and admin roles</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="font-body text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Moderator
                    </th>
                    <th className="px-6 py-3 text-right font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const profile = userProfiles.find((p) => p.user_email === u.email);
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-body font-medium text-foreground">{u.full_name}</p>
                            <p className="font-body text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role || "user"}
                            onChange={(e) =>
                              updateUserMutation.mutate({
                                userId: u.id,
                                role: e.target.value,
                              })
                            }
                            disabled={updateUserMutation.isPending}
                            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-body text-xs outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              updateUserMutation.mutate({
                                userId: u.email,
                                isModerator: !profile?.is_moderator,
                              })
                            }
                            disabled={updateUserMutation.isPending}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all disabled:opacity-50 ${
                              profile?.is_moderator
                                ? "bg-green-500/20 text-green-600 border border-green-500/30 hover:bg-green-500/30"
                                : "bg-secondary border border-border text-muted-foreground hover:border-accent/30 hover:bg-secondary/80"
                            }`}
                          >
                            {profile?.is_moderator ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Moderator
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" />
                                Not Moderator
                              </>
                            )}
                          </motion.button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {updateUserMutation.isPending && (
                            <Loader2 className="w-4 h-4 text-accent animate-spin inline" />
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="font-body text-xs text-muted-foreground mb-1">Total Users</p>
            <p className="font-display text-2xl font-bold text-foreground">{allUsers.length}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="font-body text-xs text-muted-foreground mb-1">Moderators</p>
            <p className="font-display text-2xl font-bold text-accent">
              {userProfiles.filter((p) => p.is_moderator).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}