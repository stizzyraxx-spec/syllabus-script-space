import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { Loader2, Users, CheckCircle2, AlertTriangle } from "lucide-react";

const DEMO_USERS = [
  { display_name: "Grace Williams", username: "grace_w", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=grace", bio: "Walking in faith every day 🙏" },
  { display_name: "Marcus Thompson", username: "marcus_t", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus", bio: "Student of the Word | Romans 8:28" },
  { display_name: "Priscilla James", username: "priscilla_j", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=priscilla", bio: "Praising Him through the storm 🌿" },
  { display_name: "David Okonkwo", username: "david_ok", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=david", bio: "Worship leader | Psalms enthusiast" },
  { display_name: "Ruth Nakamura", username: "ruth_n", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ruth", bio: "His mercies are new every morning 🌅" },
  { display_name: "Solomon Carter", username: "solomon_c", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=solomon", bio: "Seeking wisdom daily | Proverbs 3:5" },
];

const DEMO_POSTS = [
  { ref: "John 3:16", caption: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.\n\n— John 3:16 (KJV)\n\nThis verse never gets old. God's love is boundless and unconditional. 🙏", user: 0 },
  { ref: "Psalms 23:1", caption: "The LORD is my shepherd; I shall not want.\n\n— Psalms 23:1 (KJV)\n\nNo matter what season you are in, He provides. Rest in that truth today. 🌿", user: 1 },
  { ref: "Philippians 4:13", caption: "I can do all things through Christ which strengtheneth me.\n\n— Philippians 4:13 (KJV)\n\nWhatever you're facing today — a hard conversation, a new challenge, a difficult season — lean on this promise. 💪🏾", user: 2 },
  { ref: "Proverbs 3:5-6", caption: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.\n\n— Proverbs 3:5-6 (KJV)\n\nStopped trying to figure it all out. Just trusting Him. ✝️", user: 3 },
  { ref: "Romans 8:28", caption: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.\n\n— Romans 8:28 (KJV)\n\nEven the hard things. Even the painful chapters. ALL things. 🙌", user: 4 },
  { ref: "Isaiah 40:31", caption: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.\n\n— Isaiah 40:31 (KJV)\n\nFor everyone in a waiting season — He is not done with your story. 🦅", user: 5 },
  { ref: "Jeremiah 29:11", caption: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.\n\n— Jeremiah 29:11 (KJV)\n\nHe has a plan. Trust the process. 📖", user: 0 },
  { ref: "Matthew 6:33", caption: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.\n\n— Matthew 6:33 (KJV)\n\nPriorities. Put Him first and watch everything else align. 🙏", user: 1 },
  { ref: "Lamentations 3:22-23", caption: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.\n\n— Lamentations 3:22-23 (KJV)\n\nNew mercies. Every. Single. Morning. 🌅 So grateful.", user: 2 },
  { ref: "Ephesians 2:8-9", caption: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.\n\n— Ephesians 2:8-9 (KJV)\n\nSalvation is a gift, not a wage. Nothing we do earns it — only His grace. 🙌", user: 3 },
  { ref: "Psalm 46:10", caption: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.\n\n— Psalm 46:10 (KJV)\n\nIn a noisy world, find your still. He is God. That is enough. 🕊️", user: 4 },
  { ref: "2 Timothy 1:7", caption: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.\n\n— 2 Timothy 1:7 (KJV)\n\nFear is not from God. Claim your power today. ✝️💪", user: 5 },
];

export default function SeedDemoData({ user }) {
  const [status, setStatus] = useState("idle"); // idle | running | done | error
  const [log, setLog] = useState([]);
  const [created, setCreated] = useState(0);

  const addLog = (msg, type = "info") => setLog(l => [...l, { msg, type }]);

  const runSeed = async () => {
    if (!user) { alert("Must be logged in as admin to seed demo data."); return; }
    setStatus("running");
    setLog([]);
    setCreated(0);

    let count = 0;
    for (const post of DEMO_POSTS) {
      const demoUser = DEMO_USERS[post.user];
      try {
        await db.entities.CommunityPost.create({
          author_email: `demo_${demoUser.username}@theconditionofman.com`,
          author_name: demoUser.display_name,
          author_avatar: demoUser.avatar_url,
          caption: post.caption,
          media_url: null,
          media_type: "text",
          likes: Math.floor(Math.random() * 40) + 5,
          liked_by: [],
          comment_count: Math.floor(Math.random() * 8),
        });
        count++;
        setCreated(count);
        addLog(`✓ Posted "${post.ref}" by ${demoUser.display_name}`, "success");
      } catch (err) {
        addLog(`✗ Failed "${post.ref}": ${err.message}`, "error");
      }
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    setStatus(count > 0 ? "done" : "error");
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-accent" />
        <h3 className="font-display text-lg font-bold text-foreground">Seed Demo Bible Verse Posts</h3>
      </div>
      <p className="font-body text-sm text-muted-foreground">
        Creates {DEMO_POSTS.length} demo community posts from {DEMO_USERS.length} fictional users, each sharing a KJV Bible verse with a reflection caption.
      </p>

      {status === "idle" && (
        <button
          onClick={runSeed}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          Run Seed
        </button>
      )}

      {status === "running" && (
        <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating posts… {created}/{DEMO_POSTS.length}
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center gap-2 text-sm font-body text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />
          Done — {created} posts created.
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm font-body text-destructive">
          <AlertTriangle className="w-4 h-4" />
          Finished with errors. Check log below.
        </div>
      )}

      {log.length > 0 && (
        <div className="bg-background rounded-lg border border-border p-3 space-y-1 max-h-48 overflow-y-auto">
          {log.map((entry, i) => (
            <p key={i} className={`font-mono text-xs ${entry.type === "error" ? "text-destructive" : "text-emerald-600"}`}>
              {entry.msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
