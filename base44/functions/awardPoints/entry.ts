import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { userEmail, actionType, pointsAmount = 1 } = body;
    
    if (!userEmail || !actionType) {
      return Response.json({ error: 'Missing userEmail or actionType' }, { status: 400 });
    }

    // Fetch user profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: userEmail });
    
    let profile;
    if (profiles.length === 0) {
      // Create new profile
      profile = await base44.asServiceRole.entities.UserProfile.create({
        user_email: userEmail,
        total_points: pointsAmount,
      });
    } else {
      // Update existing profile
      profile = profiles[0];
      const newTotal = (profile.total_points || 0) + pointsAmount;
      
      // Calculate coins earned (20 points = 1 coin)
      const previousCoins = Math.floor((profile.total_points || 0) / 20);
      const newCoins = Math.floor(newTotal / 20);
      const coinsEarned = newCoins - previousCoins;
      
      // Update profile with new points
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        total_points: newTotal,
      });
      
      // If coins were earned, update PlayerCoins
      if (coinsEarned > 0) {
        const playerCoins = await base44.asServiceRole.entities.PlayerCoins.filter({ player_email: userEmail });
        
        if (playerCoins.length === 0) {
          await base44.asServiceRole.entities.PlayerCoins.create({
            player_email: userEmail,
            coins: coinsEarned,
            lifetime_coins_purchased: 0,
            total_spent: 0,
          });
        } else {
          const currentCoins = playerCoins[0];
          await base44.asServiceRole.entities.PlayerCoins.update(currentCoins.id, {
            coins: (currentCoins.coins || 0) + coinsEarned,
          });
        }
      }
      
      profile = { ...profile, total_points: newTotal };
    }

    return Response.json({ 
      success: true, 
      totalPoints: profile.total_points,
      coinsEarned: Math.floor(profile.total_points / 20),
      actionType,
    });
  } catch (error) {
    console.error('Award points error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});