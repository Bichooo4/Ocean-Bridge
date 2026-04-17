create or replace function public.run_trip_status_automation()
returns void language plpgsql security definer as $$
begin

  update public.trips
  set status = 'out_for_delivery'
  where departure_date = current_date
    and status in ('open', 'full')
    and exists (
      select 1 from public.bookings
      where bookings.trip_id = trips.id
        and bookings.status = 'approved'
    );

  update public.bookings
  set status = 'out_for_delivery',
      updated_at = now()
  where status = 'approved'
    and trip_id in (
      select id from public.trips where departure_date = current_date
    );

  insert into public.booking_status_history (booking_id, updated_by, status, notes)
  select id, null, 'out_for_delivery', 'automated: departure date reached'
  from public.bookings
  where status = 'out_for_delivery'
    and trip_id in (
      select id from public.trips where departure_date = current_date
    );

  update public.trips
  set status = 'delivered'
  where arrival_date = current_date
    and status = 'out_for_delivery';

  update public.bookings
  set status = 'delivered',
      updated_at = now()
  where status = 'out_for_delivery'
    and trip_id in (
      select id from public.trips where arrival_date = current_date
    );

  insert into public.booking_status_history (booking_id, updated_by, status, notes)
  select id, null, 'delivered', 'automated: arrival date reached'
  from public.bookings
  where status = 'delivered'
    and trip_id in (
      select id from public.trips where arrival_date = current_date
    );

end;
$$;

select cron.schedule(
  'trip-status-automation',
  '0 0 * * *',
  $$ select public.run_trip_status_automation(); $$
);
