const MISSIONS = [
  {
    title: "A Test of Forgiveness",
    location: "Jerusalem",
    narrative: "A brother in your community has wronged you publicly and damaged your reputation. He has now come to ask forgiveness, but your heart is still wounded. Others are watching how you respond.",
    decisions: [
      { text: "Forgive him freely and immediately, just as Christ forgave you, without requiring him to earn it back.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 8, obedience_score: 8 }, consequence: "True forgiveness reflects the grace of God — unconditional and complete. Your obedience to Christ's command freed both you and your brother from the bondage of bitterness. (Colossians 3:13)", scripture: "Ephesians 4:32" },
      { text: "Tell him you forgive him, but keep your distance until you see real change in his behavior over time.", moralAlignment: "neutral", xp: 16, scoreChanges: { faith_score: 5, wisdom_score: 6, obedience_score: 4 }, consequence: "Caution after betrayal can be wise, but conditional forgiveness withholds the grace Christ modeled. Forgiveness and trust are different — you can extend one without immediately rebuilding the other.", scripture: "Matthew 18:21-22" },
      { text: "Confront him with your hurt first before extending forgiveness, so he understands the full weight of what he did.", moralAlignment: "neutral", xp: 12, scoreChanges: { faith_score: 3, wisdom_score: 7, obedience_score: 2 }, consequence: "While honesty is valuable, using the confrontation as a condition for forgiveness subtly places your emotional satisfaction above obedience to God's command. Forgiveness is not primarily for the offender — it frees you.", scripture: "Luke 17:3-4" },
    ],
  },
  {
    title: "The Widow's Need",
    location: "Capernaum",
    narrative: "A widow in your congregation has a genuine financial need. You have limited resources yourself, but God is prompting your heart to give. You pray and feel the nudge clearly.",
    decisions: [
      { text: "Give sacrificially in obedience to God's prompting, trusting Him to meet your own needs in return.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 7, obedience_score: 10 }, consequence: "The widow who gave her last two mites gave more than all the wealthy donors — not because of the amount, but because of the faith it required. Obedience to God's clear prompting honors Him and builds deep trust. (Luke 21:1-4)", scripture: "2 Corinthians 9:7" },
      { text: "Give a portion that feels comfortable, keeping enough to cover your own obligations first.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 4, wisdom_score: 6, obedience_score: 4 }, consequence: "Practical stewardship is wise, but giving what is comfortable rarely requires faith. The prompting was toward sacrifice — settling for comfort may have been managing God's call rather than obeying it.", scripture: "Proverbs 11:24" },
      { text: "Pray for her needs instead of giving, trusting that God will provide for her another way.", moralAlignment: "neutral", xp: 8, scoreChanges: { faith_score: 3, wisdom_score: 4, integrity_score: -3 }, consequence: "James 2:15-16 warns: if a brother or sister is naked and hungry and you say 'Go in peace, be warmed' without meeting their need, what does that profit? Prayer without action when God has given you means to act is incomplete obedience.", scripture: "James 2:15-17" },
    ],
  },
  {
    title: "Speaking Truth in Love",
    location: "Antioch",
    narrative: "A close friend is living in a pattern of sin that is harming him and those around him. He seems unaware that others have noticed. You have a private opportunity to speak to him.",
    decisions: [
      { text: "Speak the truth to him gently but clearly, motivated by genuine love for his soul, not reputation or correction.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 8, wisdom_score: 10, obedience_score: 9 }, consequence: "Faithful are the wounds of a friend (Proverbs 27:6). Speaking truth in love is costly — it risks the friendship — but it serves your friend's eternal good over temporal comfort. This is the highest form of friendship.", scripture: "Ephesians 4:15" },
      { text: "Stay silent to preserve the friendship, trusting God to deal with him in his own timing.", moralAlignment: "neutral", xp: 10, scoreChanges: { faith_score: 2, wisdom_score: 4, integrity_score: -4 }, consequence: "Silence in the face of a friend's sin can masquerade as patience or humility, but Ezekiel 3:18 warns that failing to warn those in sin makes us responsible. Discomfort in the friendship is not a sufficient reason to withhold truth.", scripture: "Galatians 6:1" },
      { text: "Bring the matter to the church elders first so that the confrontation carries more authority.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 5, wisdom_score: 7, obedience_score: 3 }, consequence: "Matthew 18 instructs going privately first before involving others. Escalating to elders without a private conversation skips the first step and can feel like ambush rather than restoration. Your private word was the right and loving first move.", scripture: "Matthew 18:15" },
    ],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Deno.serve(async (req) => {
  try {
    const { completedThemes = [] } = await req.json().catch(() => ({}));
    const available = MISSIONS.filter(m => !completedThemes.includes(m.title));
    const pool = available.length > 0 ? available : MISSIONS;
    const mission = shuffle(pool)[0];
    const shuffledDecisions = shuffle([...mission.decisions]);
    const correctIndex = shuffledDecisions.findIndex(d => d.moralAlignment === "righteous");

    return Response.json({
      title: mission.title,
      location: mission.location,
      narrative: mission.narrative,
      missionType: "moral_choice",
      reward_xp: 25,
      decisions: shuffledDecisions,
      correctIndex,
    });
  } catch (error) {
    console.error("generateDynamicMission error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
