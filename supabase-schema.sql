-- ============================================================
-- The Condition of Man — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (mirrors auth.users for admin queries)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text default 'user',
  created_date timestamptz default now()
);
alter table public.users enable row level security;
create policy "users_select_all" on public.users for select using (true);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- Trigger: auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- USER_PROFILES
-- ============================================================
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_email text not null unique,
  display_name text,
  username text unique,
  bio text,
  avatar_url text,
  phone_number text,
  tiktok text,
  instagram text,
  twitter text,
  facebook text,
  youtube text,
  website text,
  testimony text,
  accent_color text default '#F5A623',
  language_preference text default 'KJV',
  followers text[] default '{}',
  following text[] default '{}',
  subscribers text[] default '{}',
  subscribed_to text[] default '{}',
  watchlist text[] default '{}',
  bookmarked_posts text[] default '{}',
  search_history text[] default '{}',
  saved_searches text[] default '{}',
  completed_bible_plans text[] default '{}',
  interest_tags text[] default '{}',
  draft_posts jsonb default '[]',
  bio_links jsonb default '[]',
  achievements jsonb default '[]',
  total_contributions jsonb default '{"posts":0,"comments":0,"streams_hosted":0}',
  notification_preferences jsonb default '{"replies":true,"likes":true,"follows":true,"new_subscriber_content":true,"mentions":true}',
  reading_streak jsonb default '{"current_streak":0,"longest_streak":0,"total_reading_days":0}',
  notebook text default '',
  post_count integer default 0,
  daily_verse_enabled boolean default false,
  daily_verse_time text default '09:00',
  is_creator boolean default false,
  is_moderator boolean default false,
  is_admin boolean default false,
  trust_score numeric default 0,
  reported_abuse_count integer default 0,
  total_points numeric default 0,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.user_profiles enable row level security;
create policy "profiles_select_all" on public.user_profiles for select using (true);
create policy "profiles_insert_own" on public.user_profiles for insert with check (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "profiles_update_own" on public.user_profiles for update using (
  user_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_user_profiles_email on public.user_profiles(user_email);

-- ============================================================
-- FORUM_POSTS
-- ============================================================
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text default 'general',
  author_email text,
  author_name text,
  author_avatar text,
  reply_count integer default 0,
  media_url text,
  media_type text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.forum_posts enable row level security;
create policy "forum_posts_select" on public.forum_posts for select using (true);
create policy "forum_posts_insert" on public.forum_posts for insert with check (auth.uid() is not null);
create policy "forum_posts_update_own" on public.forum_posts for update using (
  author_email = (select email from auth.users where id = auth.uid())
);
create policy "forum_posts_delete_own" on public.forum_posts for delete using (
  author_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_forum_posts_created on public.forum_posts(created_date desc);

-- ============================================================
-- FORUM_REPLIES
-- ============================================================
create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  content text not null,
  author_email text,
  author_name text,
  author_avatar text,
  likes integer default 0,
  liked_by text[] default '{}',
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.forum_replies enable row level security;
create policy "replies_select" on public.forum_replies for select using (true);
create policy "replies_insert" on public.forum_replies for insert with check (auth.uid() is not null);
create policy "replies_update_own" on public.forum_replies for update using (
  author_email = (select email from auth.users where id = auth.uid())
);
create policy "replies_delete_own" on public.forum_replies for delete using (
  author_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_forum_replies_post on public.forum_replies(post_id);

-- ============================================================
-- COMMUNITY_POSTS
-- ============================================================
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_email text not null,
  author_name text,
  author_avatar text,
  caption text not null,
  media_urls jsonb default '[]',
  likes integer default 0,
  liked_by text[] default '{}',
  comment_count integer default 0,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.community_posts enable row level security;
create policy "community_posts_select" on public.community_posts for select using (true);
create policy "community_posts_insert" on public.community_posts for insert with check (auth.uid() is not null);
create policy "community_posts_update_own" on public.community_posts for update using (
  author_email = (select email from auth.users where id = auth.uid())
);
create policy "community_posts_delete_own" on public.community_posts for delete using (
  author_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_community_posts_created on public.community_posts(created_date desc);

-- ============================================================
-- POST_COMMENTS
-- ============================================================
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  author_email text,
  author_name text,
  author_avatar text,
  content text not null,
  created_date timestamptz default now()
);
alter table public.post_comments enable row level security;
create policy "post_comments_select" on public.post_comments for select using (true);
create policy "post_comments_insert" on public.post_comments for insert with check (auth.uid() is not null);
create index if not exists idx_post_comments_post on public.post_comments(post_id);

-- ============================================================
-- BIBLE_PLANS
-- ============================================================
create table if not exists public.bible_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text default 'selfpaced',
  duration_days integer not null,
  start_date date,
  readings jsonb default '[]',
  enrolled_count integer default 0,
  is_public boolean default true,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.bible_plans enable row level security;
create policy "bible_plans_select" on public.bible_plans for select using (true);
create policy "bible_plans_insert" on public.bible_plans for insert with check (auth.uid() is not null);
create policy "bible_plans_update" on public.bible_plans for update using (auth.uid() is not null);
create policy "bible_plans_delete" on public.bible_plans for delete using (auth.uid() is not null);

-- ============================================================
-- USER_PLAN_ENROLLMENTS
-- ============================================================
create table if not exists public.user_plan_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  plan_id text not null,
  completed_days integer[] default '{}',
  current_day integer default 1,
  start_date date default current_date,
  completed_date date,
  is_completed boolean default false,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.user_plan_enrollments enable row level security;
create policy "enrollments_select_own" on public.user_plan_enrollments for select using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "enrollments_insert_own" on public.user_plan_enrollments for insert with check (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "enrollments_update_own" on public.user_plan_enrollments for update using (
  user_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_enrollments_user on public.user_plan_enrollments(user_email);

-- ============================================================
-- PLAN_REFLECTIONS
-- ============================================================
create table if not exists public.plan_reflections (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  plan_id text not null,
  day_number integer,
  reflection text,
  likes integer default 0,
  liked_by text[] default '{}',
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.plan_reflections enable row level security;
create policy "reflections_select" on public.plan_reflections for select using (true);
create policy "reflections_insert" on public.plan_reflections for insert with check (auth.uid() is not null);
create policy "reflections_update_own" on public.plan_reflections for update using (
  user_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_reflections_plan on public.plan_reflections(plan_id);

-- ============================================================
-- REFLECTION_COMMENTS
-- ============================================================
create table if not exists public.reflection_comments (
  id uuid primary key default gen_random_uuid(),
  reflection_id text not null,
  author_email text,
  author_name text,
  content text not null,
  created_date timestamptz default now()
);
alter table public.reflection_comments enable row level security;
create policy "reflection_comments_select" on public.reflection_comments for select using (true);
create policy "reflection_comments_insert" on public.reflection_comments for insert with check (auth.uid() is not null);

-- ============================================================
-- BIBLE_FAVORITES
-- ============================================================
create table if not exists public.bible_favorites (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  book text not null,
  chapter integer not null,
  start_verse integer not null,
  end_verse integer,
  text text not null,
  title text,
  created_date timestamptz default now()
);
alter table public.bible_favorites enable row level security;
create policy "bible_fav_select_own" on public.bible_favorites for select using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "bible_fav_insert_own" on public.bible_favorites for insert with check (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "bible_fav_delete_own" on public.bible_favorites for delete using (
  user_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_bible_fav_user on public.bible_favorites(user_email);

-- ============================================================
-- BIBLE_HIGHLIGHTS
-- ============================================================
create table if not exists public.bible_highlights (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  book text not null,
  chapter integer not null,
  verse integer not null,
  text text not null,
  color text default 'yellow',
  note text,
  created_date timestamptz default now()
);
alter table public.bible_highlights enable row level security;
create policy "highlights_select_own" on public.bible_highlights for select using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "highlights_insert_own" on public.bible_highlights for insert with check (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "highlights_delete_own" on public.bible_highlights for delete using (
  user_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_highlights_user on public.bible_highlights(user_email);

-- ============================================================
-- BIBLE_JOURNALS
-- ============================================================
create table if not exists public.bible_journals (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  book text not null,
  chapter integer not null,
  verse integer not null,
  verse_text text,
  notes text,
  reflection text,
  tags text[] default '{}',
  is_favorite boolean default false,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.bible_journals enable row level security;
create policy "bible_journals_select_own" on public.bible_journals for select using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "bible_journals_insert_own" on public.bible_journals for insert with check (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "bible_journals_update_own" on public.bible_journals for update using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "bible_journals_delete_own" on public.bible_journals for delete using (
  user_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_bible_journals_user on public.bible_journals(user_email);

-- ============================================================
-- LIVE_STREAMS
-- ============================================================
create table if not exists public.live_streams (
  id uuid primary key default gen_random_uuid(),
  host_email text not null,
  host_name text,
  host_avatar text,
  title text not null,
  description text,
  stream_url text,
  thumbnail_url text,
  is_live boolean default false,
  viewer_count integer default 0,
  like_count integer default 0,
  comment_count integer default 0,
  category text,
  tags text[] default '{}',
  started_at timestamptz,
  ended_at timestamptz,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.live_streams enable row level security;
create policy "live_streams_select" on public.live_streams for select using (true);
create policy "live_streams_insert" on public.live_streams for insert with check (auth.uid() is not null);
create policy "live_streams_update_own" on public.live_streams for update using (
  host_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_live_streams_created on public.live_streams(created_date desc);

-- ============================================================
-- LIVE_COMMENTS
-- ============================================================
create table if not exists public.live_comments (
  id uuid primary key default gen_random_uuid(),
  stream_id text not null,
  author_email text,
  author_name text,
  author_avatar text,
  content text not null,
  created_date timestamptz default now()
);
alter table public.live_comments enable row level security;
create policy "live_comments_select" on public.live_comments for select using (true);
create policy "live_comments_insert" on public.live_comments for insert with check (auth.uid() is not null);
create index if not exists idx_live_comments_stream on public.live_comments(stream_id);

-- ============================================================
-- PRAYER_REQUESTS
-- ============================================================
create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  author_email text not null,
  author_name text,
  title text not null,
  content text,
  category text,
  is_anonymous boolean default false,
  prayer_count integer default 0,
  prayed_by text[] default '{}',
  status text default 'active',
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.prayer_requests enable row level security;
create policy "prayer_select" on public.prayer_requests for select using (true);
create policy "prayer_insert" on public.prayer_requests for insert with check (auth.uid() is not null);
create policy "prayer_update_own" on public.prayer_requests for update using (
  author_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_prayer_created on public.prayer_requests(created_date desc);

-- ============================================================
-- PRAYER_JOURNALS
-- ============================================================
create table if not exists public.prayer_journals (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  title text,
  content text not null,
  tags text[] default '{}',
  is_private boolean default true,
  mood text,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.prayer_journals enable row level security;
create policy "prayer_journals_select_own" on public.prayer_journals for select using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "prayer_journals_insert_own" on public.prayer_journals for insert with check (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "prayer_journals_update_own" on public.prayer_journals for update using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "prayer_journals_delete_own" on public.prayer_journals for delete using (
  user_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_prayer_journals_user on public.prayer_journals(user_email);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  sender_email text,
  sender_name text,
  sender_avatar text,
  type text not null,
  message text,
  entity_id text,
  entity_type text,
  is_read boolean default false,
  created_date timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "notifs_select_own" on public.notifications for select using (
  recipient_email = (select email from auth.users where id = auth.uid())
);
create policy "notifs_insert" on public.notifications for insert with check (auth.uid() is not null);
create policy "notifs_update_own" on public.notifications for update using (
  recipient_email = (select email from auth.users where id = auth.uid())
);
create policy "notifs_delete_own" on public.notifications for delete using (
  recipient_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_notifs_recipient on public.notifications(recipient_email);

-- ============================================================
-- DIRECT_MESSAGES
-- ============================================================
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  from_email text not null,
  to_email text not null,
  content text not null,
  read boolean default false,
  conversation_id text not null,
  created_date timestamptz default now()
);
alter table public.direct_messages enable row level security;
create policy "dm_select_own" on public.direct_messages for select using (
  from_email = (select email from auth.users where id = auth.uid()) or
  to_email = (select email from auth.users where id = auth.uid())
);
create policy "dm_insert_own" on public.direct_messages for insert with check (
  from_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_dm_conversation on public.direct_messages(conversation_id);

-- ============================================================
-- GROUP_CHAT_MESSAGES
-- ============================================================
create table if not exists public.group_chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  author_email text not null,
  author_name text,
  author_avatar text,
  content text not null,
  message_type text default 'text',
  reactions jsonb default '{}',
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.group_chat_messages enable row level security;
create policy "gchat_select" on public.group_chat_messages for select using (auth.uid() is not null);
create policy "gchat_insert" on public.group_chat_messages for insert with check (auth.uid() is not null);
create policy "gchat_update_own" on public.group_chat_messages for update using (
  author_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_gchat_channel on public.group_chat_messages(channel, created_date desc);

-- ============================================================
-- PLAYER_MESSAGES
-- ============================================================
create table if not exists public.player_messages (
  id uuid primary key default gen_random_uuid(),
  from_email text not null,
  to_email text not null,
  from_name text,
  to_name text,
  content text not null,
  is_read boolean default false,
  created_date timestamptz default now()
);
alter table public.player_messages enable row level security;
create policy "player_msg_select" on public.player_messages for select using (
  from_email = (select email from auth.users where id = auth.uid()) or
  to_email = (select email from auth.users where id = auth.uid())
);
create policy "player_msg_insert" on public.player_messages for insert with check (auth.uid() is not null);
create index if not exists idx_player_msg_to on public.player_messages(to_email);

-- ============================================================
-- RPG TABLES
-- ============================================================
create table if not exists public.rpg_player_progress (
  id uuid primary key default gen_random_uuid(),
  player_email text not null unique,
  character_id text not null,
  level integer default 1,
  xp numeric default 0,
  faith_score numeric default 0,
  wisdom_score numeric default 0,
  obedience_score numeric default 0,
  integrity_score numeric default 0,
  completed_missions text[] default '{}',
  current_mission text,
  play_streak integer default 0,
  last_played date,
  total_score numeric default 0,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.rpg_player_progress enable row level security;
create policy "rpg_progress_select" on public.rpg_player_progress for select using (true);
create policy "rpg_progress_insert_own" on public.rpg_player_progress for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "rpg_progress_update_own" on public.rpg_player_progress for update using (
  player_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_rpg_progress_email on public.rpg_player_progress(player_email);

create table if not exists public.rpg_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text,
  rarity text default 'common',
  power numeric default 0,
  required_level integer default 1,
  character_type text,
  icon_emoji text,
  effect_description text,
  is_available boolean default true,
  created_date timestamptz default now()
);
alter table public.rpg_items enable row level security;
create policy "rpg_items_select" on public.rpg_items for select using (true);
create policy "rpg_items_insert" on public.rpg_items for insert with check (auth.uid() is not null);

create table if not exists public.rpg_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  player_name text,
  character_id text,
  level integer default 1,
  total_score numeric default 0,
  rank integer,
  created_date timestamptz default now()
);
alter table public.rpg_leaderboard enable row level security;
create policy "rpg_lb_select" on public.rpg_leaderboard for select using (true);
create policy "rpg_lb_insert" on public.rpg_leaderboard for insert with check (auth.uid() is not null);
create index if not exists idx_rpg_lb_score on public.rpg_leaderboard(total_score desc);

create table if not exists public.rpg_mission_decisions (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  mission_id text not null,
  decision_id text,
  choice_text text,
  moral_score numeric default 0,
  created_date timestamptz default now()
);
alter table public.rpg_mission_decisions enable row level security;
create policy "rpg_decisions_select_own" on public.rpg_mission_decisions for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "rpg_decisions_insert_own" on public.rpg_mission_decisions for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_rpg_decisions_player on public.rpg_mission_decisions(player_email);

create table if not exists public.game_progress (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  game_id text not null,
  current_level integer default 1,
  score numeric default 0,
  completed boolean default false,
  data jsonb default '{}',
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.game_progress enable row level security;
create policy "game_progress_select_own" on public.game_progress for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "game_progress_insert_own" on public.game_progress for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "game_progress_update_own" on public.game_progress for update using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "game_progress_delete_own" on public.game_progress for delete using (
  player_email = (select email from auth.users where id = auth.uid())
);

create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  player_name text,
  game_id text not null,
  score numeric not null,
  level integer default 1,
  created_date timestamptz default now()
);
alter table public.game_scores enable row level security;
create policy "game_scores_select" on public.game_scores for select using (true);
create policy "game_scores_insert" on public.game_scores for insert with check (auth.uid() is not null);
create index if not exists idx_game_scores_game on public.game_scores(game_id, score desc);

-- ============================================================
-- INVENTORY / ITEMS
-- ============================================================
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text,
  rarity text default 'common',
  icon_emoji text,
  stats jsonb default '{}',
  is_tradeable boolean default true,
  created_date timestamptz default now()
);
alter table public.items enable row level security;
create policy "items_select" on public.items for select using (true);
create policy "items_insert" on public.items for insert with check (auth.uid() is not null);

create table if not exists public.player_inventory (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  item_id text not null,
  item_name text,
  quantity integer default 1,
  acquired_at timestamptz default now(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.player_inventory enable row level security;
create policy "inventory_select_own" on public.player_inventory for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "inventory_insert_own" on public.player_inventory for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "inventory_update_own" on public.player_inventory for update using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "inventory_delete_own" on public.player_inventory for delete using (
  player_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_inventory_player on public.player_inventory(player_email);

create table if not exists public.cosmetic_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  cost_coins numeric not null,
  icon_emoji text,
  rarity text default 'common',
  is_available boolean default true,
  created_date timestamptz default now()
);
alter table public.cosmetic_items enable row level security;
create policy "cosmetics_select" on public.cosmetic_items for select using (true);
create policy "cosmetics_insert" on public.cosmetic_items for insert with check (auth.uid() is not null);

create table if not exists public.player_cosmetic_inventory (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  cosmetic_id text not null,
  is_equipped boolean default false,
  acquired_at timestamptz default now(),
  created_date timestamptz default now()
);
alter table public.player_cosmetic_inventory enable row level security;
create policy "cosmetic_inv_select_own" on public.player_cosmetic_inventory for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "cosmetic_inv_insert_own" on public.player_cosmetic_inventory for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_cosmetic_inv_player on public.player_cosmetic_inventory(player_email);

-- ============================================================
-- ACHIEVEMENTS & SKILLS
-- ============================================================
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  achievement_id text unique not null,
  name text not null,
  description text,
  icon text,
  xp_reward numeric default 0,
  category text,
  created_date timestamptz default now()
);
alter table public.achievements enable row level security;
create policy "achievements_select" on public.achievements for select using (true);
create policy "achievements_insert" on public.achievements for insert with check (auth.uid() is not null);

create table if not exists public.player_achievements (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  achievement_id text not null,
  progress numeric default 0,
  is_unlocked boolean default false,
  unlocked_at timestamptz,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.player_achievements enable row level security;
create policy "player_ach_select_own" on public.player_achievements for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "player_ach_insert_own" on public.player_achievements for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "player_ach_update_own" on public.player_achievements for update using (
  player_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_player_ach_player on public.player_achievements(player_email);

create table if not exists public.player_skills (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  skill_id text not null,
  level integer default 1,
  xp numeric default 0,
  is_unlocked boolean default false,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.player_skills enable row level security;
create policy "skills_select_own" on public.player_skills for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "skills_insert_own" on public.player_skills for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "skills_update_own" on public.player_skills for update using (
  player_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_skills_player on public.player_skills(player_email);

create table if not exists public.player_skill_trees (
  id uuid primary key default gen_random_uuid(),
  player_email text not null unique,
  tree_data jsonb default '{}',
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.player_skill_trees enable row level security;
create policy "skill_tree_select_own" on public.player_skill_trees for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "skill_tree_insert_own" on public.player_skill_trees for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "skill_tree_update_own" on public.player_skill_trees for update using (
  player_email = (select email from auth.users where id = auth.uid())
);

-- ============================================================
-- ECONOMY
-- ============================================================
create table if not exists public.player_coins (
  id uuid primary key default gen_random_uuid(),
  player_email text not null unique,
  balance numeric default 0,
  total_earned numeric default 0,
  total_spent numeric default 0,
  updated_date timestamptz default now(),
  created_date timestamptz default now()
);
alter table public.player_coins enable row level security;
create policy "coins_select_own" on public.player_coins for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "coins_insert_own" on public.player_coins for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "coins_update_own" on public.player_coins for update using (
  player_email = (select email from auth.users where id = auth.uid())
);

create table if not exists public.coin_purchases (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  stripe_session_id text,
  coins_purchased numeric not null,
  amount_usd numeric not null,
  status text default 'pending',
  created_date timestamptz default now()
);
alter table public.coin_purchases enable row level security;
create policy "coin_purchases_select_own" on public.coin_purchases for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "coin_purchases_insert_own" on public.coin_purchases for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);

create table if not exists public.daily_bonuses (
  id uuid primary key default gen_random_uuid(),
  player_email text not null,
  bonus_date date not null,
  coins_earned numeric default 50,
  streak_days integer default 1,
  last_claim_date date,
  created_date timestamptz default now()
);
alter table public.daily_bonuses enable row level security;
create policy "daily_bonus_select_own" on public.daily_bonuses for select using (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "daily_bonus_insert_own" on public.daily_bonuses for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_daily_bonus_player on public.daily_bonuses(player_email);

-- ============================================================
-- TRADING
-- ============================================================
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  initiator_email text not null,
  initiator_name text,
  recipient_email text not null,
  recipient_name text,
  initiator_items jsonb default '[]',
  recipient_items jsonb default '[]',
  initiator_confirmed boolean default false,
  recipient_confirmed boolean default false,
  status text default 'pending',
  expires_at timestamptz,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.trades enable row level security;
create policy "trades_select_own" on public.trades for select using (
  initiator_email = (select email from auth.users where id = auth.uid()) or
  recipient_email = (select email from auth.users where id = auth.uid())
);
create policy "trades_insert_own" on public.trades for insert with check (
  initiator_email = (select email from auth.users where id = auth.uid())
);
create policy "trades_update_own" on public.trades for update using (
  initiator_email = (select email from auth.users where id = auth.uid()) or
  recipient_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_trades_initiator on public.trades(initiator_email);
create index if not exists idx_trades_recipient on public.trades(recipient_email);

-- ============================================================
-- WORLD BOSS
-- ============================================================
create table if not exists public.world_bosses (
  id uuid primary key default gen_random_uuid(),
  boss_name text not null,
  boss_type text not null,
  health numeric not null,
  max_health numeric not null,
  total_damage numeric default 0,
  is_active boolean default true,
  spawn_time timestamptz,
  despawn_time timestamptz,
  total_participants integer default 0,
  xp_reward_pool numeric default 500,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.world_bosses enable row level security;
create policy "world_boss_select" on public.world_bosses for select using (true);
create policy "world_boss_insert" on public.world_bosses for insert with check (auth.uid() is not null);
create policy "world_boss_update" on public.world_bosses for update using (auth.uid() is not null);

create table if not exists public.boss_damage_logs (
  id uuid primary key default gen_random_uuid(),
  boss_id text not null,
  player_email text not null,
  player_name text,
  damage_dealt numeric,
  contribution_percentage numeric default 0,
  xp_earned numeric default 0,
  reward_tier text,
  claimed boolean default false,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.boss_damage_logs enable row level security;
create policy "boss_logs_select" on public.boss_damage_logs for select using (true);
create policy "boss_logs_insert" on public.boss_damage_logs for insert with check (auth.uid() is not null);
create policy "boss_logs_update_own" on public.boss_damage_logs for update using (
  player_email = (select email from auth.users where id = auth.uid())
);
create index if not exists idx_boss_logs_boss on public.boss_damage_logs(boss_id);

-- ============================================================
-- ACTIVE_PLAYERS
-- ============================================================
create table if not exists public.active_players (
  id uuid primary key default gen_random_uuid(),
  player_email text not null unique,
  player_name text,
  character_id text,
  level integer default 1,
  location text,
  total_score numeric default 0,
  last_active timestamptz default now(),
  is_online boolean default true,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.active_players enable row level security;
create policy "active_players_select" on public.active_players for select using (true);
create policy "active_players_insert_own" on public.active_players for insert with check (
  player_email = (select email from auth.users where id = auth.uid())
);
create policy "active_players_update_own" on public.active_players for update using (
  player_email = (select email from auth.users where id = auth.uid())
);

-- ============================================================
-- NOTEBOOK_ENTRIES
-- ============================================================
create table if not exists public.notebook_entries (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  title text,
  content text not null,
  tags text[] default '{}',
  is_pinned boolean default false,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.notebook_entries enable row level security;
create policy "notebook_select_own" on public.notebook_entries for select using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "notebook_insert_own" on public.notebook_entries for insert with check (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "notebook_update_own" on public.notebook_entries for update using (
  user_email = (select email from auth.users where id = auth.uid())
);
create policy "notebook_delete_own" on public.notebook_entries for delete using (
  user_email = (select email from auth.users where id = auth.uid())
);

-- ============================================================
-- REPORTED_CONTENT
-- ============================================================
create table if not exists public.reported_content (
  id uuid primary key default gen_random_uuid(),
  reporter_email text not null,
  content_id text not null,
  content_type text not null,
  reason text,
  status text default 'pending',
  moderator_note text,
  resolved_at timestamptz,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.reported_content enable row level security;
create policy "reported_select_mod" on public.reported_content for select using (auth.uid() is not null);
create policy "reported_insert" on public.reported_content for insert with check (auth.uid() is not null);
create policy "reported_update_mod" on public.reported_content for update using (auth.uid() is not null);
create policy "reported_delete_mod" on public.reported_content for delete using (auth.uid() is not null);

-- ============================================================
-- SITE_CONTENT (CMS)
-- ============================================================
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text,
  content text,
  content_type text default 'text',
  metadata jsonb default '{}',
  is_published boolean default true,
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);
alter table public.site_content enable row level security;
create policy "site_content_select" on public.site_content for select using (true);
create policy "site_content_insert" on public.site_content for insert with check (auth.uid() is not null);
create policy "site_content_update" on public.site_content for update using (auth.uid() is not null);
create policy "site_content_delete" on public.site_content for delete using (auth.uid() is not null);

-- ============================================================
-- Enable Realtime for real-time subscriptions
-- ============================================================
alter publication supabase_realtime add table public.forum_posts;
alter publication supabase_realtime add table public.group_chat_messages;
alter publication supabase_realtime add table public.user_profiles;
alter publication supabase_realtime add table public.world_bosses;
alter publication supabase_realtime add table public.trades;
alter publication supabase_realtime add table public.player_messages;
alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- STORAGE BUCKET (run in Supabase Dashboard > Storage)
-- Create a bucket named "uploads" with public access
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);
-- create policy "uploads_select" on storage.objects for select using (bucket_id = 'uploads');
-- create policy "uploads_insert" on storage.objects for insert with check (bucket_id = 'uploads' and auth.uid() is not null);
