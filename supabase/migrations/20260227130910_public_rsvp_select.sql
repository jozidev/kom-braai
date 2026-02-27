-- Allow anyone to read RSVPs.
-- Required for two reasons:
-- 1. The INSERT + RETURNING in createRsvp needs a SELECT policy so the
--    newly created row can be read back by the anonymous submitter.
-- 2. The public invite page needs to show attendee counts and names to guests.
create policy "rsvps_select_public"
  on public.rsvps for select
  to anon, authenticated
  using (true);
