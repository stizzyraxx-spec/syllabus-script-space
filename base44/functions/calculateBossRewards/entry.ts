import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { boss_id } = await req.json();

    if (!boss_id) {
      return Response.json({ error: "boss_id required" }, { status: 400 });
    }

    const boss = await base44.asServiceRole.entities.WorldBoss.get("WorldBoss", boss_id);
    if (!boss) {
      return Response.json({ error: "Boss not found" }, { status: 404 });
    }

    // Fetch all damage logs for this boss
    const damageLog = await base44.asServiceRole.entities.BossDamageLog.filter({
      boss_id: boss_id,
    });

    if (damageLog.length === 0) {
      return Response.json({ rewards: [] });
    }

    // Calculate contribution percentages and rewards
    const totalDamage = damageLog.reduce((sum, log) => sum + (log.damage_dealt || 0), 0);

    const rewards = damageLog.map((log) => {
      const contributionPercent = ((log.damage_dealt || 0) / totalDamage) * 100;
      const xpEarned = Math.floor((boss.xp_reward_pool * contributionPercent) / 100);

      // Determine reward tier
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

    // Update damage logs with XP and tier info
    for (const log of damageLog) {
      const reward = rewards.find((r) => r.player_email === log.player_email);
      if (reward) {
        await base44.asServiceRole.entities.BossDamageLog.update(log.id, {
          contribution_percentage: parseFloat(reward.contribution_percent),
          xp_earned: reward.xp_earned,
          reward_tier: reward.reward_tier,
        });
      }
    }

    console.log(`Calculated rewards for boss ${boss_id}: ${damageLog.length} participants`);

    return Response.json({ rewards });
  } catch (error) {
    console.error("Error calculating boss rewards:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});