-- Enable Supabase Realtime on tables that need live updates on the invite page

alter publication supabase_realtime add table public.rsvps;
alter publication supabase_realtime add table public.supply_items;
