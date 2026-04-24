import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BOSS_CONFIGS = [
  {
    boss_name: "Tempter Spirit",
    boss_type: "demon",
    max_health: 5000,
    xp_reward_pool: 500,
  },
  {
    boss_name: "Leviathan",
    boss_type: "leviathan",
    max_health: 8000,
    xp_reward_pool: 750,
  },
  {
    boss_name: "Legion of Shadows",
    boss_type: "legion",
    max_health: 6000,
    xp_reward_pool: 600,
  },
  {
    boss_name: "Abyss Warden",
    boss_type: "abyss",
    max_health: 10000,
    xp_reward_pool: 1000,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check if there's already an active boss
    const activeBosses = await base44.asServiceRole.entities.WorldBoss.filter({
      is_active: true,
    });

    if (activeBosses.length > 0) {
      const activeBoss = activeBosses[0];
      const despawnTime = new Date(activeBoss.despawn_time);
      
      // If boss time hasn't expired, return it
      if (despawnTime > new Date()) {
        return Response.json({ boss: activeBoss });
      } else {
        // Boss time expired, deactivate it
        await base44.asServiceRole.entities.WorldBoss.update(activeBoss.id, {
          is_active: false,
        });
      }
    }

    // Spawn a new random boss
    const bossConfig = BOSS_CONFIGS[Math.floor(Math.random() * BOSS_CONFIGS.length)];
    const spawnTime = new Date();
    const despawnTime = new Date(spawnTime.getTime() + 30 * 60 * 1000); // 30 minutes

    const newBoss = await base44.asServiceRole.entities.WorldBoss.create({
      ...bossConfig,
      health: bossConfig.max_health,
      total_damage: 0,
      is_active: true,
      spawn_time: spawnTime.toISOString(),
      despawn_time: despawnTime.toISOString(),
      total_participants: 0,
    });

    console.log(`Spawned new World Boss: ${bossConfig.boss_name}`);

    return Response.json({ boss: newBoss });
  } catch (error) {
    console.error("Error spawning world boss:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});