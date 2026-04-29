import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { boss_id } = await req.json();

    if (!boss_id) {
      return Response.json({ error: "boss_id required" }, { status: 400 });
    }

    const { data: boss } = await supabase
      .from('world_bosses')
      .select('*')
      .eq('id', boss_id)
      .single();

    if (!boss) {
      return Response.json({ error: "Boss not found" }, { status: 404 });
    }

    const { data: damageLog } = await supabase
      .from('boss_damage_logs')
      .select('*')
      .eq('boss_id', boss_id);

    if (!damageLog || damageLog.length === 0) {
      return Response.json({ rewards: [] });
    }

    const totalDamage = damageLog.reduce((sum, log) => sum + (log.damage_dealt || 0), 0);

    const rewards = damageLog.map((log) => {
      const contributionPercent = ((log.damage_dealt || 0) / totalDamage) * 100;
      const xpEarned = Math.floor((boss.xp_reward_pool * contributionPercent) / 100);
      let rewardTier = "uncommon";
      if (contributionPercent >= 25) rewardTier = "legendary";
      else if (contributionPercent >= 15) rewardTier = "epic";
      else if (contributionPercent >= 5) rewardTier = "rare";

      return {
        player_email: log.player_email,
        contribution_percent: contributionPercent.toFixed(2),
        xp_earned: xpEarned,
        reward_tier: rewardTier,
      };
    });

    for (const log of damageLog) {
      const reward = rewards.find((r) => r.player_email === log.player_email);
      if (reward) {
        await supabase.from('boss_damage_logs').update({
          contribution_percentage: parseFloat(reward.contribution_percent),
          xp_earned: reward.xp_earned,
          reward_tier: reward.reward_tier,
          updated_date: new Date().toISOString(),
        }).eq('id', log.id);
      }
    }

    console.log(`Calculated rewards for boss ${boss_id}: ${damageLog.length} participants`);
    return Response.json({ rewards });
  } catch (error) {
    console.error("Error calculating boss rewards:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
