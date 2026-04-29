// Real Bible commentary built from the bundled KJV + book intros.
// Combines: book setting (author/audience/purpose), the surrounding verses
// for context, the verse itself, and cross-references — verses elsewhere
// in Scripture that share key words with this one.
import { getKjv } from './_data/kjvHelpers.js';
import { BOOK_INTROS } from './_data/bookIntros.js';

const STOP = new Set([
  'the','and','of','a','an','in','to','for','is','was','were','are','be','been','that','this','they','them','their','his','her','him','it','its','as','at','by','on','from','with','but','or','not','no','so','if','then','have','has','had','will','shall','do','did','done','say','said','says','one','all','any','our','out','up','down','into','unto','upon','also','therefore','wherefore','because','also','again','now','let','ye','thou','thee','thy','thine','him','his','my','me','i','us','o'
]);

function tokens(text) {
  return text.toLowerCase()
    .replace(/[^a-z']+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP.has(w));
}

function findCrossReferences(kjv, sourceVerse, max = 4) {
  const sourceKey = `${sourceVerse.b}-${sourceVerse.c}-${sourceVerse.v}`;
  const sourceTokens = tokens(sourceVerse.t);
  if (sourceTokens.length === 0) return [];

  // Score every other verse by shared distinctive words (length >= 5 weighted 2x)
  const scores = [];
  for (const v of kjv) {
    if (`${v.b}-${v.c}-${v.v}` === sourceKey) continue;
    const txt = v.t.toLowerCase();
    let score = 0;
    for (const t of sourceTokens) {
      if (txt.includes(t)) score += t.length >= 5 ? 2 : 1;
    }
    if (score >= 4) scores.push({ v, score });
  }
  scores.sort((a, b) => b.score - a.score || a.v.t.length - b.v.t.length);
  // Spread across different books for diversity
  const seenBooks = new Set();
  const out = [];
  for (const s of scores) {
    if (seenBooks.has(s.v.b)) continue;
    seenBooks.add(s.v.b);
    out.push(s.v);
    if (out.length >= max) break;
  }
  return out;
}

function getContext(kjv, book, chapter, verse, before = 2, after = 2) {
  const ctx = [];
  for (const v of kjv) {
    if (v.b !== book || v.c !== chapter) continue;
    if (v.v >= verse - before && v.v <= verse + after) ctx.push(v);
  }
  return ctx.sort((a, b) => a.v - b.v);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { book, chapter, verse, text } = req.body ?? {};
    if (!book || !chapter || !verse) {
      return res.status(400).json({ error: 'book, chapter, and verse are required' });
    }

    const kjv = getKjv();
    const target = kjv.find(v => v.b === book && v.c === chapter && v.v === verse);
    if (!target) {
      return res.status(200).json({
        commentary: `Could not locate ${book} ${chapter}:${verse} in the King James text.`,
      });
    }

    const intro = BOOK_INTROS[book];
    const ctx = getContext(kjv, book, chapter, verse, 2, 2);
    const xrefs = findCrossReferences(kjv, target, 4);

    const lines = [];

    // 1) Book setting (if we have an intro for it)
    if (intro) {
      lines.push(`**Setting — ${book}.** Written by ${intro.author}, ${intro.date}. Audience: ${intro.audience}`);
      lines.push('');
    }

    // 2) Surrounding context
    if (ctx.length > 1) {
      lines.push(`**Immediate context (${book} ${chapter}:${ctx[0].v}-${ctx[ctx.length - 1].v}):**`);
      for (const v of ctx) {
        const isTarget = v.v === verse;
        lines.push(`${isTarget ? '→ ' : '   '}**${v.v}.** ${v.t}`);
      }
      lines.push('');
    }

    // 3) Brief observation drawn from the verse itself
    const targetTokens = tokens(target.t);
    if (targetTokens.length > 0) {
      const distinctive = [...new Set(targetTokens.filter(t => t.length >= 5))].slice(0, 3);
      if (distinctive.length > 0) {
        lines.push(`**Key terms.** Notice the words "${distinctive.join('", "')}" — these carry the weight of the verse and tie it to the wider biblical witness below.`);
        lines.push('');
      }
    }

    // 4) Cross references
    if (xrefs.length > 0) {
      lines.push(`**Cross references — verses elsewhere in Scripture that echo this one:**`);
      for (const v of xrefs) {
        lines.push(`• **${v.b} ${v.c}:${v.v}** — ${v.t}`);
      }
      lines.push('');
    }

    // 5) Closing pointer
    lines.push(
      `**For deeper study.** Compare this verse in Matthew Henry, John Gill, or the John Calvin commentaries (free at biblegateway.com or ccel.org). Look up the original Hebrew/Greek words at blueletterbible.org — sometimes a single word in the underlying language opens up the entire verse.`
    );

    return res.status(200).json({
      commentary: lines.join('\n'),
      book,
      chapter,
      verse,
      sourceText: target.t,
      crossReferences: xrefs.map(v => ({ book: v.b, chapter: v.c, verse: v.v, text: v.t })),
    });
  } catch (err) {
    console.error('getBibleCommentary error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

export const config = { maxDuration: 30 };
