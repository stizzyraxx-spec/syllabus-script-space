import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { playerEmail } = await req.json();

    if (!playerEmail) {
      return Response.json({ error: "No player email provided" }, { status: 400 });
    }

    const existing = await base44.entities.PlayerCoins.filter({
      player_email: playerEmail,
    });

    if (existing.length === 0) {
      return Response.json({ coins: 0, lifetimePurchased: 0 });
    }

    return Response.json({
      coins: existing[0].coins || 0,
      lifetimePurchased: existing[0].lifetime_coins_purchased || 0,
    });
  } catch (error) {
    console.error("Get coins error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});