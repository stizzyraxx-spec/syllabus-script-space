const MEMORIZATION_POOL = [
  { reference: "John 3:16", prompt: "For God so loved the world,", answer: "that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", hint: "God's love for the world", context: "The most quoted verse in the Bible — the Gospel in one sentence." },
  { reference: "Psalm 23:1-2", prompt: "The LORD is my shepherd; I shall not want.", answer: "He maketh me to lie down in green pastures: he leadeth me beside the still waters.", hint: "God as our shepherd", context: "David's psalm of trust in God's provision and rest." },
  { reference: "Romans 8:28", prompt: "And we know that all things work together for good", answer: "to them that love God, to them who are the called according to his purpose.", hint: "Promise for those who love God", context: "Paul's encouragement for believers facing suffering and hardship." },
  { reference: "Proverbs 3:5-6", prompt: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", answer: "In all thy ways acknowledge him, and he shall direct thy paths.", hint: "Trusting God's direction", context: "A foundational call to surrender self-reliance and follow God's wisdom." },
  { reference: "Philippians 4:13", prompt: "I can do all things", answer: "through Christ which strengtheneth me.", hint: "Strength through Christ", context: "Paul wrote from prison — contentment and strength through Christ regardless of circumstances." },
  { reference: "Isaiah 40:31", prompt: "But they that wait upon the LORD shall renew their strength;", answer: "they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", hint: "Waiting on the Lord", context: "A promise of supernatural renewal for those who trust God patiently." },
  { reference: "Hebrews 11:1", prompt: "Now faith is the substance of things hoped for,", answer: "the evidence of things not seen.", hint: "Definition of faith", context: "The biblical definition of faith — confidence in God's promises without physical proof." },
  { reference: "Matthew 6:33", prompt: "But seek ye first the kingdom of God, and his righteousness;", answer: "and all these things shall be added unto you.", hint: "Prioritizing God's kingdom", context: "Jesus' instruction on priorities — seek God first and trust Him for all your needs." },
  { reference: "Jeremiah 29:11", prompt: "For I know the thoughts that I think toward you, saith the LORD,", answer: "thoughts of peace, and not of evil, to give you an expected end.", hint: "God's plans for you", context: "God's promise to the exiles in Babylon — His plans for them were good despite their suffering." },
  { reference: "2 Timothy 3:16", prompt: "All scripture is given by inspiration of God,", answer: "and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.", hint: "The purpose of Scripture", context: "The foundational text for the doctrine of biblical inspiration and authority." },
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
    const { count = 5 } = await req.json().catch(() => ({}));
    const questions = shuffle(MEMORIZATION_POOL).slice(0, Math.min(count, MEMORIZATION_POOL.length));
    return Response.json({ questions });
  } catch (error) {
    console.error("generateMemorizationQuestions error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
