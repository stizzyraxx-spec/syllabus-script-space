import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import BiblePlansHub from "@/components/bibleplans/BiblePlansHub";
import PlanOverview from "@/components/bibleplans/PlanOverview";
import PlanStudyView from "@/components/bibleplans/PlanStudyView";

export default function BiblePlansMain() {
  const { planId, view } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    db.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await db.auth.me();
        setUser(me);
      }
    });
  }, []);

  // Hub view (all plans)
  if (!planId) {
    return <BiblePlansHub />;
  }

  // Plan overview (join page)
  if (!view) {
    return <PlanOverview planId={planId} user={user} />;
  }

  // Study view (reading interface)
  if (view === "study") {
    return <PlanStudyView planId={planId} user={user} />;
  }

  return null;
}