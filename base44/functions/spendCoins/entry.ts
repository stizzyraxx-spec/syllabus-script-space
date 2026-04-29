import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { playerEmail, coinsCost, itemType } = await req.json();

    if (!playerEmail || !coinsCost || coinsCost <= 0) {
      return Response.json({ error: "Invalid player or cost" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('player_coins')
      .select('*')
      .eq('player_email', playerEmail);

    if (!existing || existing.length === 0 || existing[0].coins < coinsCost) {
      return Response.json({ error: "Insufficient coins" }, { status: 400 });
    }

    const record = existing[0];
    const remainingCoins = record.coins - coinsCost;

    await supabase.from('player_coins').update({
      coins: remainingCoins,
      updated_date: new Date().toISOString(),
    }).eq('id', record.id);

    console.log(`${playerEmail} spent ${coinsCost} coins on ${itemType}`);
    return Response.json({ success: true, remainingCoins });
  } catch (error) {
    console.error("Spend coins error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
