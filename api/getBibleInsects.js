import { INSECTS_DATABASE } from './_data/insects.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const searchQuery = req.body?.query?.toLowerCase().trim();
    if (!searchQuery) return res.status(400).json({ error: 'No query provided' });

    const result = INSECTS_DATABASE[searchQuery];
    if (result) return res.status(200).json({ found: true, ...result });
    return res.status(200).json({
      found: false,
      message: 'Insect not found. Try searching for: locust, ant, bee, fly, moth, worm, or spider.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
