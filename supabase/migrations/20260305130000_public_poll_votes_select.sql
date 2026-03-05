-- Allow anyone to read date poll votes so guests can see the vote counts on the invite page

create policy "date_poll_votes_select_public"
  on public.date_poll_votes for select
  to anon, authenticated
  using (true);
