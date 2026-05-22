-- ============================================================
-- Multi-Tenant AI Chatbot SaaS — Initial Schema
-- ============================================================

create extension if not exists "pgcrypto";

create type public.user_role as enum ('user', 'super_admin');
create type public.workspace_role as enum ('owner', 'admin', 'member');
create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'incomplete'
);
create type public.plan_tier as enum ('free', 'starter', 'pro');

-- ============================================================
-- Profiles (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Workspaces (each small business)
-- ============================================================
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  plan public.plan_tier not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status public.subscription_status default 'incomplete',
  allowed_domains text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workspaces_owner_id_idx on public.workspaces(owner_id);
create index workspaces_slug_idx on public.workspaces(slug);

-- ============================================================
-- Workspace members
-- ============================================================
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members(user_id);

-- ============================================================
-- Bots (chatbots per workspace)
-- ============================================================
create table public.bots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  system_prompt text not null default 'You are a helpful customer support assistant.',
  welcome_message text not null default 'Hi! How can I help you today?',
  primary_color text not null default '#6366f1',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bots_workspace_id_idx on public.bots(workspace_id);

-- ============================================================
-- API keys (for embed widget — store hash only)
-- ============================================================
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  bot_id uuid references public.bots(id) on delete cascade,
  name text not null default 'Default',
  key_prefix text not null,
  key_hash text not null,
  last_used_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index api_keys_workspace_id_idx on public.api_keys(workspace_id);
create index api_keys_key_prefix_idx on public.api_keys(key_prefix);

-- ============================================================
-- Conversations & messages
-- ============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  bot_id uuid not null references public.bots(id) on delete cascade,
  visitor_id text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_workspace_id_idx on public.conversations(workspace_id);
create index conversations_bot_id_idx on public.conversations(bot_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens_used int default 0,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages(conversation_id);

-- ============================================================
-- Monthly usage tracking
-- ============================================================
create table public.usage_monthly (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  year_month text not null,
  message_count int not null default 0,
  unique (workspace_id, year_month)
);

-- ============================================================
-- Plan limits (reference table)
-- ============================================================
create table public.plan_limits (
  tier public.plan_tier primary key,
  max_messages_per_month int not null,
  max_bots int not null
);

insert into public.plan_limits (tier, max_messages_per_month, max_bots) values
  ('free', 100, 1),
  ('starter', 2000, 3),
  ('pro', 10000, 10);

-- ============================================================
-- Helper functions
-- ============================================================
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger workspaces_updated_at before update on public.workspaces
  for each row execute function public.set_updated_at();
create trigger bots_updated_at before update on public.bots
  for each row execute function public.set_updated_at();
create trigger conversations_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.bots enable row level security;
alter table public.api_keys enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.usage_monthly enable row level security;
alter table public.plan_limits enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_super_admin());

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Members read workspace"
  on public.workspaces for select
  using (public.is_workspace_member(id) or public.is_super_admin());

create policy "Owners insert workspace"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Owners update workspace"
  on public.workspaces for update
  using (public.is_workspace_owner(id) or public.is_super_admin());

create policy "Owners delete workspace"
  on public.workspaces for delete
  using (public.is_workspace_owner(id) or public.is_super_admin());

create policy "Members read members"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "Owners manage members"
  on public.workspace_members for all
  using (public.is_workspace_owner(workspace_id) or public.is_super_admin());

create policy "Members read bots"
  on public.bots for select
  using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "Members manage bots"
  on public.bots for all
  using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "Members read api_keys"
  on public.api_keys for select
  using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "Owners manage api_keys"
  on public.api_keys for all
  using (public.is_workspace_owner(workspace_id) or public.is_super_admin());

create policy "Members read conversations"
  on public.conversations for select
  using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "Members read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and public.is_workspace_member(c.workspace_id)
    ) or public.is_super_admin()
  );

create policy "Members read usage"
  on public.usage_monthly for select
  using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "Anyone read plan_limits"
  on public.plan_limits for select
  using (true);

grant usage on schema public to anon, authenticated;
grant select on public.plan_limits to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
