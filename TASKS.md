# TASKS.md — Kom Braai Build Plan

## Prerequisites

Before starting, ensure:
- [ ] Supabase project created (note project URL + anon key + service role key)
- [ ] Google OAuth configured in Supabase Auth dashboard
- [ ] Google Maps API key obtained (Maps Embed API enabled)
- [ ] Vercel account ready for deployment

---

## Phase 1: Project Scaffolding & Database

**Goal:** Working Next.js app with Supabase connected, database schema deployed, and basic project structure in place.

### Tasks

- [ ] **1.1** Initialize Next.js 14+ project with TypeScript, Tailwind CSS, App Router
  - `npx create-next-app@latest kom-braai --typescript --tailwind --app --src-dir`
- [ ] **1.2** Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react`
- [ ] **1.3** Set up shadcn/ui: `npx shadcn-ui@latest init` + install base components (button, input, card, dialog, badge, toast, select, checkbox)
- [ ] **1.4** Create project folder structure as defined in CLAUDE.md
- [ ] **1.5** Configure environment variables (`.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] **1.6** Set up Supabase clients:
  - `lib/supabase/client.ts` (browser client)
  - `lib/supabase/server.ts` (server client using cookies)
- [ ] **1.7** Create Supabase migration for full database schema:
  - All tables: `organisers`, `braais`, `date_poll_options`, `date_poll_votes`, `supply_items`, `rsvps`
  - Indexes on: `braais.slug`, `braais.organiser_id`, `rsvps.braai_id`, `supply_items.braai_id`
  - RLS policies as defined in SPEC.md
- [ ] **1.8** Generate TypeScript types from Supabase schema: `supabase gen types typescript`
- [ ] **1.9** Create `lib/types/` with application-level types (BraaiWithDetails, RsvpWithClaims, etc.)
- [ ] **1.10** Create `lib/config/event-options.ts` with predefined supply items, braai titles, fire preferences, and event option definitions

**Checkpoint:** App runs locally, connects to Supabase, schema is deployed.

---

## Phase 2: Authentication & Organiser Profile

**Goal:** Organisers can sign in with Google and set up their profile.

### Tasks

- [ ] **2.1** Create auth middleware (`middleware.ts`) to protect `/dashboard/*` routes
- [ ] **2.2** Build `/login` page with Google OAuth button (uses Supabase Auth)
- [ ] **2.3** Create auth callback route handler (`/api/auth/callback`)
- [ ] **2.4** Build organiser repository (`lib/repositories/organiser-repository.ts`):
  - `getOrganiserById`, `createOrganiser`, `updateOrganiser`
- [ ] **2.5** Build organiser service (`lib/services/organiser-service.ts`):
  - `getOrCreateOrganiser` (auto-creates profile on first sign-in from Google data)
  - `updateProfile`
- [ ] **2.6** Build `/dashboard/profile` page:
  - Edit display name, nickname, avatar
  - Select fire preference (Wood / Gas / Both)
  - Select braai title from predefined list
  - Server Action for save
- [ ] **2.7** Build basic `/dashboard` layout with nav (My Braais, Profile, Sign Out)
- [ ] **2.8** Implement sign-out flow

**Checkpoint:** Full auth flow works. Organiser can sign in, see dashboard, edit profile.

---

## Phase 3: Create Braai Event

**Goal:** Organisers can create a braai with all options.

### Tasks

- [ ] **3.1** Build braai repository (`lib/repositories/braai-repository.ts`):
  - `createBraai`, `getBraaiById`, `getBraaiBySlug`, `getBraaisByOrganiser`, `updateBraai`, `cancelBraai`
- [ ] **3.2** Build supply items repository (`lib/repositories/supply-repository.ts`):
  - `createSupplyItems`, `getSupplyItemsByBraai`, `claimItem`, `unclaimItem`
- [ ] **3.3** Build date poll repository (`lib/repositories/date-poll-repository.ts`):
  - `createPollOptions`, `getPollOptions`, `addVote`, `getVoteTallies`, `confirmDate`
- [ ] **3.4** Build braai service (`lib/services/braai-service.ts`):
  - `createBraai` (generates slug, creates braai + supply items + poll options in transaction)
  - `cancelBraai` (updates status)
  - `confirmPollDate` (sets event_date, changes date_mode to fixed)
- [ ] **3.5** Build slug generator utility (`lib/utils/slug.ts`) — fun braai-themed slugs (e.g., `lekker-vuur-7f3a`)
- [ ] **3.6** Build `/dashboard/create` page — multi-step or single-page form:
  - Step/Section 1: Title, description, date mode (fixed date picker OR date poll with 2-5 date inputs)
  - Step/Section 2: Location (venue name + Google Maps address/place picker)
  - Step/Section 3: Supply mode selection + item list (predefined checkboxes + custom items)
  - Step/Section 4: Event options (configurable toggles from config)
  - Step/Section 5: Review + Create
  - Server Action for submission
- [ ] **3.7** Build Google Maps place/address picker component (using Maps JavaScript API or simple address autocomplete)
- [ ] **3.8** Validate all form inputs with Zod schemas

**Checkpoint:** Organiser can create a fully configured braai event with all options.

---

## Phase 4: Invite Card (Public Page)

**Goal:** The hero feature — a beautiful, functional invite page that anyone can view without auth.

### Tasks

- [ ] **4.1** Build weather service (`lib/services/weather-service.ts`):
  - Fetch forecast from Open-Meteo API based on lat/lng + date
  - Return simplified weather state: sunny, cloudy, rainy, cold, windy
  - Cache response (revalidate every few hours)
- [ ] **4.2** Build weather background component (`components/braai/weather-background.tsx`):
  - Dynamic background styling based on weather state
  - Fallback default braai vibe if weather unavailable
- [ ] **4.3** Build invite card page (`/braai/[slug]/page.tsx`) — server-rendered:
  - Fetch braai by slug
  - Fetch weather data
  - Render full invite card with all details
- [ ] **4.4** Build invite card component (`components/braai/invite-card.tsx`):
  - Weather-driven background
  - Braai graphic/illustration header
  - Event title, description, date/time
  - Location with embedded Google Map + "Get Directions" link
  - Organiser profile link (name, braai title, avatar)
  - Supply list display
  - Event options display (kids policy, etc.)
  - Etiquette link (if enabled)
- [ ] **4.5** Build RSVP component (`components/braai/rsvp-form.tsx`):
  - Name input
  - Attendee count selector (+/- buttons)
  - In shared mode: claimable supply items list
  - Submit button
  - Server Action for RSVP creation
  - Browser token generation + cookie storage for return visits
- [ ] **4.6** Build RSVP repository (`lib/repositories/rsvp-repository.ts`):
  - `createRsvp`, `updateRsvp`, `getRsvpsByBraai`, `getRsvpByToken`
- [ ] **4.7** Build RSVP service (`lib/services/rsvp-service.ts`):
  - `submitRsvp` (creates RSVP + claims items in one go)
  - `updateRsvp`, `cancelRsvp`
  - Headcount validation against max_attendees
- [ ] **4.8** Handle return visitors: detect browser token, show their existing RSVP with edit/cancel options
- [ ] **4.9** Build date poll voting UI (shown instead of fixed date when braai is in poll mode):
  - List of proposed dates with tap-to-vote
  - Show current vote counts
  - Server Action for vote submission
- [ ] **4.10** Build cancelled state view — if braai status is 'cancelled', show a styled cancellation card
- [ ] **4.11** Set up dynamic Open Graph meta tags for the invite page:
  - `generateMetadata` in page.tsx
  - Title, description, OG image (static braai-themed image for v1)
- [ ] **4.12** Build WhatsApp share button:
  - Generates `wa.me` deep link with pre-filled message
  - Includes event title, date, and invite URL

**Checkpoint:** Full invite card works. Anyone can open a link, see braai details, RSVP, claim items, vote on dates, share on WhatsApp.

---

## Phase 5: Calendar Download

**Goal:** Attendees can save the braai to their calendar.

### Tasks

- [ ] **5.1** Build calendar service (`lib/services/calendar-service.ts`):
  - Generate .ics file content from braai data
  - Include: SUMMARY, DTSTART, DTEND, LOCATION (with Google Maps URL), DESCRIPTION
- [ ] **5.2** Build API route (`/api/calendar/[braai-id]/route.ts`):
  - Fetch braai data
  - Generate .ics
  - Return as file download (`Content-Type: text/calendar`)
- [ ] **5.3** Add "Save to Calendar" button on invite card

**Checkpoint:** Calendar download works for Google Calendar, Apple Calendar, and Outlook.

---

## Phase 6: Organiser Dashboard

**Goal:** Organisers can view and manage their braais.

### Tasks

- [ ] **6.1** Build `/dashboard` page — My Braais list:
  - Cards showing: title, date, status badge, headcount, quick actions
  - Filter/sort: active, upcoming, past, cancelled
  - "Copy invite link" button per braai
  - "Create new braai" CTA
- [ ] **6.2** Build `/dashboard/braai/[id]` page — braai management view:
  - Full event details (with edit capability)
  - RSVP list table (name, count, claimed items, timestamp)
  - Total headcount display
  - Supply overview (items grid: who's bringing what, what's still needed)
- [ ] **6.3** Build date poll management (shown when date_mode is 'poll'):
  - Vote tally per date
  - "Confirm this date" button → converts to fixed date event
- [ ] **6.4** Build cancel braai flow:
  - Confirmation dialog
  - Updates status to 'cancelled'
  - Generates shareable cancellation link (`/braai/[slug]/cancel`)
  - Shows the cancellation link for organiser to copy/share
- [ ] **6.5** Build edit braai flow:
  - Reuses create form components in edit mode
  - Server Action for updates
- [ ] **6.6** Build cancellation page (`/braai/[slug]/cancel`):
  - Styled card with sad braai vibe (rain, extinguished fire)
  - Shows event name and cancellation notice
  - WhatsApp share button for the cancellation

**Checkpoint:** Full dashboard CRUD. Organiser can manage everything from one place.

---

## Phase 7: Etiquette Page

**Goal:** A fun, standalone braai etiquette guide.

### Tasks

- [ ] **7.1** Build `/etiquette` page:
  - Well-designed, illustrated page with witty braai rules
  - Tongue-in-cheek tone, fun for non-SA readers
  - Content as defined in SPEC.md
  - Shareable (has its own OG tags)
- [ ] **7.2** Add etiquette link to invite cards where organiser enabled it

**Checkpoint:** Etiquette page is live, linked from invite cards, and shareable.

---

## Phase 8: Polish & Deploy

**Goal:** Production-ready MVP.

### Tasks

- [ ] **8.1** Mobile responsiveness pass — test all pages on small screens
- [ ] **8.2** Loading states — skeleton loaders for dashboard, loading spinners for actions
- [ ] **8.3** Error handling — toast notifications for all user actions, graceful error states
- [ ] **8.4** Empty states — "No braais yet" with CTA, empty RSVP list, etc.
- [ ] **8.5** Landing page (`/`) — brief, compelling explainer + "Create a Braai" button
- [ ] **8.6** SEO basics — meta tags, favicon, manifest.json
- [ ] **8.7** Realtime RSVP updates on invite card (Supabase Realtime subscription)
- [ ] **8.8** Rate limiting on public endpoints (RSVP, poll votes) — basic protection
- [ ] **8.9** Deploy to Vercel — configure env vars, custom domain if available
- [ ] **8.10** Smoke test all flows end-to-end:
  - Sign in → create braai → share link → RSVP as attendee → claim items → view dashboard → cancel braai

**Checkpoint:** MVP is live and usable. Share with mates. Light the fire. 🔥
