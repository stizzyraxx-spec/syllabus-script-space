import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Search, X, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import FriendProfileModal from "./FriendProfileModal";

export default function FriendsManager({ user, profile }) {
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ["friends", user?.email],
    queryFn: () =>
      user?.email
        ? db.entities.UserProfile.filter({ user_email: user.email }).then((d) => {
            const p = d[0];
            return p?.following || [];
          })
        : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["followers", user?.email],
    queryFn: () =>
      user?.email
        ? db.entities.UserProfile.filter({ user_email: user.email }).then((d) => {
            const p = d[0];
            return p?.followers || [];
          })
        : Promise.resolve([]),
    enabled: !!user?.email,
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendEmail) => {
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      const myProfile = profiles[0];

      if (!myProfile) {
        // Create profile if doesn't exist
        await db.entities.UserProfile.create({
          user_email: user.email,
          following: [friendEmail],
        });
      } else {
        const currentFollowing = myProfile.following || [];
        if (!currentFollowing.includes(friendEmail)) {
          await db.entities.UserProfile.update(myProfile.id, {
            following: [...currentFollowing, friendEmail],
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", user?.email] });
      toast.success("Friend added!");
      setSearchEmail("");
    },
    onError: () => toast.error("Failed to add friend"),
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendEmail) => {
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      const myProfile = profiles[0];

      if (myProfile) {
        const updated = (myProfile.following || []).filter((e) => e !== friendEmail);
        await db.entities.UserProfile.update(myProfile.id, { following: updated });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", user?.email] });
      toast.success("Friend removed");
    },
    onError: () => toast.error("Failed to remove friend"),
  });

  const handleAddFriend = () => {
    if (!searchEmail.trim()) {
      toast.error("Enter a valid email");
      return;
    }
    if (searchEmail === user.email) {
      toast.error("You can't add yourself");
      return;
    }
    addFriendMutation.mutate(searchEmail.trim());
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h3 className="font-display text-2xl font-bold text-foreground">Friends</h3>

      {/* Add Friend Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="font-body text-sm font-semibold text-foreground mb-4">Add a Friend</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter friend's email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddFriend}
            disabled={addFriendMutation.isPending}
            className="px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add
          </motion.button>
        </div>
      </div>

      {/* Friends List */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Friends ({friends.length})
        </h4>
        {friends.length === 0 ? (
          <p className="font-body text-muted-foreground text-sm text-center py-8">
            No friends yet. Add one to compare progress!
          </p>
        ) : (
          <div className="space-y-3">
            {friends.map((friendEmail) => (
              <motion.div
                key={friendEmail}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:border-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-foreground truncate">{friendEmail}</p>
                </div>
                <div className="flex gap-2 ml-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFriend(friendEmail)}
                    className="p-2 rounded-lg hover:bg-accent/20 transition-colors text-muted-foreground hover:text-accent"
                    title="View profile"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeFriendMutation.mutate(friendEmail)}
                    disabled={removeFriendMutation.isPending}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-muted-foreground hover:text-red-500"
                    title="Remove friend"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Followers */}
      {followers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h4 className="font-display text-lg font-bold text-foreground mb-4">Followers ({followers.length})</h4>
          <div className="space-y-3">
            {followers.map((followerEmail) => (
              <div key={followerEmail} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <p className="font-body text-sm text-foreground truncate">{followerEmail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend Profile Modal */}
      <AnimatePresence>
        {selectedFriend && <FriendProfileModal email={selectedFriend} onClose={() => setSelectedFriend(null)} currentUserEmail={user.email} />}
      </AnimatePresence>
    </motion.div>
  );
}