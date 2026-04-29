import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Shield, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import ReportCard from "@/components/moderation/ReportCard";

const FILTER_STATUSES = [
  { value: "all", label: "All Reports" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

export default function Moderation() {
  const [user, setUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const currentUser = await db.auth.me();
        setUser(currentUser);
      }
      setLoading(false);
    });
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["mod-profile", user?.email],
    queryFn: () =>
      user?.email
        ? db.entities.UserProfile.filter({ user_email: user.email })
        : Promise.resolve([]),
    select: (data) => data[0],
    enabled: !!user?.email,
  });

  const { data: reports = [], refetch: refetchReports } = useQuery({
    queryKey: ["reported-content"],
    queryFn: () => db.entities.ReportedContent.list(),
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="font-body text-muted-foreground mb-4">You must be logged in to access the moderation dashboard.</p>
          <button
            onClick={() => db.auth.redirectToLogin()}
            className="px-6 py-2 rounded-lg bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!profile?.is_moderator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Moderator Access Only</h1>
          <p className="font-body text-muted-foreground">
            You do not have moderator permissions to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  const filteredReports = selectedStatus === "all"
    ? reports
    : reports.filter((r) => r.status === selectedStatus);

  const stats = [
    {
      icon: Clock,
      label: "Pending Reviews",
      value: reports.filter((r) => r.status === "pending").length,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
    },
    {
      icon: AlertCircle,
      label: "Under Review",
      value: reports.filter((r) => r.status === "under_review").length,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      icon: CheckCircle2,
      label: "Resolved",
      value: reports.filter((r) => r.status === "resolved").length,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-accent" />
            <h1 className="font-display text-4xl font-bold text-foreground">Moderation Dashboard</h1>
          </div>
          <p className="font-body text-muted-foreground">
            Review reported content and manage community safety
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border border-border ${bg}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </div>
              <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedStatus(value)}
              className={`px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                selectedStatus === value
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-accent/30"
              }`}
            >
              {label}
              <span className="ml-2 font-semibold">
                {value === "all"
                  ? reports.length
                  : reports.filter((r) => r.status === value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="p-12 rounded-xl border border-border text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3 opacity-50" />
            <p className="font-body text-muted-foreground">
              No {selectedStatus === "all" ? "reports" : selectedStatus} reports to review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onUpdate={() => refetchReports()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}