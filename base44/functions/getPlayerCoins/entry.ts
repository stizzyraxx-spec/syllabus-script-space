import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { playerEmail } = await req.json();

    if (!playerEmail) {
      return Response.json({ error: "No player email provided" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('player_coins')
      .select('*')
      .eq('player_email', playerEmail);

    if (!existing || existing.length === 0) {
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
