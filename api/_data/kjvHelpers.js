import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let KJV_CACHE = null;
export function getKjv() {
  if (KJV_CACHE) return KJV_CACHE;
  const raw = readFileSync(join(__dirname, 'kjv.json'), 'utf8');
  KJV_CACHE = JSON.parse(raw);
  return KJV_CACHE;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick a verse split point at a natural boundary (comma, semicolon, "and", "but", "for")
function findSplitIndex(text) {
  // Prefer punctuation around the middle of the verse
  const mid = Math.floor(text.length / 2);
  const candidates = [];
  const re = /[,;:]\s+|\s+(?:and|but|for|that|which|because|therefore|wherefore)\s+/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    candidates.push({ idx: m.index + m[0].length, dist: Math.abs(m.index - mid) });
  }
  if (candidates.length === 0) {
    // Fallback: split on first space past the midpoint
    const after = text.indexOf(' ', mid);
    return after === -1 ? Math.min(mid, text.length - 1) : after + 1;
  }
  candidates.sort((a, b) => a.dist - b.dist);
  return candidates[0].idx;
}

// Generate a Finish-the-Verse question from a random KJV verse + 3 random-verse distractors
export function generateFinishFromKjv(opts = {}) {
  const kjv = getKjv();
  // Filter to verses long enough to split meaningfully
  const pool = kjv.filter(v => v.t.length >= 80 && v.t.length <= 280);
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const splitAt = findSplitIndex(picked.t);
  const verse_start = picked.t.slice(0, splitAt).trim();
  const correct_ending = picked.t.slice(splitAt).trim();

  // Pick 3 distractors: other random verse endings of similar length
  const distractors = [];
  const used = new Set([`${picked.b}-${picked.c}-${picked.v}`]);
  while (distractors.length < 3) {
    const cand = pool[Math.floor(Math.random() * pool.length)];
    const key = `${cand.b}-${cand.c}-${cand.v}`;
    if (used.has(key)) continue;
    used.add(key);
    const candSplit = findSplitIndex(cand.t);
    const candEnding = cand.t.slice(candSplit).trim();
    if (candEnding.length < 30) continue;
    distractors.push(candEnding);
  }

  return {
    reference: `${picked.b} ${picked.c}:${picked.v} KJV`,
    verse_start,
    correct_ending,
    distractors,
    context: `From the book of ${picked.b}.`,
  };
}

// Generate a Memorization prompt from a random KJV verse
export function generateMemorizationFromKjv() {
  const kjv = getKjv();
  const pool = kjv.filter(v => v.t.length >= 70 && v.t.length <= 260);
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const splitAt = findSplitIndex(picked.t);
  const prompt = picked.t.slice(0, splitAt).trim();
  const answer = picked.t.slice(splitAt).trim();
  return {
    reference: `${picked.b} ${picked.c}:${picked.v}`,
    prompt,
    answer,
    hint: `From ${picked.b} ${picked.c}`,
    context: `A verse from ${picked.b}, chapter ${picked.c}.`,
  };
}
