import React from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Users, BookOpen, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function PlanOverview({ planId, user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: plan } = useQuery({
    queryKey: ["bible-plan", planId],
    queryFn: () =>
      db.entities.BiblePlan.list("-created_date").then((plans) =>
        plans.find((p) => p.id === planId)
      ),
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", planId, user?.email],
    queryFn: () =>
      user?.email
        ? db.entities.UserPlanEnrollment.filter({
            user_email: user.email,
            plan_id: planId,
          }).then((e) => e[0])
        : null,
    enabled: !!user?.email,
  });

  const { data: enrollmentCount = 0 } = useQuery({
    queryKey: ["enrollment-count", planId],
    queryFn: () =>
      db.entities.UserPlanEnrollment.filter({
        plan_id: planId,
        status: "active",
      }).then((e) => e.length),
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) {
        db.auth.redirectToLogin();
        return;
      }
      const startDate = plan.type === "selfpaced"
        ? new Date().toISOString().split("T")[0]
        : plan.start_date;

      await db.entities.UserPlanEnrollment.create({
        user_email: user.email,
        plan_id: planId,
        status: "active",
        current_day: 1,
        user_start_date: startDate,
        completed_days: [],
      });

      // Update plan enrollment count
      await db.entities.BiblePlan.update(planId, {
        enrolled_count: (plan.enrolled_count || 0) + 1,
      });

      queryClient.invalidateQueries({ queryKey: ["enrollment", planId] });
      navigate(`/bible-plans/${planId}/study`);
    },
  });

  if (!plan) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/bible-plans"
        className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-body text-sm font-semibold mb-6 transition-colors"
      >
        ← Back to Plans
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/80 to-primary/60 p-8 text-white">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold mb-2">
                {plan.title}
              </h1>
              <p className="font-body text-white/80">{plan.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="font-body text-xs text-muted-foreground mb-1">
                Duration
              </p>
              <p className="font-display text-lg font-bold text-foreground">
                {plan.duration_days} Days
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="font-body text-xs text-muted-foreground mb-1">
                Type
              </p>
              <p className="font-display text-lg font-bold text-foreground">
                {plan.type === "fixed" ? "Structured" : "Self-Paced"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="font-body text-xs text-muted-foreground mb-1">
                Participants
              </p>
              <p className="font-display text-lg font-bold text-accent">
                {enrollmentCount}
              </p>
            </div>
          </div>

          {/* Sample readings */}
          <div className="mb-8">
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              Sample Readings
            </h2>
            <div className="space-y-3">
              {plan.readings.slice(0, 3).map((reading) => (
                <div
                  key={reading.day}
                  className="p-4 rounded-lg border border-border hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-body font-semibold text-foreground">
                      {reading.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      Day {reading.day}
                    </span>
                  </div>
                  <p className="font-body text-xs text-accent mb-2">
                    {reading.book} {reading.chapter}:{reading.verses}
                  </p>
                  <p className="font-body text-sm text-muted-foreground italic">
                    "{reading.discussion_prompt}"
                  </p>
                </div>
              ))}
              {plan.readings.length > 3 && (
                <p className="font-body text-xs text-muted-foreground text-center py-2">
                  + {plan.readings.length - 3} more readings
                </p>
              )}
            </div>
          </div>

          {/* CTA */}
          {enrollment ? (
            <Link
              to={`/bible-plans/${planId}/study`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Continue Your Study
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="w-full py-3 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 disabled:opacity-40 transition-colors"
            >
              {joinMutation.isPending
                ? "Joining..."
                : "Join This Plan"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}