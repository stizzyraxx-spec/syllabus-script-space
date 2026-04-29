// Biblical AI search — answers questions using the bundled KJV (31,102 verses)
// + a curated knowledge base of book introductions. NO external API key required.
import { getKjv } from './_data/kjvHelpers.js';
import { BOOK_INTROS } from './_data/bookIntros.js';

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','but','by','do','does','did','for','from','had','has','have','he','her','him','his','i','if','in','into','is','it','its','me','my','no','not','of','on','or','our','say','says','said','she','so','some','such','that','the','their','them','then','there','these','they','this','to','up','was','we','were','what','when','where','which','who','whom','whose','why','will','with','would','you','your','about','tell','please','can','could','would','should','am','any','many','much','one','only','than','too','very','also','just','book','bible','verse','verses','passage','scripture','show','give','find','tell'
]);

const BOOKS = Object.keys(BOOK_INTROS).map(b => b.toLowerCase());

function detectBook(q) {
  const lower = q.toLowerCase();
  // Try exact "book name" or "in book" patterns first; fall back to substring match
  for (const b of BOOKS) {
    if (lower.includes(b)) {
      // Find canonical-cased name
      const canonical = Object.keys(BOOK_INTROS).find(k => k.toLowerCase() === b);
      return canonical;
    }
  }
  return null;
}

function tokenize(q) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function searchVerses(keywords, limit = 8) {
  if (keywords.length === 0) return [];
  const kjv = getKjv();
  const matches = [];
  for (const v of kjv) {
    const text = v.t.toLowerCase();
    let hits = 0;
    for (const k of keywords) if (text.includes(k)) hits++;
    if (hits > 0) {
      matches.push({ ...v, score: hits });
    }
  }
  matches.sort((a, b) => b.score - a.score || a.t.length - b.t.length);
  return matches.slice(0, limit);
}

function formatBookAnswer(bookName, intro, q) {
  const lowerQ = q.toLowerCase();
  // Decide which facets to emphasize based on the question
  const sections = [];

  if (/audience|written\s+to|for\s+whom|recipient/.test(lowerQ)) {
    sections.push({ heading: 'Audience', body: intro.audience });
  }
  if (/author|wrote|writer|who\s+wrote/.test(lowerQ)) {
    sections.push({ heading: 'Author', body: intro.author });
  }
  if (/when|date|written|year|time/.test(lowerQ)) {
    sections.push({ heading: 'Date', body: intro.date });
  }
  if (/purpose|why|reason/.test(lowerQ)) {
    sections.push({ heading: 'Purpose', body: intro.purpose });
  }
  if (/theme|topic|main\s+idea|about/.test(lowerQ)) {
    sections.push({ heading: 'Themes', body: intro.themes.join(' • ') });
  }

  // If nothing matched specifically, give a full overview
  if (sections.length === 0) {
    sections.push(
      { heading: 'Author', body: intro.author },
      { heading: 'Date', body: intro.date },
      { heading: 'Audience', body: intro.audience },
      { heading: 'Purpose', body: intro.purpose },
      { heading: 'Themes', body: intro.themes.join(' • ') },
    );
  }

  const lines = [`**${bookName}**`, ''];
  for (const s of sections) lines.push(`**${s.heading}:** ${s.body}`);
  if (intro.structure) lines.push('', `**Structure:** ${intro.structure}`);
  if (intro.keyVerses?.length) lines.push('', `**Key verses:** ${intro.keyVerses.join(', ')}`);
  return lines.join('\n');
}

function formatVerseAnswer(verses, q) {
  if (verses.length === 0) {
    return `I searched all 31,102 verses of the King James Bible and could not find passages directly matching your question. Try simpler keywords (e.g. "love", "forgiveness", "patience") or ask about a specific Bible book.`;
  }
  const lines = [`Here are the most relevant passages from the King James Bible for your question:`, ''];
  for (const v of verses) {
    lines.push(`**${v.b} ${v.c}:${v.v}** — ${v.t}`);
    lines.push('');
  }
  return lines.join('\n').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { question } = req.body ?? {};
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }
    const q = question.trim();

    // 1) Did the user ask about a specific Bible book?
    const book = detectBook(q);
    if (book) {
      const intro = BOOK_INTROS[book];
      return res.status(200).json({
        question: q,
        mode: 'book_intro',
        book,
        answer: formatBookAnswer(book, intro, q),
      });
    }

    // 2) Otherwise — keyword-search the KJV and return ranked verses
    const keywords = tokenize(q);
    const verses = searchVerses(keywords, 8);
    return res.status(200).json({
      question: q,
      mode: 'topical_search',
      keywords,
      count: verses.length,
      answer: formatVerseAnswer(verses, q),
      verses: verses.map(v => ({ book: v.b, chapter: v.c, verse: v.v, text: v.t })),
    });
  } catch (err) {
    console.error('bibleAiSearch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

export const config = { maxDuration: 30 };
