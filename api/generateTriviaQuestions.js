import { TRIVIA_POOL } from './_data/triviaPool.js';
import { shuffle } from './_data/kjvHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { count = 10, difficulty, category } = req.body ?? {};
    const target = Math.max(1, Math.min(50, count));

    let pool = TRIVIA_POOL;
    if (difficulty && difficulty !== 'mixed') pool = pool.filter(q => q.difficulty === difficulty);
    if (category && category !== 'mixed' && category !== 'all') pool = pool.filter(q => q.category === category);
    if (pool.length === 0) pool = TRIVIA_POOL;

    const picked = shuffle(pool).slice(0, Math.min(target, pool.length));
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
