import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { playerEmail, coins, amountUSD, stripeSessionId } = await req.json();

    if (!playerEmail || !coins || coins <= 0) {
      return Response.json({ error: "Invalid player or coins" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('player_coins')
      .select('*')
      .eq('player_email', playerEmail);

    let totalCoins;
    if (existing && existing.length > 0) {
      const record = existing[0];
      totalCoins = (record.coins || 0) + coins;
      await supabase.from('player_coins').update({
        coins: totalCoins,
        total_spent: (record.total_spent || 0) + (amountUSD || 0),
        lifetime_coins_purchased: (record.lifetime_coins_purchased || 0) + coins,
        updated_date: new Date().toISOString(),
      }).eq('id', record.id);
    } else {
      totalCoins = coins;
      await supabase.from('player_coins').insert({
        player_email: playerEmail,
        coins,
        total_spent: amountUSD || 0,
        lifetime_coins_purchased: coins,
      });
    }

    if (stripeSessionId) {
      await supabase.from('coin_purchases').insert({
        player_email: playerEmail,
        stripe_session_id: stripeSessionId,
        coins_purchased: coins,
        amount_usd: amountUSD,
        status: "completed",
      });
    }

    console.log(`Added ${coins} coins to ${playerEmail}`);
    return Response.json({ success: true, totalCoins });
  } catch (error) {
    console.error("Add coins error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
