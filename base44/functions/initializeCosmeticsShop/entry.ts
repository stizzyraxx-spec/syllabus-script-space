import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const INITIAL_COSMETICS = [
  {
    name: "Gold Frame",
    description: "Elegant gold profile frame",
    category: "avatar_frame",
    cost_coins: 100,
    icon_emoji: "🌟",
    rarity: "uncommon",
  },
  {
    name: "Crystal Frame",
    description: "Shimmering crystal border",
    category: "avatar_frame",
    cost_coins: 250,
    icon_emoji: "💎",
    rarity: "rare",
  },
  {
    name: "Holy Glow",
    description: "Divine light effect",
    category: "particle_effect",
    cost_coins: 150,
    icon_emoji: "✨",
    rarity: "uncommon",
  },
  {
    name: "Flame Aura",
    description: "Fiery particle effect",
    category: "particle_effect",
    cost_coins: 200,
    icon_emoji: "🔥",
    rarity: "rare",
  },
  {
    name: "Dark Theme",
    description: "Sleek dark profile theme",
    category: "profile_theme",
    cost_coins: 75,
    icon_emoji: "🌙",
    rarity: "common",
  },
  {
    name: "Heavenly Theme",
    description: "Light angelic theme",
    category: "profile_theme",
    cost_coins: 100,
    icon_emoji: "☁️",
    rarity: "uncommon",
  },
  {
    name: "Sage Appearance",
    description: "Wise character skin",
    category: "character_skin",
    cost_coins: 300,
    icon_emoji: "🧙",
    rarity: "epic",
  },
  {
    name: "Warrior Appearance",
    description: "Battle-hardened look",
    category: "character_skin",
    cost_coins: 350,
    icon_emoji: "⚔️",
    rarity: "epic",
  },
  {
    name: "Holy Sword",
    description: "Sacred weapon appearance",
    category: "weapon_skin",
    cost_coins: 200,
    icon_emoji: "⚡",
    rarity: "rare",
  },
  {
    name: "Celestial Blade",
    description: "Divine legendary weapon",
    category: "weapon_skin",
    cost_coins: 500,
    icon_emoji: "🌠",
    rarity: "legendary",
  },
];

Deno.serve(async (_req) => {
  try {
    const { data: existing } = await supabase.from('cosmetic_items').select('id').limit(1);
    if (existing && existing.length > 0) {
      const { count } = await supabase.from('cosmetic_items').select('*', { count: 'exact', head: true });
      return Response.json({ message: 'Cosmetics already initialized', count });
    }

    const { data: created } = await supabase
      .from('cosmetic_items')
      .insert(INITIAL_COSMETICS)
      .select();

    return Response.json({ success: true, created: created?.length ?? 0 });
  } catch (error) {
    console.error('Initialize cosmetics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});