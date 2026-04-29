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

    const { gameType, score, difficulty = 'normal' } = await req.json();

    if (!gameType || score === undefined) {
      return Response.json({ error: 'Missing gameType or score' }, { status: 400 });
    }

    const baseCoinReward = Math.floor(score / 10);
    const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
    const coinsAwarded = Math.max(5, Math.floor(baseCoinReward * difficultyMultiplier));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: playerCoins } = await supabase
      .from('player_coins')
      .select('*')
      .eq('player_email', user.email);

    if (playerCoins && playerCoins.length > 0) {
      await supabase.from('player_coins').update({
        coins: playerCoins[0].coins + coinsAwarded,
        updated_date: new Date().toISOString(),
      }).eq('id', playerCoins[0].id);
    } else {
      await supabase.from('player_coins').insert({
        player_email: user.email,
        coins: coinsAwarded,
        total_spent: 0,
        lifetime_coins_purchased: 0,
      });
    }

    return Response.json({ success: true, coinsAwarded, gameType, score });
  } catch (error) {
    console.error('Award game coins error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
