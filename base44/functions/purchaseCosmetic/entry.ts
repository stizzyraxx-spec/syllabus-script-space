import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cosmeticId } = await req.json();
    if (!cosmeticId) {
      return Response.json({ error: 'Missing cosmeticId' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: cosmetics } = await supabase
      .from('cosmetic_items')
      .select('*')
      .eq('id', cosmeticId);

    if (!cosmetics || cosmetics.length === 0) {
      return Response.json({ error: 'Cosmetic not found' }, { status: 404 });
    }
    const cosmetic = cosmetics[0];

    const { data: owned } = await supabase
      .from('player_cosmetic_inventory')
      .select('*')
      .eq('player_email', user.email)
      .eq('cosmetic_id', cosmeticId);

    if (owned && owned.length > 0) {
      return Response.json({ error: 'Already own this item' }, { status: 400 });
    }

    const { data: playerCoins } = await supabase
      .from('player_coins')
      .select('*')
      .eq('player_email', user.email);

    if (!playerCoins || playerCoins.length === 0 || playerCoins[0].coins < cosmetic.cost_coins) {
      return Response.json({ error: 'Insufficient coins', required: cosmetic.cost_coins }, { status: 400 });
    }

    const newBalance = playerCoins[0].coins - cosmetic.cost_coins;
    await supabase.from('player_coins').update({
      coins: newBalance,
      total_spent: (playerCoins[0].total_spent || 0) + cosmetic.cost_coins,
      updated_date: new Date().toISOString(),
    }).eq('id', playerCoins[0].id);

    await supabase.from('player_cosmetic_inventory').insert({
      player_email: user.email,
      cosmetic_id: cosmeticId,
      purchased_date: new Date().toISOString(),
      is_equipped: false,
    });

    return Response.json({ success: true, cosmeticName: cosmetic.name, coinsSpent: cosmetic.cost_coins, newBalance });
  } catch (error) {
    console.error('Purchase cosmetic error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
