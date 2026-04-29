export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { query } = req.body ?? {};
    if (!query || query.trim().length === 0) return res.status(400).json({ error: 'Query is required' });
    return res.status(200).json({
      results: `Bible search for "${query}" is currently unavailable. Please visit BibleGateway.com or BlueLetterBible.org to search for verses.`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
