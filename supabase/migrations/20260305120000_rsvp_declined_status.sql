-- Add 'declined' as a valid RSVP status so guests can proactively say they can't make it

alter table public.rsvps
  drop constraint rsvps_status_check,
  add constraint rsvps_status_check
    check (status in ('attending', 'cancelled', 'declined'));
