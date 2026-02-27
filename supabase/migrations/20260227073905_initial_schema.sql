-- ============================================================
-- Kom Braai — Initial Schema
-- ============================================================

-- organisers
-- One row per authenticated user. id matches auth.users.id.
create table public.organisers (
  id              uuid        primary key references auth.users (id) on delete cascade,
  display_name    text        not null,
  nickname        text,
  avatar_url      text,
  fire_preference text        not null check (fire_preference in ('wood', 'gas', 'both')),
  braai_title     text        not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- braais
create table public.braais (
  id             uuid        primary key default gen_random_uuid(),
  organiser_id   uuid        not null references public.organisers (id) on delete cascade,
  slug           text        not null unique,
  title          text        not null,
  description    text,
  date_mode      text        not null check (date_mode in ('fixed', 'poll')),
  event_date     timestamptz,
  event_time     time,
  venue_name     text        not null,
  venue_address  text        not null,
  venue_lat      float,
  venue_lng      float,
  supply_mode    text        not null check (supply_mode in ('byo', 'shared')),
  max_attendees  int,
  event_options  jsonb       not null default '{}'::jsonb,
  status         text        not null default 'draft' check (status in ('draft', 'active', 'cancelled', 'completed')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- date_poll_options
create table public.date_poll_options (
  id             uuid        primary key default gen_random_uuid(),
  braai_id       uuid        not null references public.braais (id) on delete cascade,
  proposed_date  date        not null,
  created_at     timestamptz not null default now()
);

-- date_poll_votes
create table public.date_poll_votes (
  id              uuid        primary key default gen_random_uuid(),
  poll_option_id  uuid        not null references public.date_poll_options (id) on delete cascade,
  voter_name      text        not null,
  created_at      timestamptz not null default now()
);

-- supply_items
create table public.supply_items (
  id               uuid        primary key default gen_random_uuid(),
  braai_id         uuid        not null references public.braais (id) on delete cascade,
  item_name        text        not null,
  category         text        not null,
  provided_by      text        not null check (provided_by in ('organiser', 'needed', 'claimed')),
  claimed_by_name  text,
  created_at       timestamptz not null default now()
);

-- rsvps
create table public.rsvps (
  id              uuid        primary key default gen_random_uuid(),
  braai_id        uuid        not null references public.braais (id) on delete cascade,
  attendee_name   text        not null,
  attendee_count  int         not null default 1,
  status          text        not null default 'attending' check (status in ('attending', 'cancelled')),
  browser_token   text        not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_braais_slug                on public.braais (slug);
create index idx_braais_organiser_id        on public.braais (organiser_id);
create index idx_rsvps_braai_id             on public.rsvps (braai_id);
create index idx_supply_items_braai_id      on public.supply_items (braai_id);
create index idx_date_poll_options_braai_id on public.date_poll_options (braai_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.organisers        enable row level security;
alter table public.braais            enable row level security;
alter table public.date_poll_options enable row level security;
alter table public.date_poll_votes   enable row level security;
alter table public.supply_items      enable row level security;
alter table public.rsvps             enable row level security;

-- organisers: users manage only their own profile
create policy "organisers_select_own"
  on public.organisers for select
  using (auth.uid() = id);

create policy "organisers_insert_own"
  on public.organisers for insert
  with check (auth.uid() = id);

create policy "organisers_update_own"
  on public.organisers for update
  using (auth.uid() = id);

-- braais: organiser owns their rows; public can read active/cancelled braais
create policy "braais_all_own"
  on public.braais for all
  using (auth.uid() = organiser_id);

create policy "braais_select_public"
  on public.braais for select
  using (status in ('active', 'cancelled'));

-- rsvps: public can insert; organiser reads all for their braais; update token-gated in app layer
create policy "rsvps_insert_public"
  on public.rsvps for insert
  with check (true);

create policy "rsvps_select_organiser"
  on public.rsvps for select
  using (
    auth.uid() = (
      select organiser_id from public.braais where id = braai_id
    )
  );

create policy "rsvps_update_public"
  on public.rsvps for update
  using (true);

-- supply_items: public can read and claim available items; organiser has full access
create policy "supply_items_select_public"
  on public.supply_items for select
  using (true);

create policy "supply_items_update_claim"
  on public.supply_items for update
  using (provided_by = 'needed');

create policy "supply_items_all_organiser"
  on public.supply_items for all
  using (
    auth.uid() = (
      select organiser_id from public.braais where id = braai_id
    )
  );

-- date_poll_options: public can read; organiser has full access
create policy "date_poll_options_select_public"
  on public.date_poll_options for select
  using (true);

create policy "date_poll_options_all_organiser"
  on public.date_poll_options for all
  using (
    auth.uid() = (
      select organiser_id from public.braais where id = braai_id
    )
  );

-- date_poll_votes: public can insert; organiser can read via braai ownership
create policy "date_poll_votes_insert_public"
  on public.date_poll_votes for insert
  with check (true);

create policy "date_poll_votes_select_organiser"
  on public.date_poll_votes for select
  using (
    auth.uid() = (
      select b.organiser_id
      from public.braais b
      join public.date_poll_options o on o.braai_id = b.id
      where o.id = poll_option_id
    )
  );
