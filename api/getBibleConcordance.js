import { BIBLE_CONCORDANCE } from './_data/concordance.js';

function extractContext(text, word, contextLength = 40) {
  const lowerText = text.toLowerCase();
  const lowerWord = word.toLowerCase();
  const index = lowerText.indexOf(lowerWord);
  if (index === -1) return { before: '', word, after: '' };
  const before = text.substring(Math.max(0, index - contextLength), index).trim();
  const after = text.substring(index + word.length, Math.min(text.length, index + word.length + contextLength)).trim();
  const foundWord = text.substring(index, index + word.length);
  return { before, word: foundWord, after };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const searchWord = req.body?.word?.toLowerCase().trim();
    if (!searchWord) return res.status(400).json({ error: 'No word provided' });

    const concordanceData = BIBLE_CONCORDANCE[searchWord] || [];
    const occurrences = concordanceData.map(o => {
      const ctx = extractContext(o.text, searchWord);
      return {
        book: o.book, chapter: o.chapter, verse: o.verse,
        word: ctx.word, beforeContext: ctx.before, afterContext: ctx.after,
        fullText: o.text,
      };
    });

    return res.status(200).json({ word: searchWord, occurrences, count: occurrences.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
