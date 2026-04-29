import { RPG_MISSIONS } from './_data/rpgMissions.js';
import { shuffle } from './_data/kjvHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { completedThemes = [], locationName } = req.body ?? {};

    let pool = RPG_MISSIONS;
    if (locationName && locationName !== 'any') {
      const locFiltered = pool.filter(m => m.location?.toLowerCase().includes(locationName.toLowerCase()));
      if (locFiltered.length > 0) pool = locFiltered;
    }
    let available = pool.filter(m => !completedThemes.includes(m.title));
    if (available.length === 0) available = pool;

    const mission = shuffle(available)[0];
    const shuffledDecisions = shuffle([...mission.decisions]);
    const correctIndex = shuffledDecisions.findIndex(d => d.moralAlignment === 'righteous');

    return res.status(200).json({
      title: mission.title,
      location: mission.location,
      narrative: mission.narrative,
      missionType: 'moral_choice',
      reward_xp: 25,
      decisions: shuffledDecisions,
      correctIndex,
      total_available: RPG_MISSIONS.length,
      remaining_unseen: Math.max(0, RPG_MISSIONS.length - completedThemes.length),
    });
  } catch (error) {
    console.error('generateDynamicMission error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

export const config = { maxDuration: 30 };
