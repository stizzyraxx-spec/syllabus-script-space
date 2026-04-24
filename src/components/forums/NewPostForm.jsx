import React, { useState } from "react";
import { X, Send, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function NewPostForm({ onSubmit, onCancel, isPending, initialData, userProfile, user }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    category: initialData?.category || "general",
  });
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    onSubmit({ ...formData, isAnonymous });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 rounded-xl border border-border bg-card mb-8"
    >
      {initialData?.attachedEvent && (
        <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
          <p className="font-body text-xs font-semibold text-accent mb-0.5">Discussing current event:</p>
          <p className="font-body text-xs text-foreground/80 line-clamp-2">{initialData.attachedEvent}</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold text-foreground">
          New Discussion
        </h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <Select
          value={formData.category}
          onValueChange={(v) => setFormData({ ...formData, category: v })}
        >
          <SelectTrigger className="font-body text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Discussion</SelectItem>
            <SelectItem value="bible_study">Bible Study</SelectItem>
            <SelectItem value="justice_ethics">Justice & Ethics</SelectItem>
            <SelectItem value="testimonies">Personal Testimonies</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Discussion title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="font-body text-sm"
        />

        <Textarea
          placeholder="Share your thoughts..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="font-body text-sm min-h-[120px]"
        />

        {/* Anonymous toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            {isAnonymous ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-accent" />}
            <div>
              <p className="font-body text-xs font-semibold text-foreground">
                {isAnonymous ? "Posting anonymously" : `Posting as ${userProfile?.display_name || user?.full_name || "you"}`}
              </p>
              <p className="font-body text-[11px] text-muted-foreground">
                {isAnonymous ? "Your name and avatar will be hidden" : "Your profile name and avatar will be shown"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isAnonymous ? "bg-muted-foreground/40" : "bg-accent"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isAnonymous ? "" : "translate-x-5"}`} />
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !formData.title.trim() || !formData.content.trim()}
            className="font-body inline-flex items-center gap-2 bg-accent text-accent-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Post Discussion
          </button>
        </div>
      </div>
    </motion.div>
  );
}