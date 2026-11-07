create extension if not exists "uuid-ossp";

-- Allowed Emails
create table if not exists public.allowed_emails (
  email text primary key,
  invited_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.allowed_emails enable row level security;

create policy "Allowed emails readable by authenticated users"
  on public.allowed_emails for select
  to authenticated
  using (true);

-- User Words
create table if not exists public.user_words (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  lemma text not null,
  word_id text,
  status text check (status in ('seed', 'sprout', 'grown', 'bloom')) not null default 'seed',
  own_meaning text,
  own_sentence text,
  context_note text,
  parent_word_id uuid,
  fsrs_card jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted boolean default false
);

create index if not exists idx_user_words_user_lemma on public.user_words(user_id, lemma);
create index if not exists idx_user_words_updated_at on public.user_words(user_id, updated_at);

alter table public.user_words enable row level security;

create policy "Users can view and manage their own words"
  on public.user_words for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Unlocks
create table if not exists public.unlocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_word_id uuid references public.user_words(id) on delete cascade not null,
  layer text not null,
  slot_key text not null,
  unlocked_value text not null,
  method text not null,
  hint_level int,
  xp_awarded int not null default 0,
  found_by_self boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted boolean default false
);

alter table public.unlocks enable row level security;

create policy "Users can manage their own unlocks"
  on public.unlocks for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Daily Log
create table if not exists public.daily_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  xp int not null default 0,
  items_done int not null default 0,
  session_complete boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted boolean default false,
  unique(user_id, date)
);

alter table public.daily_log enable row level security;

create policy "Users can manage their own daily logs"
  on public.daily_log for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- AI Usage
create table if not exists public.ai_usage (
  user_id uuid references auth.users(id) on delete cascade not null,
  day date not null,
  count int not null default 1,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

create policy "Users can view their own AI usage"
  on public.ai_usage for select
  to authenticated
  using (auth.uid() = user_id);
