import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Map Base44 PascalCase entity names to Supabase snake_case table names
const TABLE_MAP = {
  Achievement: 'achievements',
  ActivePlayer: 'active_players',
  BibleFavorite: 'bible_favorites',
  BibleHighlight: 'bible_highlights',
  BibleJournal: 'bible_journals',
  BiblePlan: 'bible_plans',
  BossDamageLog: 'boss_damage_logs',
  CoinPurchase: 'coin_purchases',
  CommunityPost: 'community_posts',
  CosmeticItem: 'cosmetic_items',
  DailyBonus: 'daily_bonuses',
  DirectMessage: 'direct_messages',
  ForumPost: 'forum_posts',
  ForumReply: 'forum_replies',
  GameProgress: 'game_progress',
  GameScore: 'game_scores',
  GroupChatMessage: 'group_chat_messages',
  Item: 'items',
  LiveComment: 'live_comments',
  LiveStream: 'live_streams',
  NotebookEntry: 'notebook_entries',
  Notification: 'notifications',
  PlanReflection: 'plan_reflections',
  PlayerAchievement: 'player_achievements',
  PlayerCoins: 'player_coins',
  PlayerCosmeticInventory: 'player_cosmetic_inventory',
  PlayerInventory: 'player_inventory',
  PlayerMessage: 'player_messages',
  PlayerSkill: 'player_skills',
  PlayerSkillTree: 'player_skill_trees',
  PostComment: 'post_comments',
  PrayerJournal: 'prayer_journals',
  PrayerRequest: 'prayer_requests',
  RPGItem: 'rpg_items',
  RPGLeaderboard: 'rpg_leaderboard',
  RPGMissionDecision: 'rpg_mission_decisions',
  RPGPlayerProgress: 'rpg_player_progress',
  ReflectionComment: 'reflection_comments',
  ReportedContent: 'reported_content',
  SiteContent: 'site_content',
  Trade: 'trades',
  User: 'users',
  UserPlanEnrollment: 'user_plan_enrollments',
  UserProfile: 'user_profiles',
  WorldBoss: 'world_bosses',
};

// Parse Base44-style sort string: "-created_date" → { column: 'created_date', ascending: false }
function parseSort(sort) {
  if (!sort) return null;
  const desc = sort.startsWith('-');
  const column = desc ? sort.slice(1) : sort;
  return { column, ascending: !desc };
}

// Apply filter object to Supabase query — supports eq and array contains
function applyFilters(query, filters) {
  if (!filters) return query;
  for (const [key, val] of Object.entries(filters)) {
    if (val === null || val === undefined) continue;
    if (Array.isArray(val)) {
      query = query.contains(key, val);
    } else {
      query = query.eq(key, val);
    }
  }
  return query;
}

function createEntityClient(entityName) {
  const table = TABLE_MAP[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  return {
    async list(sort, limit) {
      let q = supabase.from(table).select('*');
      const s = parseSort(sort);
      if (s) q = q.order(s.column, { ascending: s.ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },

    async filter(filters, sort, limit) {
      let q = supabase.from(table).select('*');
      q = applyFilters(q, filters);
      const s = parseSort(sort);
      if (s) q = q.order(s.column, { ascending: s.ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },

    async create(record) {
      const { data, error } = await supabase.from(table).insert(record).select().single();
      if (error) throw error;
      return data;
    },

    async update(id, record) {
      const { data, error } = await supabase
        .from(table)
        .update({ ...record, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },

    async bulkCreate(records) {
      const { data, error } = await supabase.from(table).insert(records).select();
      if (error) throw error;
      return data ?? [];
    },

    subscribe(callback) {
      const channel = supabase
        .channel(`${table}_realtime_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          const eventTypeMap = { INSERT: 'create', UPDATE: 'update', DELETE: 'delete' };
          const record = payload.new || payload.old || {};
          callback({
            type: eventTypeMap[payload.eventType] || payload.eventType,
            id: record.id,
            data: payload.new || null,
          });
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    },
  };
}

// Build entities proxy — all 44 entities
const entities = new Proxy({}, {
  get(_, entityName) {
    if (TABLE_MAP[entityName]) {
      return createEntityClient(entityName);
    }
    return undefined;
  }
});

// ============================================================
// AUTH — mirrors base44.auth API
// ============================================================
const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw error || new Error('Not authenticated');
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.role || 'user',
      ...user.user_metadata,
    };
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  loginWithProvider(provider, redirectTo) {
    const redirectUrl = redirectTo
      ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/auth/callback`;
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl },
    });
  },

  async register({ email, password, full_name }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) throw error;
    return data.user;
  },

  async updateMe(updates) {
    const { data, error } = await supabase.auth.updateUser({ data: updates });
    if (error) throw error;
    return data.user;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin() {
    const from = encodeURIComponent(window.location.href);
    window.location.href = `/login?from_url=${from}`;
  },
};

// ============================================================
// INTEGRATIONS — file upload + LLM
// ============================================================
const integrations = {
  Core: {
    async UploadFile({ file }) {
      const ext = file.name.split('.').pop();
      const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('uploads').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(data.path);
      return { url: publicUrl };
    },

    async InvokeLLM({ prompt, response_json_schema, system_prompt, model }) {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, response_json_schema, system_prompt, model }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'AI request failed');
      }
      return res.json();
    },
  },
};

// ============================================================
// Export base44-compatible object so existing imports work
// ============================================================
export const base44 = { entities, auth, integrations };
