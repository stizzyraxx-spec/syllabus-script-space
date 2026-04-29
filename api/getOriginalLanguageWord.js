import { ORIGINAL_LANGUAGE_DICTIONARY } from './_data/originalLanguage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const searchWord = req.body?.word?.toLowerCase().trim();
    if (!searchWord) return res.status(400).json({ error: 'No word provided' });

    const results = ORIGINAL_LANGUAGE_DICTIONARY[searchWord];
    if (results) {
      return res.status(200).json({
        found: true,
        englishWord: searchWord.charAt(0).toUpperCase() + searchWord.slice(1),
        languages: results,
      });
    }
    return res.status(200).json({
      found: false,
      englishWord: searchWord,
      message: 'Word not found in database. Try another word.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
