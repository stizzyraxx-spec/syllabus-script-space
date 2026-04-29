import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const BOSS_CONFIGS = [
  { boss_name: "Tempter Spirit", boss_type: "demon", max_health: 5000, xp_reward_pool: 500 },
  { boss_name: "Leviathan", boss_type: "leviathan", max_health: 8000, xp_reward_pool: 750 },
  { boss_name: "Legion of Shadows", boss_type: "legion", max_health: 6000, xp_reward_pool: 600 },
  { boss_name: "Abyss Warden", boss_type: "abyss", max_health: 10000, xp_reward_pool: 1000 },
];

Deno.serve(async (req) => {
  try {
    const { data: activeBosses } = await supabase
      .from('world_bosses')
      .select('*')
      .eq('is_active', true);

    if (activeBosses && activeBosses.length > 0) {
      const activeBoss = activeBosses[0];
      if (new Date(activeBoss.despawn_time) > new Date()) {
        return Response.json({ boss: activeBoss });
      }
      await supabase.from('world_bosses').update({
        is_active: false,
        updated_date: new Date().toISOString(),
      }).eq('id', activeBoss.id);
    }

    const bossConfig = BOSS_CONFIGS[Math.floor(Math.random() * BOSS_CONFIGS.length)];
    const spawnTime = new Date();
    const despawnTime = new Date(spawnTime.getTime() + 30 * 60 * 1000);

    const { data: newBoss } = await supabase
      .from('world_bosses')
      .insert({
        ...bossConfig,
        health: bossConfig.max_health,
        total_damage: 0,
        is_active: true,
        spawn_time: spawnTime.toISOString(),
        despawn_time: despawnTime.toISOString(),
        total_participants: 0,
      })
      .select()
      .single();

    console.log(`Spawned new World Boss: ${bossConfig.boss_name}`);
    return Response.json({ boss: newBoss });
  } catch (error) {
    console.error("Error spawning world boss:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
