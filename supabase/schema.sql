-- ============================================================
-- BASMA WEB — Full Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with extra fields
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  company     text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Instances (WhatsApp connections) ─────────────────────────────────────────
create table public.instances (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  instance_name   text unique not null,  -- internal Evolution API identifier
  display_name    text not null,          -- shown in dashboard
  phone           text,
  status          text default 'DISCONNECTED'
                    check (status in ('CONNECTING','CONNECTED','DISCONNECTED','QR_READY')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Contacts ──────────────────────────────────────────────────────────────────
create table public.contacts (
  id           uuid default uuid_generate_v4() primary key,
  instance_id  uuid references public.instances(id) on delete cascade not null,
  remote_jid   text not null,   -- WhatsApp ID e.g. 201234567890@s.whatsapp.net
  push_name    text,
  profile_pic  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(instance_id, remote_jid)
);

-- ── Chats ─────────────────────────────────────────────────────────────────────
create table public.chats (
  id               uuid default uuid_generate_v4() primary key,
  instance_id      uuid references public.instances(id) on delete cascade not null,
  remote_jid       text not null,
  last_message_at  timestamptz,
  unread_count     int default 0,
  created_at       timestamptz default now(),
  unique(instance_id, remote_jid)
);

-- ── Messages ──────────────────────────────────────────────────────────────────
create table public.messages (
  id            uuid default uuid_generate_v4() primary key,
  instance_id   uuid references public.instances(id) on delete cascade not null,
  chat_id       uuid references public.chats(id) on delete cascade not null,
  contact_id    uuid references public.contacts(id) on delete set null,
  message_id    text not null,   -- Evolution API message ID
  from_me       boolean not null,
  remote_jid    text not null,
  message_type  text default 'TEXT'
                  check (message_type in ('TEXT','IMAGE','AUDIO','VIDEO','DOCUMENT','STICKER','LOCATION','CONTACT','REACTION','POLL','UNKNOWN')),
  content       jsonb not null,  -- full message payload
  status        text default 'PENDING'
                  check (status in ('PENDING','SENT','DELIVERED','READ','FAILED')),
  timestamp     timestamptz not null,
  created_at    timestamptz default now(),
  unique(instance_id, message_id)
);

-- ── Webhook Configs ───────────────────────────────────────────────────────────
create table public.webhook_configs (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null,
  name                text not null,
  destination_type    text not null
                        check (destination_type in ('URL','EMAIL','N8N','ZAPIER','MAKE')),
  destination_url     text,
  destination_email   text,
  events              text[] not null default '{}',
  is_active           boolean default true,
  secret              text,
  retry_count         int default 3,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── Webhook Events ────────────────────────────────────────────────────────────
create table public.webhook_events (
  id            uuid default uuid_generate_v4() primary key,
  instance_id   uuid references public.instances(id) on delete cascade not null,
  event_type    text not null,
  payload       jsonb not null,
  processed_at  timestamptz default now()
);

-- ── Webhook Deliveries ────────────────────────────────────────────────────────
create table public.webhook_deliveries (
  id                uuid default uuid_generate_v4() primary key,
  event_id          uuid references public.webhook_events(id) on delete cascade not null,
  webhook_config_id uuid references public.webhook_configs(id) on delete cascade not null,
  status            text default 'PENDING'
                      check (status in ('PENDING','SUCCESS','FAILED','RETRYING')),
  attempts          int default 0,
  last_attempt_at   timestamptz,
  response_status   int,
  response_body     text,
  error             text,
  next_retry_at     timestamptz,
  created_at        timestamptz default now()
);

-- ── Row Level Security (RLS) ──────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.instances         enable row level security;
alter table public.contacts          enable row level security;
alter table public.chats             enable row level security;
alter table public.messages          enable row level security;
alter table public.webhook_configs   enable row level security;
alter table public.webhook_events    enable row level security;
alter table public.webhook_deliveries enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Instances
create policy "Users can manage own instances"
  on public.instances for all
  using (auth.uid() = user_id);

-- Contacts
create policy "Users can manage own contacts"
  on public.contacts for all
  using (
    instance_id in (
      select id from public.instances where user_id = auth.uid()
    )
  );

-- Chats
create policy "Users can manage own chats"
  on public.chats for all
  using (
    instance_id in (
      select id from public.instances where user_id = auth.uid()
    )
  );

-- Messages
create policy "Users can manage own messages"
  on public.messages for all
  using (
    instance_id in (
      select id from public.instances where user_id = auth.uid()
    )
  );

-- Webhook configs
create policy "Users can manage own webhook configs"
  on public.webhook_configs for all
  using (auth.uid() = user_id);

-- Webhook events
create policy "Users can view own webhook events"
  on public.webhook_events for select
  using (
    instance_id in (
      select id from public.instances where user_id = auth.uid()
    )
  );

-- Webhook deliveries
create policy "Users can view own webhook deliveries"
  on public.webhook_deliveries for select
  using (
    webhook_config_id in (
      select id from public.webhook_configs where user_id = auth.uid()
    )
  );

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index idx_instances_user_id         on public.instances(user_id);
create index idx_messages_instance_id      on public.messages(instance_id);
create index idx_messages_chat_id          on public.messages(chat_id);
create index idx_messages_timestamp        on public.messages(timestamp desc);
create index idx_chats_instance_id         on public.chats(instance_id);
create index idx_chats_last_message        on public.chats(last_message_at desc);
create index idx_webhook_events_instance   on public.webhook_events(instance_id);
create index idx_webhook_deliveries_config on public.webhook_deliveries(webhook_config_id);
