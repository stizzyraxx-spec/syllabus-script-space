import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import ReflectionPanel from "./ReflectionPanel";

export default function PlanStudyView({ planId, user }) {
  const [currentDay, setCurrentDay] = useState(1);
  const [showReflections, setShowReflections] = useState(false);
  const queryClient = useQueryClient();

  const { data: plan } = useQuery({
    queryKey: ["bible-plan", planId],
    queryFn: () => base44.entities.BiblePlan.list("-created_date").then(
      (plans) => plans.find((p) => p.id === planId)
    ),
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", planId, user?.email],
    queryFn: () =>
      user?.email
        ? base44.entities.UserPlanEnrollment.filter({
            user_email: user.email,
            plan_id: planId,
          }).then((e) => e[0])
        : null,
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (enrollment) {
      setCurrentDay(enrollment.current_day);
    }
  }, [enrollment]);

  const { data: dayReflections = [] } = useQuery({
    queryKey: ["day-reflections", planId, currentDay],
    queryFn: () =>
      base44.entities.PlanReflection.filter({
        plan_id: planId,
        day: currentDay,
      }),
  });

  const markDayComplete = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const completed = enrollment.completed_days || [];
      if (!completed.includes(currentDay)) {
        completed.push(currentDay);
      }
      const nextDay = Math.min(currentDay + 1, plan.duration_days);
      await base44.entities.UserPlanEnrollment.update(enrollment.id, {
        current_day: nextDay,
        completed_days: completed,
        status:
          nextDay > plan.duration_days ? "completed" : enrollment.status,
      });
      queryClient.invalidateQueries({ queryKey: ["enrollment", planId] });
    },
  });

  const moveDay = (direction) => {
    const newDay = direction === "next" ? currentDay + 1 : currentDay - 1;
    if (newDay >= 1 && newDay <= plan.duration_days) {
      setCurrentDay(newDay);
    }
  };

  if (!plan) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  const reading = plan.readings.find((r) => r.day === currentDay);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          {plan.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Day {currentDay} of {plan.duration_days}
          </span>
          <span>·</span>
          <span>
            {enrollment?.completed_days?.length || 0}/{plan.duration_days}{" "}
            completed
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2 mb-8">
        <motion.div
          className="bg-accent h-2 rounded-full transition-all"
          animate={{
            width: `${((enrollment?.completed_days?.length || 0) / plan.duration_days) * 100}%`,
          }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Reading panel */}
        <div className="lg:col-span-2">
          <motion.div
            key={currentDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-border bg-card mb-6"
          >
            {reading && (
              <>
                <div className="mb-4">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    {reading.title}
                  </h2>
                  <p className="font-body text-sm text-accent">
                    {reading.book} {reading.chapter}:{reading.verses}
                  </p>
                </div>

                <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="font-body text-sm leading-relaxed text-foreground">
                    {/* TODO: Fetch actual Bible text from integration */}
                    Bible passage content would display here
                  </p>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    Reflection Prompt
                  </h3>
                  <p className="font-body text-muted-foreground italic">
                    "{reading.discussion_prompt}"
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => moveDay("prev")}
              disabled={currentDay === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {enrollment && !enrollment.completed_days?.includes(currentDay) && (
              <button
                onClick={() => markDayComplete.mutate()}
                disabled={markDayComplete.isPending}
                className="px-6 py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 disabled:opacity-40 transition-colors"
              >
                Mark Complete
              </button>
            )}

            <button
              onClick={() => moveDay("next")}
              disabled={currentDay === plan.duration_days}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Write reflection */}
          {user && (
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                Share Your Reflection
              </h3>
              <textarea
                placeholder="What did this passage teach you? How does it apply to your life?"
                className="w-full p-4 rounded-lg border border-border bg-background text-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent mb-3"
                rows="4"
              />
              <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold hover:bg-primary/90 transition-colors">
                Post Reflection
              </button>
            </div>
          )}
        </div>

        {/* Reflections sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <button
              onClick={() => setShowReflections(!showReflections)}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-card mb-4 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-accent" />
                <span className="font-body font-semibold text-foreground">
                  Community Reflections
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {dayReflections.length}
              </span>
            </button>

            <AnimatePresence>
              {showReflections && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {dayReflections.map((reflection) => (
                    <ReflectionPanel
                      key={reflection.id}
                      reflection={reflection}
                      currentUser={user}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}