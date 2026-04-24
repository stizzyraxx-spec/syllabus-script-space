import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { playerEmail, coins, amountUSD, stripeSessionId } = await req.json();

    if (!playerEmail || !coins || coins <= 0) {
      return Response.json({ error: "Invalid player or coins" }, { status: 400 });
    }

    // Get or create player coins record
    const existing = await base44.entities.PlayerCoins.filter({
      player_email: playerEmail,
    });

    let playerCoins;
    if (existing.length > 0) {
      playerCoins = existing[0];
      await base44.entities.PlayerCoins.update(playerCoins.id, {
        coins: (playerCoins.coins || 0) + coins,
        total_spent: (playerCoins.total_spent || 0) + amountUSD,
        lifetime_coins_purchased: (playerCoins.lifetime_coins_purchased || 0) + coins,
      });
    } else {
      playerCoins = await base44.entities.PlayerCoins.create({
        player_email: playerEmail,
        coins: coins,
        total_spent: amountUSD,
        lifetime_coins_purchased: coins,
      });
    }

    // Record the purchase
    if (stripeSessionId) {
      await base44.entities.CoinPurchase.create({
        player_email: playerEmail,
        stripe_session_id: stripeSessionId,
        coins_purchased: coins,
        amount_usd: amountUSD,
        status: "completed",
      });
    }

    console.log(`Added ${coins} coins to ${playerEmail}`);

    return Response.json({ success: true, totalCoins: playerCoins.coins });
  } catch (error) {
    console.error("Add coins error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});