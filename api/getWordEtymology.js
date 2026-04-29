import { ETYMOLOGY_DATABASE } from './_data/etymology.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const searchWord = req.body?.word?.toLowerCase().trim();
    if (!searchWord) return res.status(400).json({ error: 'No word provided' });

    const result = ETYMOLOGY_DATABASE[searchWord];
    if (result) return res.status(200).json({ found: true, ...result });
    return res.status(200).json({
      found: false,
      word: searchWord,
      message: 'Etymology data not found for this word.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
