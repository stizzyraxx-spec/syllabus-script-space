import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function CommunityPreview() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  useEffect(() => {
    db.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await db.auth.me();
        setUser(me);
      }
    });
  }, []);

  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ["community-posts"],
    queryFn: () => db.entities.ForumPost.list("-created_date", 5),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.ForumPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setNewPost({ title: "", content: "" });
      setShowForm(false);
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const likedBy = post.liked_by || [];
      const alreadyLiked = likedBy.includes(user?.email);
      return db.entities.ForumPost.update(post.id, {
        likes: alreadyLiked ? (post.likes || 1) - 1 : (post.likes || 0) + 1,
        liked_by: alreadyLiked
          ? likedBy.filter((e) => e !== user?.email)
          : [...likedBy, user?.email],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
  });

  const handleSubmit = () => {
    if (!newPost.content.trim()) return;
    createMutation.mutate({
      ...newPost,
      title: newPost.title || "Untitled",
      category: "general",
      author_name: user?.full_name || "Anonymous",
      likes: 0,
      liked_by: [],
      reply_count: 0,
    });
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
          Community Posts
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-10">
          Share your thoughts and reflections
        </p>

        {/* Post composer or sign-in prompt */}
        {user ? (
          <div className="mb-10">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full p-4 rounded-xl border border-border text-left font-body text-muted-foreground text-sm hover:border-accent/30 transition-colors bg-card"
              >
                Share your thoughts...
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl border border-border bg-card space-y-4"
              >
                <Input
                  placeholder="Title (optional)"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="font-body text-sm"
                />
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="font-body text-sm min-h-[100px]"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                    className="font-body inline-flex items-center gap-2 bg-accent text-accent-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    Post
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="mb-10 p-6 rounded-xl border border-border bg-card text-center">
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              Join the Conversation
            </h3>
            <p className="font-body text-muted-foreground text-sm mb-4">
              Create a free account to share your reflections and engage with
              our community.
            </p>
            <button
              onClick={() => db.auth.redirectToLogin()}
              className="inline-flex items-center font-body px-5 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Sign In / Create Account
            </button>
          </div>
        )}

        {/* Posts list */}
        <div className="space-y-5">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl border border-border bg-card"
            >
              {post.title && post.title !== "Untitled" && (
                <h4 className="font-display font-bold text-base text-foreground mb-2">
                  {post.title}
                </h4>
              )}
              <p className="font-body text-sm text-foreground/80 leading-relaxed mb-4">
                {post.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {user && (
                    <button
                      onClick={() => likeMutation.mutate(post)}
                      className={`flex items-center gap-1.5 font-body text-xs transition-colors ${
                        post.liked_by?.includes(user?.email)
                          ? "text-accent"
                          : "text-muted-foreground hover:text-accent"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          post.liked_by?.includes(user?.email) ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  )}
                  <Link
                    to="/forums"
                    className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-accent transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {post.reply_count || 0}
                  </Link>
                </div>
                <span className="font-body text-xs text-muted-foreground">
                  {post.author_name || "Anonymous"} ·{" "}
                  {post.created_date
                    ? format(new Date(post.created_date), "M/d/yyyy")
                    : ""}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}