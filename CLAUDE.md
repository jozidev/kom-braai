# CLAUDE.md — Kom Braai

## Project Overview

Kom Braai is a social event app for South African expats to organise braais (barbecues) and invite friends via shareable links. Think lightweight Evite meets SA braai culture.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Backend:** Next.js API routes + Server Actions
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth) — organisers only
- **Realtime:** Supabase Realtime (for RSVP updates on invite page)
- **Weather API:** Open-Meteo (free, no API key required)
- **Maps:** Google Maps Embed API (for location on invite card)
- **Hosting:** Vercel (free tier)
- **Calendar:** Generated .ics files for calendar download

## Architecture

### Pattern: Layered Architecture

```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (public)/           # Public routes (invite view, etiquette)
│   ├── (auth)/             # Protected routes (dashboard, create braai)
│   ├── api/                # API routes
│   └── layout.tsx
├── components/             # React components
│   ├── ui/                 # shadcn/ui base components
│   ├── braai/              # Braai-specific components (invite card, supply list, etc.)
│   ├── dashboard/          # Organiser dashboard components
│   └── common/             # Shared components (header, footer, etc.)
├── lib/                    # Core business logic & utilities
│   ├── services/           # Business logic layer (braai, rsvp, weather, calendar)
│   ├── repositories/       # Data access layer (Supabase queries)
│   ├── types/              # TypeScript types & interfaces
│   ├── utils/              # Pure utility functions
│   ├── config/             # App configuration (event options, braai titles, etc.)
│   └── supabase/           # Supabase client setup (server & client)
├── hooks/                  # Custom React hooks
└── styles/                 # Global styles
```

### Key Architectural Decisions

1. **Services call Repositories, never Supabase directly from components**
2. **Server Components by default**, Client Components only when interactivity is needed
3. **Server Actions** for mutations (create braai, RSVP, claim item)
4. **API routes** only where Server Actions don't fit (e.g., .ics file generation)
5. **Event options are config-driven** — stored as a flexible JSON structure so new options can be added without schema changes

## Conventions

### Code Style
- Use `const` by default, `let` only when reassignment is needed
- Prefer named exports over default exports (except page/layout components)
- Use early returns for guard clauses
- Keep functions small and single-purpose
- Use descriptive variable names — no abbreviations

### Naming
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Types/Interfaces: `PascalCase`, prefix interfaces with `I` only if needed to disambiguate
- Database tables: `snake_case`
- Supabase columns: `snake_case`

### TypeScript
- Strict mode enabled
- No `any` — use `unknown` and narrow
- Define types in `lib/types/` and import where needed
- Use Zod for runtime validation of external inputs (API routes, form submissions)

### Components
- One component per file
- Co-locate component-specific types in the same file
- Use shadcn/ui primitives — don't reinvent buttons, dialogs, etc.
- Keep components under 150 lines; extract sub-components if larger

### Database
- All queries go through repository functions in `lib/repositories/`
- Use Supabase's generated types via `supabase gen types typescript`
- Row Level Security (RLS) enabled on all tables
- Migrations managed via Supabase CLI

### Error Handling
- Use try/catch in services, return typed results `{ data, error }`
- Display user-friendly error messages via toast notifications
- Log errors server-side, never expose internal details to client

### Testing
- Focus on service layer tests first
- Use Vitest for unit/integration tests
- Test files live next to source: `braai-service.test.ts`

## Do's
- Keep the UI fun and on-brand (braai culture, SA slang where appropriate)
- Make the invite card visually compelling — it's the core UX
- Ensure the invite page works fully without auth (view + RSVP as anonymous)
- Use Supabase RLS to enforce that organisers can only manage their own braais
- Make event options configurable via `lib/config/event-options.ts`

## Don'ts
- Don't build a friends/connections system (v1 uses invite links only)
- Don't implement push notifications (v1 relies on WhatsApp sharing)
- Don't over-engineer — this is an MVP, not enterprise software
- Don't use client-side Supabase for writes — go through Server Actions
- Don't hardcode event option types — keep them data-driven
