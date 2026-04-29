import React, { useState, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useSearchParams } from "react-router-dom";
import GamesHub from "@/components/forums/GamesHub";

export default function Games() {
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    db.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await db.auth.me());
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <GamesHub user={user} searchParams={searchParams} setSearchParams={setSearchParams} />
      </div>
    </div>
  );
}