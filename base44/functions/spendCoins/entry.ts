import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { playerEmail, coinsCost, itemType } = await req.json();

    if (!playerEmail || !coinsCost || coinsCost <= 0) {
      return Response.json({ error: "Invalid player or cost" }, { status: 400 });
    }

    // Get player coins
    const existing = await base44.entities.PlayerCoins.filter({
      player_email: playerEmail,
    });

    if (existing.length === 0 || existing[0].coins < coinsCost) {
      return Response.json({ error: "Insufficient coins" }, { status: 400 });
    }

    const playerCoins = existing[0];
    await base44.entities.PlayerCoins.update(playerCoins.id, {
      coins: playerCoins.coins - coinsCost,
    });

    console.log(`${playerEmail} spent ${coinsCost} coins on ${itemType}`);

    return Response.json({ success: true, remainingCoins: playerCoins.coins - coinsCost });
  } catch (error) {
    console.error("Spend coins error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});