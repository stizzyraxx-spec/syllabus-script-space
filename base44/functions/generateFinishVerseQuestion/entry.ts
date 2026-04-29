const VERSE_POOL = [
  { reference: "John 3:16 KJV", verse_start: "For God so loved the world,", correct_ending: "that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", distractors: ["that he sent his prophets to teach all nations the way of righteousness.", "that he established his kingdom on earth and called the righteous to inherit it.", "that he poured out his Spirit upon all flesh and gave them wisdom."], context: "The most quoted verse in the Bible — the core of the Gospel message." },
  { reference: "Psalm 23:1 KJV", verse_start: "The LORD is my shepherd;", correct_ending: "I shall not want.", distractors: ["I shall fear no evil.", "I shall praise his name forever.", "I shall walk in his courts."], context: "David's most beloved psalm, expressing complete trust in God's provision." },
  { reference: "Romans 8:28 KJV", verse_start: "And we know that all things work together for good", correct_ending: "to them that love God, to them who are the called according to his purpose.", distractors: ["to them that are obedient and faithful in all their ways.", "to those who seek his face and do his commandments.", "to the righteous who walk blamelessly before him."], context: "One of the most encouraging promises in Scripture for believers facing trials." },
  { reference: "Proverbs 3:5 KJV", verse_start: "Trust in the LORD with all thine heart;", correct_ending: "and lean not unto thine own understanding.", distractors: ["and he shall direct thy paths through all the earth.", "and thy wisdom shall be established before all men.", "and thy works shall prosper in every season."], context: "A foundational call to surrender our self-reliance and trust God's wisdom." },
  { reference: "Philippians 4:13 KJV", verse_start: "I can do all things", correct_ending: "through Christ which strengtheneth me.", distractors: ["through faith and the power of prayer.", "if I commit my ways unto the Lord.", "by the wisdom given to me by the Holy Spirit."], context: "Paul wrote this while imprisoned, declaring contentment through Christ regardless of circumstance." },
  { reference: "Jeremiah 29:11 KJV", verse_start: "For I know the thoughts that I think toward you, saith the LORD,", correct_ending: "thoughts of peace, and not of evil, to give you an expected end.", distractors: ["thoughts of righteousness and truth, to build you up in holiness.", "thoughts of power and strength, to make you victorious over your enemies.", "thoughts of wisdom and counsel, that you may walk in my ways."], context: "God's promise to the exiles in Babylon — His plans for them were good despite their current suffering." },
  { reference: "Isaiah 40:31 KJV", verse_start: "But they that wait upon the LORD shall renew their strength;", correct_ending: "they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", distractors: ["they shall stand firm against the enemy and shall not be moved from their place.", "they shall be filled with wisdom and understanding and shall not stumble.", "they shall receive power from on high and shall bear fruit in every season."], context: "A promise of supernatural renewal for those who trust patiently in God." },
  { reference: "Matthew 5:3 KJV", verse_start: "Blessed are the poor in spirit:", correct_ending: "for theirs is the kingdom of heaven.", distractors: ["for they shall be comforted in all their sorrows.", "for they shall see God in his fullness.", "for they shall receive the inheritance of the earth."], context: "The first Beatitude — Jesus begins the Sermon on the Mount with a paradox of the Kingdom." },
  { reference: "2 Timothy 3:16 KJV", verse_start: "All scripture is given by inspiration of God,", correct_ending: "and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.", distractors: ["and is preserved by God for every generation that seeks his face.", "and shall not return void but shall accomplish the will of God.", "and is a lamp unto the feet of all who walk in his ways."], context: "The foundational text for the doctrine of biblical inspiration and authority." },
  { reference: "Hebrews 11:1 KJV", verse_start: "Now faith is the substance of things hoped for,", correct_ending: "the evidence of things not seen.", distractors: ["the assurance of God's promises given to his children.", "the confidence of one who walks blamelessly before God.", "the power that overcomes the world through obedience."], context: "The biblical definition of faith — substance and evidence without physical sight." },
  { reference: "Romans 3:23 KJV", verse_start: "For all have sinned,", correct_ending: "and come short of the glory of God.", distractors: ["and are in need of the mercy of God to be saved.", "and must repent and turn from their wicked ways.", "and deserve the judgment appointed for the unrighteous."], context: "The universal diagnosis of human sin — the foundation of Paul's argument in Romans." },
  { reference: "John 14:6 KJV", verse_start: "Jesus saith unto him, I am the way, the truth, and the life:", correct_ending: "no man cometh unto the Father, but by me.", distractors: ["whosoever believeth in me shall have everlasting life.", "I came that they might have life, and have it more abundantly.", "my sheep hear my voice and I know them, and they follow me."], context: "Jesus' exclusive claim to be the only path to the Father — a cornerstone of Christian apologetics." },
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
    const picked = shuffle(VERSE_POOL).slice(0, Math.min(count, VERSE_POOL.length));
    const questions = picked.map(q => {
      const pool = shuffle([q.correct_ending, ...q.distractors.slice(0, 3)]);
      const correct_index = pool.indexOf(q.correct_ending);
      return {
        reference: q.reference,
        verse_start: q.verse_start,
        correct_ending: q.correct_ending,
        options: pool,
        correct_index,
        context: q.context,
      };
    });
    return Response.json({ questions });
  } catch (error) {
    console.error("generateFinishVerseQuestion error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
