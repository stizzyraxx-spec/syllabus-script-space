import { generateFinishFromKjv, shuffle } from './_data/kjvHelpers.js';

// Curated anchor verses (high-recognition passages) — given some prominence in the rotation
const ANCHOR_POOL = [
  { reference: "John 3:16 KJV", verse_start: "For God so loved the world,", correct_ending: "that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", distractors: ["that he sent his prophets to teach all nations the way of righteousness.", "that he established his kingdom on earth and called the righteous to inherit it.", "that he poured out his Spirit upon all flesh and gave them wisdom."], context: "The most quoted verse in the Bible — the core of the Gospel message." },
  { reference: "Psalm 23:1 KJV", verse_start: "The LORD is my shepherd;", correct_ending: "I shall not want.", distractors: ["I shall fear no evil.", "I shall praise his name forever.", "I shall walk in his courts."], context: "David's most beloved psalm." },
  { reference: "Romans 8:28 KJV", verse_start: "And we know that all things work together for good", correct_ending: "to them that love God, to them who are the called according to his purpose.", distractors: ["to them that are obedient and faithful in all their ways.", "to those who seek his face and do his commandments.", "to the righteous who walk blamelessly before him."], context: "One of the most encouraging promises in Scripture." },
  { reference: "Proverbs 3:5 KJV", verse_start: "Trust in the LORD with all thine heart;", correct_ending: "and lean not unto thine own understanding.", distractors: ["and he shall direct thy paths through all the earth.", "and thy wisdom shall be established before all men.", "and thy works shall prosper in every season."], context: "A foundational call to trust God's wisdom." },
  { reference: "Philippians 4:13 KJV", verse_start: "I can do all things", correct_ending: "through Christ which strengtheneth me.", distractors: ["through faith and the power of prayer.", "if I commit my ways unto the Lord.", "by the wisdom given to me by the Holy Spirit."], context: "Paul wrote this from prison." },
  { reference: "Jeremiah 29:11 KJV", verse_start: "For I know the thoughts that I think toward you, saith the LORD,", correct_ending: "thoughts of peace, and not of evil, to give you an expected end.", distractors: ["thoughts of righteousness and truth, to build you up in holiness.", "thoughts of power and strength, to make you victorious over your enemies.", "thoughts of wisdom and counsel, that you may walk in my ways."], context: "God's promise to the exiles in Babylon." },
  { reference: "Isaiah 40:31 KJV", verse_start: "But they that wait upon the LORD shall renew their strength;", correct_ending: "they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", distractors: ["they shall stand firm against the enemy and shall not be moved from their place.", "they shall be filled with wisdom and understanding and shall not stumble.", "they shall receive power from on high and shall bear fruit in every season."], context: "A promise of supernatural renewal." },
  { reference: "Matthew 5:3 KJV", verse_start: "Blessed are the poor in spirit:", correct_ending: "for theirs is the kingdom of heaven.", distractors: ["for they shall be comforted in all their sorrows.", "for they shall see God in his fullness.", "for they shall receive the inheritance of the earth."], context: "The first Beatitude." },
  { reference: "2 Timothy 3:16 KJV", verse_start: "All scripture is given by inspiration of God,", correct_ending: "and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.", distractors: ["and is preserved by God for every generation that seeks his face.", "and shall not return void but shall accomplish the will of God.", "and is a lamp unto the feet of all who walk in his ways."], context: "Foundational text for biblical inspiration." },
  { reference: "Hebrews 11:1 KJV", verse_start: "Now faith is the substance of things hoped for,", correct_ending: "the evidence of things not seen.", distractors: ["the assurance of God's promises given to his children.", "the confidence of one who walks blamelessly before God.", "the power that overcomes the world through obedience."], context: "The biblical definition of faith." },
  { reference: "Romans 3:23 KJV", verse_start: "For all have sinned,", correct_ending: "and come short of the glory of God.", distractors: ["and are in need of the mercy of God to be saved.", "and must repent and turn from their wicked ways.", "and deserve the judgment appointed for the unrighteous."], context: "The universal diagnosis of human sin." },
  { reference: "John 14:6 KJV", verse_start: "Jesus saith unto him, I am the way, the truth, and the life:", correct_ending: "no man cometh unto the Father, but by me.", distractors: ["whosoever believeth in me shall have everlasting life.", "I came that they might have life, and have it more abundantly.", "my sheep hear my voice and I know them, and they follow me."], context: "Jesus' exclusive claim to be the only path to the Father." },
  { reference: "Genesis 1:1 KJV", verse_start: "In the beginning", correct_ending: "God created the heaven and the earth.", distractors: ["the Spirit of God moved upon the face of the deep.", "darkness was upon the face of the waters.", "the Word was, and the Word was with God."], context: "The opening verse of Scripture." },
  { reference: "Joshua 1:9 KJV", verse_start: "Be strong and of a good courage; be not afraid, neither be thou dismayed:", correct_ending: "for the LORD thy God is with thee whithersoever thou goest.", distractors: ["for the battle is not yours but the Lord's.", "for I have given thee this land for an inheritance.", "for thou shalt not fail in any of thy ways."], context: "God's commission to Joshua." },
  { reference: "Psalm 46:10 KJV", verse_start: "Be still,", correct_ending: "and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.", distractors: ["and trust in him who hath called thee.", "and wait upon the LORD all thy days.", "and meditate upon his word continually."], context: "A call to stillness and surrender." },
  { reference: "Matthew 6:33 KJV", verse_start: "But seek ye first the kingdom of God, and his righteousness;", correct_ending: "and all these things shall be added unto you.", distractors: ["and ye shall find rest unto your souls.", "and the LORD shall guide thy feet in his ways.", "and great shall be your reward in heaven."], context: "Jesus on priorities." },
  { reference: "1 Corinthians 13:13 KJV", verse_start: "And now abideth faith, hope, charity, these three;", correct_ending: "but the greatest of these is charity.", distractors: ["but the chief of these is faith unfeigned.", "and they shall not pass away.", "for love covereth a multitude of sins."], context: "Paul's conclusion to the love chapter." },
  { reference: "Galatians 5:22 KJV", verse_start: "But the fruit of the Spirit is love, joy, peace, longsuffering,", correct_ending: "gentleness, goodness, faith,", distractors: ["wisdom, knowledge, understanding,", "righteousness, mercy, holiness,", "kindness, humility, courage,"], context: "The fruit of the Spirit." },
  { reference: "Ephesians 2:8 KJV", verse_start: "For by grace are ye saved through faith;", correct_ending: "and that not of yourselves: it is the gift of God:", distractors: ["and ye shall walk in newness of life with Christ Jesus.", "and your works shall be manifest before all men.", "and ye shall be made perfect in love."], context: "Salvation by grace alone, through faith alone." },
  { reference: "Revelation 3:20 KJV", verse_start: "Behold, I stand at the door, and knock:", correct_ending: "if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me.", distractors: ["whoso openeth shall enter into the joy of the Lord.", "and I will reveal my glory unto him in that day.", "and he shall walk with me in white, for he is worthy."], context: "Christ's invitation to fellowship." },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { count = 5 } = req.body ?? {};
    const target = Math.max(1, Math.min(50, count));

    const questions = [];
    const usedRefs = new Set();
    // 30% anchor (high-recognition), 70% procedural across the full KJV
    const anchorTarget = Math.max(1, Math.floor(target * 0.3));
    const shuffledAnchors = shuffle(ANCHOR_POOL);

    for (let i = 0; i < anchorTarget && i < shuffledAnchors.length; i++) {
      const q = shuffledAnchors[i];
      if (usedRefs.has(q.reference)) continue;
      usedRefs.add(q.reference);
      const opts = shuffle([q.correct_ending, ...q.distractors.slice(0, 3)]);
      questions.push({
        reference: q.reference,
        verse_start: q.verse_start,
        correct_ending: q.correct_ending,
        options: opts,
        correct_index: opts.indexOf(q.correct_ending),
        context: q.context,
      });
    }

    let safety = 0;
    while (questions.length < target && safety++ < target * 5) {
      const q = generateFinishFromKjv();
      if (usedRefs.has(q.reference)) continue;
      usedRefs.add(q.reference);
      const opts = shuffle([q.correct_ending, ...q.distractors.slice(0, 3)]);
      questions.push({
        reference: q.reference,
        verse_start: q.verse_start,
        correct_ending: q.correct_ending,
        options: opts,
        correct_index: opts.indexOf(q.correct_ending),
        context: q.context,
      });
    }

    return res.status(200).json({ questions });
  } catch (err) {
    console.error('generateFinishVerseQuestion error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

export const config = { maxDuration: 30 };
