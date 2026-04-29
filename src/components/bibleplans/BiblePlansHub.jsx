import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Calendar, Clock, Users, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function BiblePlansHub() {
  const [user, setUser] = useState(null);
  const [userEnrollments, setUserEnrollments] = useState([]);

  useEffect(() => {
    db.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await db.auth.me();
        setUser(me);
      }
    });
  }, []);

  const { data: plans = [] } = useQuery({
    queryKey: ["bible-plans"],
    queryFn: () => db.entities.BiblePlan.list("-created_date", 50),
  });

  useEffect(() => {
    if (user?.email) {
      db.entities.UserPlanEnrollment.filter(
        { user_email: user.email, status: "active" }
      ).then(setUserEnrollments);
    }
  }, [user?.email]);

  const enrolledPlanIds = userEnrollments.map((e) => e.plan_id);

  const formatDuration = (days) => {
    return days === 30 ? "30 days" : days === 40 ? "40 days" : `${days} days`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-accent" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              Bible Study Plans
            </h1>
          </div>
          <p className="font-body text-muted-foreground">
            Join our community in structured Bible reading with daily reflections
          </p>
        </div>
        {user && (
          <Link
            to="/bible-plans/create"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </Link>
        )}
      </div>

      {/* Active Enrollments */}
      {user && userEnrollments.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Your Active Plans
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {userEnrollments.map((enrollment) => {
              const plan = plans.find((p) => p.id === enrollment.plan_id);
              if (!plan) return null;
              const progress = (
                ((enrollment.completed_days?.length ?? 0) / (plan.duration_days || 1)) *
                100
              ).toFixed(0);
              return (
                <motion.div
                  key={enrollment.id}
                  whileHover={{ y: -2 }}
                  className="p-5 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {plan.title}
                    </h3>
                    <span className="text-sm font-semibold text-accent">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mb-3">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Day {enrollment.current_day}/{plan.duration_days}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {plan.enrolled_count} enrolled
                    </span>
                  </div>
                  <Link
                    to={`/bible-plans/${enrollment.plan_id}/study`}
                    className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-body text-sm font-semibold transition-colors"
                  >
                    Continue Reading
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Plans */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">
          Available Plans
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="p-6 flex flex-col h-full">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {plan.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-4 flex-1">
                  {plan.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDuration(plan.duration_days)} ·{" "}
                      {plan.type === "fixed" ? "Structured" : "Self-paced"}
                    </span>
                  </div>
                  {plan.type === "fixed" && plan.start_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Starts {new Date(plan.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{plan.enrolled_count} participants</span>
                  </div>
                </div>

                {enrolledPlanIds.includes(plan.id) ? (
                  <Link
                    to={`/bible-plans/${plan.id}/study`}
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-body text-sm font-semibold text-center hover:bg-primary/90 transition-colors"
                  >
                    Continue
                  </Link>
                ) : (
                  <Link
                    to={`/bible-plans/${plan.id}`}
                    className="w-full py-2 rounded-lg bg-accent text-accent-foreground font-body text-sm font-semibold text-center hover:bg-accent/90 transition-colors"
                  >
                    Join Plan
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}