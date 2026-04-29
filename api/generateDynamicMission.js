import { RPG_MISSIONS } from './_data/rpgMissions.js';
import { shuffle } from './_data/kjvHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { completedThemes = [], locationName } = req.body ?? {};
    const completedSet = new Set(completedThemes);

    // Strategy:
    // 1) Try to find an UNUSED mission at the requested location
    // 2) If none → any UNUSED mission anywhere
    // 3) If everything has been used → fall back to any mission (least-recently-seen would
    //    require server state; in practice 30 missions × 3 trials means recycling rarely
    //    happens within a single session)

    // Always pick from the GLOBAL pool of unused missions — never repeat
    // until the entire 30-mission pool has been seen. The location filter is
    // intentionally dropped because most locations have only 1 mission, which
    // would force a repeat on trial 2 of the same location.
    let candidates = RPG_MISSIONS.filter(m => !completedSet.has(m.title));
    if (candidates.length === 0) {
      // Player has seen everything — start over with the full pool
      candidates = RPG_MISSIONS;
    }

    const mission = shuffle(candidates)[0];
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
      remaining_unseen: Math.max(0, RPG_MISSIONS.length - completedSet.size),
    });
  } catch (error) {
    console.error('generateDynamicMission error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

export const config = { maxDuration: 30 };
