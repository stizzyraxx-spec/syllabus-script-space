import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let KJV_CACHE = null;
function getKjv() {
  if (KJV_CACHE) return KJV_CACHE;
  const raw = readFileSync(join(__dirname, '_data', 'kjv.json'), 'utf8');
  KJV_CACHE = JSON.parse(raw);
  return KJV_CACHE;
}

// Parse a reference like "John 3:16" or "1 Corinthians 13:4-7" into structured form
function parseReference(q) {
  const m = q.trim().match(/^(\d?\s?[A-Za-z]+(?:\s[A-Za-z]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!m) return null;
  return {
    book: m[1].trim().replace(/\s+/g, ' '),
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

    // 1) Try exact reference lookup first ("John 3:16")
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

    // 2) Keyword search — case-insensitive substring match across all verses
    const results = [];
    for (const v of kjv) {
      if (v.t.toLowerCase().includes(lowerQ)) {
        results.push({ book: v.b, chapter: v.c, verse: v.v, text: v.t });
        if (results.length >= limit) break;
      }
    }

    // Total count (continue scanning past limit just to report it)
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
