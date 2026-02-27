# SPEC.md — Kom Braai Product Specification

## Product Summary

Kom Braai is a mobile-first web app for South African expats to create and share braai (barbecue) events with friends. No app store download required — it's a responsive website with shareable invite links designed to spread via WhatsApp.

**Core principle:** Minimum friction. Attendees never need to sign up. Organisers sign in once with Google.

---

## User Roles

### Organiser (authenticated)
- Signs in via Google OAuth
- Creates and manages braai events
- Has a dashboard to view all their braais
- Has a lightweight profile (name, pic, nickname, fun tags)

### Attendee (anonymous)
- Clicks an invite link — no sign-up required
- Views the braai invite card
- RSVPs with a name and optional attendee count (+1, +2, etc.)
- Can claim supply items
- Can download .ics calendar file

---

## Features

### 1. Organiser Authentication

- Google OAuth via Supabase Auth
- Only required to create/manage braais
- Post-auth, organiser completes a lightweight profile

### 2. Organiser Profile

Fields:
- **Display name** (editable, defaults to Google name)
- **Profile picture** (defaults to Google avatar)
- **Nickname** (optional)
- **Fire preference:** Wood / Gas / Both (required, fun)
- **Braai title:** Selectable from a predefined list:
  - Vuurmeester
  - Sous Chef
  - Braai Boss
  - Potjie King/Queen
  - Just Here for the Dop
  - Rookie
  - (more can be added via config)

The organiser profile is visible on the invite card (linked).

### 3. Create Braai Event

The braai creation form collects:

#### Date Mode (required)
- **Fixed date:** Single date and time picker
- **Date poll:** Organiser proposes 2-5 dates. Attendees vote. Organiser confirms the winning date, which converts the poll into a fixed-date event.

#### Location (required)
- Text input for venue name/description
- Google Maps location picker or address input
- Stored as: venue name + address + lat/lng coordinates
- Displayed on invite card with embedded map and "Get Directions" link (opens Google Maps)

#### Supply Mode (required)
- **Bring Your Own:** Organiser optionally lists what they're providing from a predefined supply list. Attendees sort themselves out.
- **Shared / Potjie Mode:** Organiser lists what's needed (from predefined list + custom items). Attendees can claim items.

#### Predefined Supply Items
Stored in config, easily extendable:
- Meat (various: wors, chops, steak, chicken, etc.)
- Braaibroodjies
- Sides / salads
- Ice
- Drinks / Dop
- Charcoal / wood
- Rolls / bread
- Dessert
- Snacks / biltong
- Custom item (free text)

#### Event Options (configurable toggles)
Stored as a flexible key-value structure. Initial options:
- **Kids:** "Bring the kids" / "Leave the kids"
- **Etiquette link:** Show link to braai etiquette page on invite (on/off)

New options can be added to config without schema changes (e.g., "Bring a chair", "Pool available", "Halal options available").

#### Additional Fields
- **Event description** (optional free text — e.g., "Celebrating Jaco's birthday" or "Just because it's Saturday")
- **Max attendees** (optional — if set, RSVP closes when limit reached)

### 4. Invite Card (Public Page)

This is the hero UX — the page attendees see when they click the shared link.

#### Layout
A visually styled card displaying:
- Braai-themed graphic/illustration at the top
- **Weather-driven background:** Fetched from Open-Meteo based on event date + location. Styles the card background to indicate:
  - Sunny / clear
  - Cloudy
  - Rainy
  - Cold
  - Windy
  - (Graceful fallback if weather unavailable — default braai vibe)
- Event title / description
- Date and time (or date poll if not yet confirmed)
- Location with embedded map + "Get Directions" link
- Organiser name + profile link
- Supply list (what's sorted, what's still needed)
- Event options (kids policy, etc.)
- Etiquette link (if enabled)
- **RSVP section**
- **Calendar download button** (.ics)
- **Share button** (generates WhatsApp share link with Open Graph preview)

#### Open Graph Meta Tags
When the invite link is shared on WhatsApp/social media, it should render a rich preview:
- Title: "Kom Braai! 🔥" (or custom event title)
- Description: Date, time, location summary
- Image: Generated or static braai-themed OG image

#### RSVP Flow
1. Attendee enters a display name
2. Selects attendee count (1 by default, can increase for +1, +2, etc.)
3. In shared/potjie mode: can claim available supply items
4. Submits — sees confirmation
5. Can update/cancel their RSVP by revisiting the link (tracked via browser cookie or local storage with name match)

### 5. Date Poll

When organiser selects "Date Poll" mode:
- Organiser proposes 2-5 date options
- Invite card shows the dates as a voting interface
- Attendees (after entering their name) tap which dates work for them
- Organiser sees vote tallies on their dashboard
- Organiser confirms a date → poll converts to fixed-date event
- All voters see the confirmed date on next visit

### 6. Organiser Dashboard

Accessible after Google sign-in. Contains:

#### My Braais List
- List of all braais (active, upcoming, past, cancelled)
- Status badges: Draft / Active / Completed / Cancelled
- Quick actions: View, Edit, Cancel, Copy invite link

#### Per-Braai Detail View
- Full event details (editable)
- **RSVP list:** Name, attendee count, claimed items per attendee
- **Total headcount** (sum of all attendee counts)
- **Supply overview:** Items sorted vs still needed, who claimed what
- **Date poll results** (if in poll mode): Vote counts per date, confirm button
- **Cancel braai:** Generates a cancellation notice
  - The original invite link shows "Cancelled" state
  - A shareable cancellation link is generated for the organiser to send out
  - Cancellation page shows a styled card (sad braai vibe — rain clouds, extinguished fire)

### 7. Braai Etiquette Page

A standalone, witty, illustrated guide to braai culture for non-South Africans. Linked from invite cards when the organiser enables it.

Content includes (written in a fun, tongue-in-cheek tone):
- Never touch another man's braai (the cardinal rule)
- Don't ask "is it done yet?"
- The braai master's word is final
- Bring more than you'll drink
- Wors goes on first, always
- Don't call it a barbecue
- The fire is not "too big"
- Potjie protocol (don't stir someone else's pot)
- What to bring if you're told "just bring yourself"
- The correct response to "the fire's ready" (it's never ready when you think it is)

This page is static content but should be fun, well-designed, and shareable on its own.

### 8. Calendar Download

- Generate .ics file on the server (API route)
- Contains: event title, date/time, location (with Google Maps link), description
- Works with Google Calendar, Apple Calendar, Outlook
- Download button on the invite card

### 9. Share via WhatsApp

- "Share" button on invite card generates a `wa.me` deep link
- Pre-filled message: "Kom Braai! 🔥 [event title] on [date] — [invite link]"
- The invite link renders a rich Open Graph preview in WhatsApp

---

## Data Model

### Tables

#### `organisers`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, matches Supabase auth.users.id |
| display_name | text | |
| nickname | text | nullable |
| avatar_url | text | |
| fire_preference | text | 'wood' / 'gas' / 'both' |
| braai_title | text | from predefined list |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `braais`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| organiser_id | uuid | FK → organisers.id |
| slug | text | unique, URL-friendly identifier |
| title | text | |
| description | text | nullable |
| date_mode | text | 'fixed' / 'poll' |
| event_date | timestamptz | nullable (null until confirmed if poll) |
| event_time | time | nullable |
| venue_name | text | |
| venue_address | text | |
| venue_lat | float | |
| venue_lng | float | |
| supply_mode | text | 'byo' / 'shared' |
| max_attendees | int | nullable |
| event_options | jsonb | flexible key-value for toggles |
| status | text | 'draft' / 'active' / 'cancelled' / 'completed' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `date_poll_options`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| braai_id | uuid | FK → braais.id |
| proposed_date | date | |
| created_at | timestamptz | |

#### `date_poll_votes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| poll_option_id | uuid | FK → date_poll_options.id |
| voter_name | text | |
| created_at | timestamptz | |

#### `supply_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| braai_id | uuid | FK → braais.id |
| item_name | text | |
| category | text | from predefined categories |
| provided_by | text | 'organiser' / 'needed' / 'claimed' |
| claimed_by_name | text | nullable (attendee name) |
| created_at | timestamptz | |

#### `rsvps`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| braai_id | uuid | FK → braais.id |
| attendee_name | text | |
| attendee_count | int | default 1 (includes +1s) |
| status | text | 'attending' / 'cancelled' |
| browser_token | text | for re-identification without auth |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Row Level Security (RLS)

- `organisers`: Users can only read/write their own row
- `braais`: Organiser can CRUD their own. Public can read active braais by slug.
- `rsvps`: Public can insert (RSVP). Organiser can read all for their braais. Attendee can update their own (via browser_token).
- `supply_items`: Public can read. Public can update `claimed_by_name` where `provided_by = 'needed'`. Organiser can CRUD for their braais.
- `date_poll_options`: Public can read. Organiser can CRUD.
- `date_poll_votes`: Public can insert. Organiser can read.

---

## Pages / Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page — brief explainer + "Create a Braai" CTA |
| `/login` | Public | Google OAuth sign-in |
| `/dashboard` | Auth | Organiser's braai list |
| `/dashboard/create` | Auth | Create new braai form |
| `/dashboard/braai/[id]` | Auth | Braai detail/management view |
| `/dashboard/profile` | Auth | Edit organiser profile |
| `/braai/[slug]` | Public | Invite card (the main public page) |
| `/braai/[slug]/cancel` | Public | Cancellation notice card |
| `/etiquette` | Public | Braai etiquette guide |
| `/api/calendar/[braai-id]` | Public | .ics file download |

---

## External APIs

| Service | Purpose | Auth |
|---------|---------|------|
| Supabase | DB, Auth, Realtime | Project keys (env vars) |
| Open-Meteo | Weather forecast for event date/location | None (free) |
| Google Maps | Embed map + directions link on invite | API key (env var) |

---

## Non-Functional Requirements

- **Mobile-first responsive design** — invite card must look great on phone screens
- **Fast initial load** — invite page should be server-rendered for instant display + OG tags
- **Accessible** — semantic HTML, sufficient contrast, keyboard navigable
- **SEO for invite pages** — dynamic OG meta tags per braai for WhatsApp/social previews
- **No personal data stored for attendees beyond name** — GDPR-light by design
