const ROUNDS = [
  {
    topic: "Salvation & Grace",
    statements: [
      { text: "Salvation is a gift of God, received through faith, not earned by works. (Ephesians 2:8-9)", is_false: false },
      { text: "Jesus declared 'I am the way, the truth, and the life: no man cometh unto the Father, but by me.' (John 14:6)", is_false: false },
      { text: "The Bible teaches that sincere people of any religion can earn salvation through righteous living.", is_false: true },
      { text: "Paul wrote that we are 'justified by faith' and 'have peace with God through our Lord Jesus Christ.' (Romans 5:1)", is_false: false },
    ],
    correct_index: 2,
    explanation: "The Bible consistently teaches that salvation comes exclusively through faith in Jesus Christ, not through works or sincerity in any religion. (Acts 4:12, John 14:6, Ephesians 2:8-9)",
    false_teaching_name: "Universalism / Works-Based Salvation",
  },
  {
    topic: "The Nature of God",
    statements: [
      { text: "The Bible teaches that God is one God existing in three persons — Father, Son, and Holy Spirit. (Matthew 28:19)", is_false: false },
      { text: "Jesus was fully God and fully man — the divine Son of God incarnate. (John 1:1,14)", is_false: false },
      { text: "The Holy Spirit is merely a divine force or power, not a personal being with intellect and will.", is_false: true },
      { text: "God is described as omniscient, knowing all things past, present, and future. (Psalm 139:1-4)", is_false: false },
    ],
    correct_index: 2,
    explanation: "The Holy Spirit is a full person of the Trinity — He grieves (Ephesians 4:30), intercedes with groans (Romans 8:26), and has a mind and will (1 Corinthians 12:11). The 'impersonal force' view is the Watchtower/Jehovah's Witnesses heresy.",
    false_teaching_name: "Anti-Trinitarian Impersonalism",
  },
  {
    topic: "Scripture & Authority",
    statements: [
      { text: "Paul wrote that 'all scripture is given by inspiration of God' and is profitable for doctrine and correction. (2 Timothy 3:16)", is_false: false },
      { text: "The Bible is the final authority for Christian faith and practice, superior to church tradition or personal experience.", is_false: false },
      { text: "The Bible teaches that new prophetic revelation can add to or correct Scripture in every generation.", is_false: true },
      { text: "Jesus said 'Heaven and earth shall pass away, but my words shall not pass away.' (Matthew 24:35)", is_false: false },
    ],
    correct_index: 2,
    explanation: "Revelation 22:18-19 warns against adding to or subtracting from Scripture. Jude 3 calls believers to contend for 'the faith once delivered to the saints.' The canon of Scripture is closed — no new authoritative revelation corrects or adds to it.",
    false_teaching_name: "Continuing Revelation Heresy",
  },
  {
    topic: "The Resurrection",
    statements: [
      { text: "Paul wrote that if Christ has not been raised, Christian faith is 'vain' and believers are 'most miserable.' (1 Corinthians 15:17-19)", is_false: false },
      { text: "The resurrection of Jesus was a physical, bodily resurrection witnessed by over 500 people. (1 Corinthians 15:3-8)", is_false: false },
      { text: "The resurrection was a spiritual event — Jesus' body decomposed but his spirit triumphed over death.", is_false: true },
      { text: "Jesus foretold his own resurrection on the third day. (Matthew 16:21)", is_false: false },
    ],
    correct_index: 2,
    explanation: "The empty tomb, the disciples' willingness to die for the resurrection claim, and Paul's list of eyewitnesses (1 Cor 15) all affirm a bodily resurrection. A merely spiritual resurrection was a 2nd-century Gnostic innovation contradicted by Luke 24:39 — 'handle me and see; for a spirit hath not flesh and bones.'",
    false_teaching_name: "Spiritual Resurrection (Gnostic Heresy)",
  },
  {
    topic: "Prosperity Gospel",
    statements: [
      { text: "Jesus said 'In the world ye shall have tribulation: but be of good cheer; I have overcome the world.' (John 16:33)", is_false: false },
      { text: "Paul counted all earthly things as loss for the sake of knowing Christ, and learned contentment in all circumstances. (Philippians 3:8, 4:11)", is_false: false },
      { text: "The Bible teaches that faith guarantees physical health and financial prosperity for obedient Christians.", is_false: true },
      { text: "James warns that friendship with the world is enmity with God. (James 4:4)", is_false: false },
    ],
    correct_index: 2,
    explanation: "The prosperity gospel contradicts Scripture directly. Paul was beaten, imprisoned, and shipwrecked. Job suffered despite his righteousness. Jesus was homeless (Matthew 8:20). The Bible promises trials and tribulation for believers — not guaranteed wealth or health. (2 Timothy 3:12, Romans 8:17)",
    false_teaching_name: "Prosperity Gospel",
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
    const { usedTopics = [] } = await req.json().catch(() => ({}));
    const available = ROUNDS.filter(r => !usedTopics.includes(r.topic));
    const pool = available.length > 0 ? available : ROUNDS;
    const round = shuffle(pool)[0];
    return Response.json(round);
  } catch (error) {
    console.error("generateSpotFalseRound error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
