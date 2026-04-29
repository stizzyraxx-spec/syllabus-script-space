import React from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Calendar, Users, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function BiblePlansSection({ currentUser }) {
  const { data: activePlans = [], isLoading } = useQuery({
    queryKey: ["active-community-plans"],
    queryFn: () =>
      db.entities.BiblePlan.list("-created_date", 10).then((plans) =>
        plans.filter((p) => p.is_public && p.enrolled_count > 0)
      ),
  });

  const { data: userEnrollments = [] } = useQuery({
    queryKey: ["user-plan-enrollments", currentUser?.email],
    queryFn: () =>
      currentUser?.email
        ? db.entities.UserPlanEnrollment.filter({
            user_email: currentUser.email,
            status: "active",
          })
        : [],
    enabled: !!currentUser?.email,
  });

  const enrolledPlanIds = userEnrollments.map((e) => e.plan_id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          Community Bible Plans
        </h2>
        <Link
          to="/bible-plans"
          className="text-accent hover:text-accent/80 font-body text-xs font-semibold transition-colors"
        >
          View All →
        </Link>
      </div>

      {activePlans.length === 0 ? (
        <div className="p-6 rounded-lg border border-border bg-secondary/30 text-center">
          <p className="font-body text-sm text-muted-foreground">
            No active plans yet. Be the first to create one!
          </p>
          <Link
            to="/bible-plans"
            className="inline-block mt-3 text-accent hover:text-accent/80 font-body text-xs font-semibold transition-colors"
          >
            Browse Plans →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activePlans.slice(0, 4).map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -2 }}
              className="p-4 rounded-lg border border-border bg-card hover:border-accent/40 transition-all group"
            >
              <h3 className="font-display text-sm font-bold text-foreground mb-2 line-clamp-2">
                {plan.title}
              </h3>

              <div className="space-y-2 mb-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {plan.duration_days} days ·{" "}
                    {plan.type === "fixed" ? "Structured" : "Self-paced"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  <span>{plan.enrolled_count} studying together</span>
                </div>
              </div>

              {enrolledPlanIds.includes(plan.id) ? (
                <Link
                  to={`/bible-plans/${plan.id}/study`}
                  className="inline-flex items-center gap-1 text-accent hover:text-accent/80 font-body text-xs font-semibold transition-colors"
                >
                  Continue <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <Link
                  to={`/bible-plans/${plan.id}`}
                  className="inline-flex items-center gap-1 text-accent hover:text-accent/80 font-body text-xs font-semibold transition-colors"
                >
                  Join Plan <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}