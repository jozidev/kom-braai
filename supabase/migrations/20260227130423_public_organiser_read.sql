-- Allow anyone to read organiser profiles.
-- This is needed so that the public invite page can display the organiser's
-- name, avatar, and braai title when a guest visits without an account.
create policy "organisers_select_public"
  on public.organisers for select
  to anon, authenticated
  using (true);
