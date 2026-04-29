import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let KJV_CACHE = null;
let BOOK_NAMES_CACHE = null;
function getKjv() {
  if (KJV_CACHE) return KJV_CACHE;
  const raw = readFileSync(join(__dirname, '_data', 'kjv.json'), 'utf8');
  KJV_CACHE = JSON.parse(raw);
  return KJV_CACHE;
}
function getBookNames() {
  if (BOOK_NAMES_CACHE) return BOOK_NAMES_CACHE;
  const kjv = getKjv();
  const names = new Set();
  for (const v of kjv) names.add(v.b);
  BOOK_NAMES_CACHE = [...names];
  return BOOK_NAMES_CACHE;
}

// Normalize a query against known Bible book names. Handles "1 corinthians",
// "1corinthians", "song of solomon", "psalm" → "Psalms", etc.
function findBook(rawQ) {
  const norm = rawQ.toLowerCase().trim().replace(/\s+/g, ' ');
  const compact = norm.replace(/\s/g, '');
  const books = getBookNames();
  // Common aliases / singulars
  const ALIASES = {
    psalm: 'Psalms', psalms: 'Psalms',
    canticles: 'Song of Solomon', song: 'Song of Solomon', 'song of songs': 'Song of Solomon',
    apocalypse: 'Revelation', revelations: 'Revelation',
  };
  if (ALIASES[norm]) return ALIASES[norm];
  for (const b of books) {
    const bl = b.toLowerCase();
    if (bl === norm || bl.replace(/\s/g, '') === compact) return b;
  }
  return null;
}

// Parse a reference like "John 3:16" or "1 Corinthians 13:4-7"
function parseReference(q) {
  const m = q.trim().match(/^(\d?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!m) return null;
  const book = findBook(m[1]) || m[1].trim().replace(/\s+/g, ' ');
  return {
    book,
    chapter: parseInt(m[2]),
    verseStart: m[3] ? parseInt(m[3]) : null,
    verseEnd: m[4] ? parseInt(m[4]) : (m[3] ? parseInt(m[3]) : null),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { query, limit = 30 } = req.body ?? {};
    if (!query || query.trim().length === 0) return res.status(400).json({ error: 'Query is required' });

    const kjv = getKjv();
    const q = query.trim();
    const lowerQ = q.toLowerCase();

    // 1) Just a book name? → return chapter 1 of that book
    const standaloneBook = findBook(q);
    if (standaloneBook) {
      const ch1 = kjv.filter(v => v.b === standaloneBook && v.c === 1);
      if (ch1.length > 0) {
        return res.status(200).json({
          query: q,
          mode: 'book',
          book: standaloneBook,
          count: ch1.length,
          results: ch1.map(v => ({ book: v.b, chapter: v.c, verse: v.v, text: v.t })),
        });
      }
    }

    // 2) Reference lookup ("John 3:16", "1 Corinthians 13:4-7")
    const ref = parseReference(q);
    if (ref) {
      const matches = kjv.filter(v =>
        v.b.toLowerCase() === ref.book.toLowerCase() &&
        v.c === ref.chapter &&
        (!ref.verseStart || (v.v >= ref.verseStart && v.v <= ref.verseEnd))
      );
      if (matches.length > 0) {
        return res.status(200).json({
          query: q,
          mode: 'reference',
          count: matches.length,
          results: matches.map(v => ({ book: v.b, chapter: v.c, verse: v.v, text: v.t })),
        });
      }
    }

    // 3) Keyword search — case-insensitive substring match across all verses
    const results = [];
    for (const v of kjv) {
      if (v.t.toLowerCase().includes(lowerQ)) {
        results.push({ book: v.b, chapter: v.c, verse: v.v, text: v.t });
        if (results.length >= limit) break;
      }
    }

    let total = results.length;
    if (total === limit) {
      total = 0;
      for (const v of kjv) if (v.t.toLowerCase().includes(lowerQ)) total++;
    }

    return res.status(200).json({
      query: q,
      mode: 'keyword',
      count: results.length,
      total,
      results,
    });
  } catch (err) {
    console.error('searchBibleText error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

export const config = { maxDuration: 30 };
