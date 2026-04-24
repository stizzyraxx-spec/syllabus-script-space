import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameType, score, difficulty = 'normal' } = await req.json();

    if (!gameType || score === undefined) {
      return Response.json({ error: 'Missing gameType or score' }, { status: 400 });
    }

    // Calculate coin reward based on score and difficulty
    const baseCoinReward = Math.floor(score / 10); // 1 coin per 10 points
    const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
    const coinsAwarded = Math.max(5, Math.floor(baseCoinReward * difficultyMultiplier));

    // Get or create player coins
    let playerCoins = await base44.entities.PlayerCoins.filter({ player_email: user.email });
    
    if (playerCoins.length > 0) {
      const updated = playerCoins[0].coins + coinsAwarded;
      await base44.entities.PlayerCoins.update(playerCoins[0].id, {
        coins: updated,
      });
    } else {
      await base44.entities.PlayerCoins.create({
        player_email: user.email,
        coins: coinsAwarded,
        total_spent: 0,
        lifetime_coins_purchased: 0,
      });
    }

    return Response.json({
      success: true,
      coinsAwarded,
      gameType,
      score,
    });
  } catch (error) {
    console.error('Award game coins error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});