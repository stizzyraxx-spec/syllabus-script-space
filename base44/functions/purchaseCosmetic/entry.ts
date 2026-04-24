import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cosmeticId } = await req.json();

    if (!cosmeticId) {
      return Response.json({ error: 'Missing cosmeticId' }, { status: 400 });
    }

    // Get cosmetic details
    const cosmetics = await base44.entities.CosmeticItem.filter({ id: cosmeticId });
    if (cosmetics.length === 0) {
      return Response.json({ error: 'Cosmetic not found' }, { status: 404 });
    }

    const cosmetic = cosmetics[0];

    // Check if already owned
    const owned = await base44.entities.PlayerCosmeticInventory.filter({
      player_email: user.email,
      cosmetic_id: cosmeticId,
    });

    if (owned.length > 0) {
      return Response.json({ error: 'Already own this item' }, { status: 400 });
    }

    // Get player coins
    const playerCoins = await base44.entities.PlayerCoins.filter({ player_email: user.email });
    if (playerCoins.length === 0 || playerCoins[0].coins < cosmetic.cost_coins) {
      return Response.json({ error: 'Insufficient coins', required: cosmetic.cost_coins }, { status: 400 });
    }

    // Deduct coins
    const newBalance = playerCoins[0].coins - cosmetic.cost_coins;
    await base44.entities.PlayerCoins.update(playerCoins[0].id, {
      coins: newBalance,
      total_spent: (playerCoins[0].total_spent || 0) + cosmetic.cost_coins,
    });

    // Add to inventory
    await base44.entities.PlayerCosmeticInventory.create({
      player_email: user.email,
      cosmetic_id: cosmeticId,
      purchased_date: new Date().toISOString(),
      is_equipped: false,
    });

    return Response.json({
      success: true,
      cosmeticName: cosmetic.name,
      coinsSpent: cosmetic.cost_coins,
      newBalance,
    });
  } catch (error) {
    console.error('Purchase cosmetic error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});