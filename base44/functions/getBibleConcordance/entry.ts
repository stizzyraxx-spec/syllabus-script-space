import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Simplified Bible data for concordance search
const BIBLE_CONCORDANCE = {
  love: [
    { book: "John", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
    { book: "1 John", chapter: 4, verse: 8, text: "He that loveth not knoweth not God; for God is love." },
    { book: "1 Corinthians", chapter: 13, verse: 4, text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up," },
    { book: "John", chapter: 13, verse: 35, text: "By this shall all men know that ye are my disciples, if ye have love one to another." },
    { book: "Proverbs", chapter: 10, verse: 12, text: "Hatred stirreth up strifes: but love covereth all sins." },
    { book: "Romans", chapter: 5, verse: 8, text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." }
  ],
  faith: [
    { book: "Hebrews", chapter: 11, verse: 1, text: "Now faith is the substance of things hoped for, the evidence of things not seen." },
    { book: "Romans", chapter: 10, verse: 17, text: "So then faith cometh by hearing, and hearing by the word of God." },
    { book: "Proverbs", chapter: 3, verse: 5, text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding." },
    { book: "Mark", chapter: 11, verse: 24, text: "Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them." },
    { book: "James", chapter: 2, verse: 26, text: "For as the body without the spirit is dead, so faith without works is dead also." },
    { book: "2 Corinthians", chapter: 5, verse: 7, text: "For we walk by faith, not by sight:" }
  ],
  kingdom: [
    { book: "Matthew", chapter: 6, verse: 33, text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." },
    { book: "Matthew", chapter: 3, verse: 2, text: "And saying, Repent ye: for the kingdom of heaven is at hand." },
    { book: "Luke", chapter: 17, verse: 21, text: "Neither shall they say, Lo here! or, lo there! for, behold, the kingdom of God is within you." },
    { book: "Colossians", chapter: 1, verse: 13, text: "Who hath delivered us from the power of darkness, and hath translated us into the kingdom of his dear Son:" },
    { book: "Matthew", chapter: 5, verse: 3, text: "Blessed are the poor in spirit: for theirs is the kingdom of heaven." }
  ],
  grace: [
    { book: "Ephesians", chapter: 2, verse: 8, text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:" },
    { book: "2 Corinthians", chapter: 12, verse: 9, text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness." },
    { book: "Romans", chapter: 3, verse: 24, text: "Being justified freely by his grace through the redemption that is in Christ Jesus:" },
    { book: "Titus", chapter: 2, verse: 11, text: "For the grace of God that bringeth salvation hath appeared to all men," },
    { book: "Hebrews", chapter: 4, verse: 16, text: "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need." }
  ],
  salvation: [
    { book: "Romans", chapter: 10, verse: 9, text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved." },
    { book: "Acts", chapter: 4, verse: 12, text: "Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved." },
    { book: "Titus", chapter: 2, verse: 11, text: "For the grace of God that bringeth salvation hath appeared to all men," },
    { book: "2 Timothy", chapter: 2, verse: 10, text: "Therefore I endure all things for the elect's sakes, that they may also obtain the salvation which is in Christ Jesus with eternal glory." },
    { book: "1 Peter", chapter: 1, verse: 9, text: "Receiving the end of your faith, even the salvation of your souls." }
  ],
  mercy: [
    { book: "Psalm", chapter: 23, verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever." },
    { book: "Matthew", chapter: 5, verse: 7, text: "Blessed are the merciful: for they shall obtain mercy." },
    { book: "James", chapter: 2, verse: 13, text: "For he shall have judgment without mercy, that hath shewed no mercy; and mercy rejoiceth against judgment." },
    { book: "Proverbs", chapter: 3, verse: 3, text: "Let not mercy and truth forsake thee: bind them about thy neck; write them upon the table of thine heart:" },
    { book: "Luke", chapter: 6, verse: 36, text: "Be ye therefore merciful, as your Father also is merciful." }
  ],
  prayer: [
    { book: "1 Thessalonians", chapter: 5, verse: 17, text: "Pray without ceasing." },
    { book: "Matthew", chapter: 6, verse: 6, text: "But thou, when thou prayest, enter into thy closet, and when thou hast shut to thy door, pray to thy Father which is in secret;" },
    { book: "Philippians", chapter: 4, verse: 6, text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God." },
    { book: "James", chapter: 5, verse: 16, text: "Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much." },
    { book: "Matthew", chapter: 21, verse: 22, text: "And all things, whatsoever ye shall ask in prayer, believing, ye shall receive." }
  ],
  wisdom: [
    { book: "Proverbs", chapter: 3, verse: 13, text: "Happy is the man that findeth wisdom, and the man that getteth understanding." },
    { book: "James", chapter: 1, verse: 5, text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him." },
    { book: "Proverbs", chapter: 1, verse: 7, text: "The fear of the Lord is the beginning of knowledge: but fools despise wisdom and instruction." },
    { book: "1 Corinthians", chapter: 1, verse: 25, text: "Because the foolishness of God is wiser than men; and the weakness of God is stronger than men." },
    { book: "Proverbs", chapter: 8, verse: 11, text: "For wisdom is better than rubies; and all the things that may be desired are not to be compared to it." }
  ]
};

function extractContext(text, word, contextLength = 40) {
  const lowerText = text.toLowerCase();
  const lowerWord = word.toLowerCase();
  const index = lowerText.indexOf(lowerWord);
  
  if (index === -1) return { before: "", word: word, after: "" };
  
  const before = text.substring(Math.max(0, index - contextLength), index).trim();
  const after = text.substring(index + word.length, Math.min(text.length, index + word.length + contextLength)).trim();
  const foundWord = text.substring(index, index + word.length);
  
  return { before, word: foundWord, after };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const searchWord = body.word?.toLowerCase().trim();

    if (!searchWord) {
      return Response.json({ error: "No word provided" }, { status: 400 });
    }

    const occurrences = [];
    const concordanceData = BIBLE_CONCORDANCE[searchWord] || [];

    for (const occurrence of concordanceData) {
      const context = extractContext(occurrence.text, searchWord);
      occurrences.push({
        book: occurrence.book,
        chapter: occurrence.chapter,
        verse: occurrence.verse,
        word: context.word,
        beforeContext: context.before,
        afterContext: context.after,
        fullText: occurrence.text
      });
    }

    return Response.json({
      word: searchWord,
      occurrences,
      count: occurrences.length
    });
  } catch (error) {
    console.error("Error in getBibleConcordance:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});