import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { AlertCircle, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const REASON_LABELS = {
  spam: "Spam",
  harassment: "Harassment",
  hate_speech: "Hate Speech",
  misinformation: "Misinformation",
  inappropriate: "Inappropriate",
  other: "Other",
};

const ACTION_LABELS = {
  none: "No Action",
  warned: "User Warned",
  content_removed: "Content Removed",
  user_suspended: "User Suspended",
};

export default function ReportCard({ report, onUpdate }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState(report.moderator_action || "none");
  const [notes, setNotes] = useState(report.moderator_notes || "");
  const updateMutation = useMutation({
    mutationFn: async () => {
      const user = await db.auth.me();
      return db.entities.ReportedContent.update(report.id, {
        moderator_action: action,
        moderator_notes: notes,
        status: "resolved",
        moderator_email: user.email,
      });
    },
    onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["reported-content"] });
    onUpdate?.();
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async () => {
      const user = await db.auth.me();
      // Delete the actual content
      const entityName = report.content_type === "post" ? "CommunityPost" : "PostComment";
      const contentId = report.content_type === "post" ? report.post_id : report.comment_id;
      await db.entities[entityName].delete(contentId);
      
      // Update report
      return db.entities.ReportedContent.update(report.id, {
        moderator_action: "content_removed",
        status: "resolved",
        moderator_email: user.email,
        moderator_notes: notes || "Content removed by moderator",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reported-content"] });
      onUpdate?.();
    },
  });

  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-destructive/10">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs text-muted-foreground mb-1">
              Reported {format(new Date(report.created_date), "MMM d, yyyy")}
            </p>
            <h4 className="font-display font-bold text-foreground mb-1">
              {REASON_LABELS[report.reason]}
            </h4>
            <p className="font-body text-sm text-foreground line-clamp-2 mb-2">
              "{report.content_preview}"
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block px-2 py-1 rounded-full bg-secondary text-foreground font-body text-xs">
                {report.content_type === "post" ? "Post" : "Comment"}
              </span>
              <span className="inline-block px-2 py-1 rounded-full bg-secondary text-foreground font-body text-xs">
                {REASON_LABELS[report.reason]}
              </span>
              <span className={`inline-block px-2 py-1 rounded-full font-body text-xs ${
                report.status === "resolved" ? "bg-green-500/10 text-green-600" :
                report.status === "under_review" ? "bg-yellow-500/10 text-yellow-600" :
                "bg-gray-500/10 text-gray-600"
              }`}>
                {report.status.replace("_", " ").charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        {report.status !== "resolved" && (
          <button
            onClick={() => deleteContentMutation.mutate()}
            disabled={deleteContentMutation.isPending}
            className="ml-2 p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
            title="Delete content"
          >
            {deleteContentMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Details */}
      {report.description && (
        <div className="mb-3 p-3 rounded-lg bg-secondary/30">
          <p className="font-body text-xs text-muted-foreground mb-1">Reporter Details:</p>
          <p className="font-body text-sm text-foreground">{report.description}</p>
        </div>
      )}

      {/* User Info */}
      <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-secondary/30 text-sm">
        <div>
          <p className="font-body text-xs text-muted-foreground mb-1">Reported User</p>
          <p className="font-body font-semibold text-foreground">{report.reported_user_email}</p>
        </div>
        {report.report_count > 1 && (
          <div className="text-right">
            <p className="font-body text-xs text-muted-foreground">Reported</p>
            <p className="font-display font-bold text-destructive">{report.report_count}x</p>
          </div>
        )}
      </div>

      {/* Action Section */}
      {report.status !== "resolved" ? (
        <div className="space-y-3 p-3 rounded-lg bg-secondary/30 border border-border">
          <div>
            <label className="font-body text-xs font-semibold text-muted-foreground block mb-2">
              Moderator Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="none">No Action</option>
              <option value="warned">Warn User</option>
              <option value="content_removed">Remove Content</option>
              <option value="user_suspended">Suspend User</option>
            </select>
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-muted-foreground block mb-2">
              Moderator Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain your decision..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent resize-none min-h-[60px]"
            />
          </div>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground font-body text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Save Decision
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="font-body text-xs font-semibold text-green-600">
              {ACTION_LABELS[report.moderator_action]}
            </span>
          </div>
          {report.moderator_notes && (
            <p className="font-body text-xs text-foreground">{report.moderator_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}