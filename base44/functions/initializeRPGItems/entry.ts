import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (_req) => {
  try {
    const { data: existing } = await supabase.from('rpg_items').select('id').limit(1);
    if (existing && existing.length > 0) {
      const { count } = await supabase.from('rpg_items').select('*', { count: 'exact', head: true });
      return Response.json({ message: "Items already initialized", count });
    }

    const ITEMS = [
      // WEAPONS
      {
        name: "Staff of Moses",
        description: "The staff that parted the Red Sea. Wisdom flows through ancient wood.",
        type: "weapon",
        cost_coins: 150,
        rarity: "epic",
        icon: "⚡",
        wisdom_boost: 15,
        faith_boost: 8,
      },
      {
        name: "David's Sling",
        description: "The sling that felled Goliath. Faith in a simple stone.",
        type: "weapon",
        cost_coins: 100,
        rarity: "rare",
        icon: "🪨",
        faith_boost: 12,
        obedience_boost: 5,
      },
      {
        name: "Samson's Jaw",
        description: "The jawbone of an ass. Raw strength from faith's victory.",
        type: "weapon",
        cost_coins: 180,
        rarity: "epic",
        icon: "💪",
        integrity_boost: 14,
        obedience_boost: 10,
      },
      {
        name: "Excalibur of Faith",
        description: "A legendary sword forged in divine light. Balanced in all virtues.",
        type: "weapon",
        cost_coins: 250,
        rarity: "legendary",
        icon: "⚔️",
        faith_boost: 10,
        wisdom_boost: 10,
        obedience_boost: 8,
        integrity_boost: 8,
      },
      {
        name: "Holy Spear",
        description: "The spear that pierced the side of grace. Sharp and true.",
        type: "weapon",
        cost_coins: 120,
        rarity: "rare",
        icon: "🗡️",
        wisdom_boost: 10,
        integrity_boost: 8,
      },
      {
        name: "Shepherd's Rod",
        description: "Simple but powerful. A tool of guidance and protection.",
        type: "weapon",
        cost_coins: 60,
        rarity: "common",
        icon: "🏑",
        faith_boost: 5,
        obedience_boost: 4,
      },

      // ARMOR
      {
        name: "Breastplate of Righteousness",
        description: "Armor forged from integrity itself. Protects the faithful heart.",
        type: "armor",
        cost_coins: 200,
        rarity: "epic",
        icon: "🛡️",
        integrity_boost: 16,
        faith_boost: 6,
      },
      {
        name: "Shield of Faith",
        description: "Above all, take the shield of faith. Blocks all doubt.",
        type: "armor",
        cost_coins: 140,
        rarity: "rare",
        icon: "🛡️",
        faith_boost: 14,
        obedience_boost: 6,
      },
      {
        name: "Helmet of Salvation",
        description: "Worn by the saved. Clarity of purpose in every thought.",
        type: "armor",
        cost_coins: 110,
        rarity: "rare",
        icon: "⛑️",
        wisdom_boost: 12,
        faith_boost: 8,
      },
      {
        name: "Girdle of Truth",
        description: "Truth held close. Steadfast and unwavering.",
        type: "armor",
        cost_coins: 80,
        rarity: "uncommon",
        icon: "🔒",
        integrity_boost: 8,
        wisdom_boost: 6,
      },
      {
        name: "Robe of Grace",
        description: "Humble and protective. Worn by prophets and healers.",
        type: "armor",
        cost_coins: 90,
        rarity: "uncommon",
        icon: "👗",
        faith_boost: 7,
        wisdom_boost: 7,
      },

      // CONSUMABLES
      {
        name: "Widow's Oil",
        description: "Never-ending anointing oil. Restores 25% health in battle.",
        type: "consumable",
        cost_coins: 50,
        rarity: "common",
        icon: "🧴",
        consumable_effect: "heal_25",
      },
      {
        name: "Samson's Strength",
        description: "Supernatural power in a vial. +25% damage next attack.",
        type: "consumable",
        cost_coins: 75,
        rarity: "uncommon",
        icon: "💪",
        consumable_effect: "damage_boost_25",
      },
      {
        name: "Manna from Heaven",
        description: "Divine sustenance. Fully restore health during combat.",
        type: "consumable",
        cost_coins: 120,
        rarity: "rare",
        icon: "🍞",
        consumable_effect: "heal_100",
      },
      {
        name: "Holy Water",
        description: "Blessed waters. Cleanse the mind and spirit. +2 Wisdom.",
        type: "consumable",
        cost_coins: 40,
        rarity: "common",
        icon: "💧",
        consumable_effect: "wisdom_boost_2",
      },
      {
        name: "Lion's Courage",
        description: "The boldness of a young David. +25% defense next turn.",
        type: "consumable",
        cost_coins: 85,
        rarity: "uncommon",
        icon: "🦁",
        consumable_effect: "defense_boost_25",
      },
      {
        name: "Elixir of Redemption",
        description: "Second chances bottled. Undo last mistake, +15 Faith.",
        type: "consumable",
        cost_coins: 150,
        rarity: "epic",
        icon: "🔮",
        consumable_effect: "heal_50_faith_boost",
      },
    ];

    const { data: created } = await supabase.from('rpg_items').insert(ITEMS).select();
    return Response.json({ message: "Items initialized", count: created?.length ?? 0 });
  } catch (error) {
    console.error("Error initializing items:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});