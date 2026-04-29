import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { userEmail, actionType, pointsAmount = 1 } = await req.json();

    if (!userEmail || !actionType) {
      return Response.json({ error: 'Missing userEmail or actionType' }, { status: 400 });
    }

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_email', userEmail);

    let profile;
    if (!profiles || profiles.length === 0) {
      const { data: created } = await supabase
        .from('user_profiles')
        .insert({ user_email: userEmail, total_points: pointsAmount })
        .select()
        .single();
      profile = created;
    } else {
      profile = profiles[0];
      const newTotal = (profile.total_points || 0) + pointsAmount;

      const previousCoins = Math.floor((profile.total_points || 0) / 20);
      const newCoins = Math.floor(newTotal / 20);
      const coinsEarned = newCoins - previousCoins;

      await supabase.from('user_profiles').update({
        total_points: newTotal,
        updated_date: new Date().toISOString(),
      }).eq('id', profile.id);

      if (coinsEarned > 0) {
        const { data: playerCoins } = await supabase
          .from('player_coins')
          .select('*')
          .eq('player_email', userEmail);

        if (!playerCoins || playerCoins.length === 0) {
          await supabase.from('player_coins').insert({
            player_email: userEmail,
            coins: coinsEarned,
            lifetime_coins_purchased: 0,
            total_spent: 0,
          });
        } else {
          await supabase.from('player_coins').update({
            coins: (playerCoins[0].coins || 0) + coinsEarned,
            updated_date: new Date().toISOString(),
          }).eq('id', playerCoins[0].id);
        }
      }

      profile = { ...profile, total_points: newTotal };
    }

    return Response.json({
      success: true,
      totalPoints: profile.total_points,
      coinsEarned: Math.floor(profile.total_points / 20),
      actionType,
    });
  } catch (error) {
    console.error('Award points error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
