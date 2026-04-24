import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if cosmetics already exist
    const existing = await base44.asServiceRole.entities.CosmeticItem.list();
    if (existing.length > 0) {
      return Response.json({ message: 'Cosmetics already initialized', count: existing.length });
    }

    // Create all initial cosmetics
    const created = [];
    for (const cosmetic of INITIAL_COSMETICS) {
      const result = await base44.asServiceRole.entities.CosmeticItem.create(cosmetic);
      created.push(result);
    }

    return Response.json({ success: true, created: created.length });
  } catch (error) {
    console.error('Initialize cosmetics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});