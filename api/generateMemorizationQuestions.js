import { generateMemorizationFromKjv, shuffle } from './_data/kjvHelpers.js';

const ANCHOR_POOL = [
  { reference: "John 3:16", prompt: "For God so loved the world,", answer: "that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", hint: "God's love for the world", context: "The Gospel in one sentence." },
  { reference: "Psalm 23:1-2", prompt: "The LORD is my shepherd; I shall not want.", answer: "He maketh me to lie down in green pastures: he leadeth me beside the still waters.", hint: "God as our shepherd", context: "David's psalm of trust." },
  { reference: "Romans 8:28", prompt: "And we know that all things work together for good", answer: "to them that love God, to them who are the called according to his purpose.", hint: "Promise for those who love God", context: "Paul's encouragement in suffering." },
  { reference: "Proverbs 3:5-6", prompt: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", answer: "In all thy ways acknowledge him, and he shall direct thy paths.", hint: "Trusting God's direction", context: "A foundational call to follow God's wisdom." },
  { reference: "Philippians 4:13", prompt: "I can do all things", answer: "through Christ which strengtheneth me.", hint: "Strength through Christ", context: "Paul wrote from prison." },
  { reference: "Isaiah 40:31", prompt: "But they that wait upon the LORD shall renew their strength;", answer: "they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", hint: "Waiting on the Lord", context: "Supernatural renewal for those who trust God." },
  { reference: "Hebrews 11:1", prompt: "Now faith is the substance of things hoped for,", answer: "the evidence of things not seen.", hint: "Definition of faith", context: "The biblical definition of faith." },
  { reference: "Matthew 6:33", prompt: "But seek ye first the kingdom of God, and his righteousness;", answer: "and all these things shall be added unto you.", hint: "Prioritizing God's kingdom", context: "Jesus' instruction on priorities." },
  { reference: "Jeremiah 29:11", prompt: "For I know the thoughts that I think toward you, saith the LORD,", answer: "thoughts of peace, and not of evil, to give you an expected end.", hint: "God's plans for you", context: "God's promise to the exiles." },
  { reference: "2 Timothy 3:16", prompt: "All scripture is given by inspiration of God,", answer: "and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.", hint: "The purpose of Scripture", context: "Foundational text on biblical inspiration." },
  { reference: "Ephesians 2:8-9", prompt: "For by grace are ye saved through faith;", answer: "and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.", hint: "Salvation by grace", context: "Salvation as God's gift, not earned." },
  { reference: "Romans 12:2", prompt: "And be not conformed to this world:", answer: "but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.", hint: "Transformed by mind renewal", context: "Paul's call to spiritual transformation." },
  { reference: "Galatians 2:20", prompt: "I am crucified with Christ:", answer: "nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God.", hint: "Living by faith in Christ", context: "Paul's identity statement of new life in Christ." },
  { reference: "1 John 1:9", prompt: "If we confess our sins,", answer: "he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.", hint: "God's promise to forgive", context: "Confession and forgiveness." },
  { reference: "Joshua 1:9", prompt: "Be strong and of a good courage; be not afraid, neither be thou dismayed:", answer: "for the LORD thy God is with thee whithersoever thou goest.", hint: "Be strong, be not afraid", context: "God's commission to Joshua." },
  { reference: "Romans 10:9", prompt: "If thou shalt confess with thy mouth the Lord Jesus,", answer: "and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.", hint: "Confess and believe to be saved", context: "Paul's clear statement of salvation." },
  { reference: "James 1:2-3", prompt: "My brethren, count it all joy when ye fall into divers temptations;", answer: "knowing this, that the trying of your faith worketh patience.", hint: "Joy in trials", context: "James on the purpose of trials." },
  { reference: "1 Peter 5:7", prompt: "Casting all your care upon him;", answer: "for he careth for you.", hint: "God cares for you", context: "Peter's word on anxiety." },
  { reference: "Matthew 11:28", prompt: "Come unto me, all ye that labour and are heavy laden,", answer: "and I will give you rest.", hint: "Jesus' invitation to rest", context: "Christ's offer of rest to the weary." },
  { reference: "John 14:6", prompt: "Jesus saith unto him, I am the way, the truth, and the life:", answer: "no man cometh unto the Father, but by me.", hint: "Jesus the only way", context: "Christ's exclusive claim." },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { count = 5 } = req.body ?? {};
    const target = Math.max(1, Math.min(50, count));

    const questions = [];
    const usedRefs = new Set();
    const anchorTarget = Math.max(1, Math.floor(target * 0.3));
    const shuffledAnchors = shuffle(ANCHOR_POOL);

    for (let i = 0; i < anchorTarget && i < shuffledAnchors.length; i++) {
      const a = shuffledAnchors[i];
      if (usedRefs.has(a.reference)) continue;
      usedRefs.add(a.reference);
      questions.push(a);
    }

    let safety = 0;
    while (questions.length < target && safety++ < target * 5) {
      const q = generateMemorizationFromKjv();
      if (usedRefs.has(q.reference)) continue;
      usedRefs.add(q.reference);
      questions.push(q);
    }

    return res.status(200).json({ questions });
  } catch (err) {
    console.error('generateMemorizationQuestions error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

export const config = { maxDuration: 30 };
