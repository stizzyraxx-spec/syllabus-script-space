import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "misinformation", label: "Misinformation or false claims" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

export default function ReportModal({ contentType, contentId, reportedUserEmail, contentPreview, onClose }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reportMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.ReportedContent.create({
        content_type: contentType,
        [contentType === "post" ? "post_id" : "comment_id"]: contentId,
        reported_user_email: reportedUserEmail,
        reporter_email: user?.email || "anonymous",
        reason,
        description,
        content_preview: contentPreview || "Content preview unavailable",
        status: "pending",
        report_count: 1,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl border border-border w-full max-w-md p-6"
      >
        {!submitted ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">Report Content</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Additional Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please explain why you're reporting this content (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent resize-none min-h-[80px]"
                />
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <p className="font-body text-xs text-muted-foreground mb-1">Preview:</p>
                <p className="font-body text-xs text-foreground line-clamp-2">{contentPreview}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-border font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => reportMutation.mutate()}
                  disabled={!reason || reportMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {reportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit Report
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-display text-lg font-bold text-foreground mb-1">Report Submitted</h4>
            <p className="font-body text-sm text-muted-foreground">
              Thank you for helping keep our community safe. Our moderators will review this report shortly.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}