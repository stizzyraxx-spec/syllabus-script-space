import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if already claimed today
    const existingBonus = await base44.entities.DailyBonus.filter({
      player_email: user.email,
      bonus_date: today,
    });

    if (existingBonus.length > 0) {
      return Response.json({ error: 'Already claimed today', claimed: true }, { status: 400 });
    }

    // Get player's coin balance
    let playerCoins = await base44.entities.PlayerCoins.filter({ player_email: user.email });
    let coinsBalance = playerCoins[0] || { player_email: user.email, coins: 0 };

    // Get last bonus to calculate streak
    const lastBonus = await base44.entities.DailyBonus.filter(
      { player_email: user.email },
      '-created_date',
      1
    );

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const streakDays = lastBonus.length > 0 && lastBonus[0].bonus_date === yesterday 
      ? (lastBonus[0].streak_days || 1) + 1 
      : 1;

    // Calculate bonus (base 50 + streak bonus)
    const baseCoins = 50;
    const streakBonus = Math.floor(streakDays * 5);
    const totalBonus = baseCoins + streakBonus;

    // Create daily bonus record
    await base44.entities.DailyBonus.create({
      player_email: user.email,
      bonus_date: today,
      coins_earned: totalBonus,
      streak_days: streakDays,
      last_claim_date: today,
    });

    // Update or create coin balance
    const newBalance = coinsBalance.coins + totalBonus;
    if (playerCoins.length > 0) {
      await base44.entities.PlayerCoins.update(playerCoins[0].id, {
        coins: newBalance,
      });
    } else {
      await base44.entities.PlayerCoins.create({
        player_email: user.email,
        coins: newBalance,
        total_spent: 0,
        lifetime_coins_purchased: 0,
      });
    }

    return Response.json({
      success: true,
      coinsEarned: totalBonus,
      streakDays,
      newBalance,
    });
  } catch (error) {
    console.error('Daily bonus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});