import { TRIVIA_POOL } from './_data/triviaPool.js';
import { shuffle } from './_data/kjvHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { count = 10, difficulty, category, specificBook } = req.body ?? {};
    const target = Math.max(1, Math.min(50, count));

    // Apply filters as PREFERENCES — narrow pool to matching questions first
    let pool = TRIVIA_POOL;
    if (difficulty && difficulty !== 'mixed' && difficulty !== 'any') {
      const f = pool.filter(q => q.difficulty === difficulty);
      if (f.length > 0) pool = f;
    }
    if (category && category !== 'mixed' && category !== 'any' && category !== 'all') {
      const f = pool.filter(q => q.category === category);
      if (f.length > 0) pool = f;
    }
    if (specificBook && specificBook.trim()) {
      const book = specificBook.trim().toLowerCase();
      const f = pool.filter(q =>
        (q.question && q.question.toLowerCase().includes(book)) ||
        (q.explanation && q.explanation.toLowerCase().includes(book))
      );
      if (f.length > 0) pool = f;
    }

    // Pick from filtered pool. If it doesn't have enough, top up from the
    // full pool so the user always receives `count` questions.
    let picked = shuffle(pool).slice(0, target);
    if (picked.length < target) {
      const seen = new Set(picked.map(q => q.question));
      const topUp = shuffle(TRIVIA_POOL.filter(q => !seen.has(q.question))).slice(0, target - picked.length);
      picked = [...picked, ...topUp];
    }

    const questions = picked.map(q => {
      const correctAnswer = q.options[q.correct_index];
      const shuffled = shuffle([...q.options]);
      return {
        question: q.question,
        options: shuffled,
        correct_index: shuffled.indexOf(correctAnswer),
        explanation: q.explanation,
      };
    });

    return res.status(200).json({ questions, total_available: TRIVIA_POOL.length });
  } catch (err) {
    console.error('generateTriviaQuestions error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

export const config = { maxDuration: 30 };
