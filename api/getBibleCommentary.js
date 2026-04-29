export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { book, chapter, verse, text } = req.body ?? {};
    if (!text) return res.status(400).json({ error: 'Verse text is required' });
    return res.status(200).json({
      commentary: `Commentary for ${book} ${chapter}:${verse} is currently unavailable. For in-depth study, visit BibleGateway.com or BlueLetterBible.org for free commentaries from Matthew Henry, John Calvin, and other trusted scholars.`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
