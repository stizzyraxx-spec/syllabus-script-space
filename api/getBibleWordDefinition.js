export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { word } = req.body ?? {};
    if (!word || word.trim().length === 0) return res.status(400).json({ error: 'Word is required' });
    return res.status(200).json({
      definition: `Word definition for "${word}" is currently unavailable. For Hebrew and Greek word studies, visit BlueLetterBible.org — enter the verse, click on the word, and access Strong's Concordance entries with original language definitions.`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
