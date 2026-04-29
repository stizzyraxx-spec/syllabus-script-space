const BOOK_MAP = {
  Genesis:'GEN',Exodus:'EXO',Leviticus:'LEV',Numbers:'NUM',Deuteronomy:'DEU',
  Joshua:'JOS',Judges:'JDG',Ruth:'RUT','1 Samuel':'1SA','2 Samuel':'2SA',
  '1 Kings':'1KI','2 Kings':'2KI','1 Chronicles':'1CH','2 Chronicles':'2CH',
  Ezra:'EZR',Nehemiah:'NEH',Esther:'EST',Job:'JOB',Psalms:'PSA',Proverbs:'PRO',
  Ecclesiastes:'ECC',Isaiah:'ISA',Jeremiah:'JER',Lamentations:'LAM',Ezekiel:'EZK',
  Daniel:'DAN',Hosea:'HOS',Joel:'JOL',Amos:'AMO',Obadiah:'OBA',Jonah:'JON',
  Micah:'MIC',Nahum:'NAM',Habakkuk:'HAB',Zephaniah:'ZEP',Haggai:'HAG',
  Zechariah:'ZEC',Malachi:'MAL',Matthew:'MAT',Mark:'MRK',Luke:'LUK',John:'JHN',
  Acts:'ACT',Romans:'ROM','1 Corinthians':'1CO','2 Corinthians':'2CO',
  Galatians:'GAL',Ephesians:'EPH',Philippians:'PHP',Colossians:'COL',
  '1 Thessalonians':'1TH','2 Thessalonians':'2TH','1 Timothy':'1TI',
  '2 Timothy':'2TI',Titus:'TIT',Philemon:'PHM',Hebrews:'HEB',James:'JAS',
  '1 Peter':'1PE','2 Peter':'2PE','1 John':'1JN','2 John':'2JN','3 John':'3JN',
  Jude:'JUD',Revelation:'REV',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { book, chapter } = req.body ?? {};
    if (!book || !chapter) return res.status(400).json({ error: 'Book and chapter are required' });
    if (!BOOK_MAP[book]) return res.status(200).json({ verses: [], error: `Unknown book: ${book}` });

    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=kjv`;
    const r = await fetch(url);
    if (!r.ok) return res.status(200).json({ verses: [], book, chapter });

    const data = await r.json();
    const verses = (data.verses ?? []).map(v => v.text.replace(/\n/g, ' ').trim());
    return res.status(200).json({ verses, book, chapter });
  } catch (err) {
    console.error('getBibleVerses error:', err.message);
    return res.status(500).json({ verses: [], error: err.message });
  }
}
