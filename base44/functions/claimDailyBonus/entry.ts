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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];

    const { data: existingBonus } = await supabase
      .from('daily_bonuses')
      .select('*')
      .eq('player_email', user.email)
      .eq('bonus_date', today);

    if (existingBonus && existingBonus.length > 0) {
      return Response.json({ error: 'Already claimed today', claimed: true }, { status: 400 });
    }

    const { data: playerCoinsRows } = await supabase
      .from('player_coins')
      .select('*')
      .eq('player_email', user.email);

    const coinsBalance = playerCoinsRows?.[0] ?? { player_email: user.email, coins: 0 };

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: lastBonus } = await supabase
      .from('daily_bonuses')
      .select('*')
      .eq('player_email', user.email)
      .order('created_date', { ascending: false })
      .limit(1);

    const streakDays = lastBonus && lastBonus.length > 0 && lastBonus[0].bonus_date === yesterday
      ? (lastBonus[0].streak_days || 1) + 1
      : 1;

    const totalBonus = 50 + Math.floor(streakDays * 5);

    await supabase.from('daily_bonuses').insert({
      player_email: user.email,
      bonus_date: today,
      coins_earned: totalBonus,
      streak_days: streakDays,
      last_claim_date: today,
    });

    const newBalance = (coinsBalance.coins || 0) + totalBonus;
    if (playerCoinsRows && playerCoinsRows.length > 0) {
      await supabase.from('player_coins').update({
        coins: newBalance,
        updated_date: new Date().toISOString(),
      }).eq('id', playerCoinsRows[0].id);
    } else {
      await supabase.from('player_coins').insert({
        player_email: user.email,
        coins: newBalance,
        total_spent: 0,
        lifetime_coins_purchased: 0,
      });
    }

    return Response.json({ success: true, coinsEarned: totalBonus, streakDays, newBalance });
  } catch (error) {
    console.error('Daily bonus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
