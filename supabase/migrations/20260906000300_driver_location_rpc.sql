-- Controlled foreground-web driver location updates.

create or replace function public.update_driver_location(
  p_order_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy double precision default null,
  p_heading double precision default null,
  p_speed double precision default null,
  p_recorded_at timestamptz default now()
)
returns public.driver_locations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_driver_id uuid := auth.uid();
  v_location public.driver_locations%rowtype;
begin
  if v_driver_id is null then
    raise exception 'Authentication is required to update driver location.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_driver_id
      and p.role = 'driver'
  ) then
    raise exception 'Only drivers can update delivery location.';
  end if;

  if p_latitude is null or p_latitude < -90 or p_latitude > 90 then
    raise exception 'Invalid latitude.';
  end if;

  if p_longitude is null or p_longitude < -180 or p_longitude > 180 then
    raise exception 'Invalid longitude.';
  end if;

  if p_accuracy is not null and p_accuracy < 0 then
    raise exception 'Invalid accuracy.';
  end if;

  if p_speed is not null and p_speed < 0 then
    raise exception 'Invalid speed.';
  end if;

  if p_heading is not null and (p_heading < 0 or p_heading > 360) then
    raise exception 'Invalid heading.';
  end if;

  if not exists (
    select 1
    from public.pickup_orders po
    where po.id = p_order_id
      and po.assigned_driver_id = v_driver_id
      and po.status in ('picked_up', 'in_transit')
  ) then
    raise exception 'This order is not active for driver location tracking.';
  end if;

  insert into public.driver_locations (
    order_id,
    driver_id,
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
    recorded_at
  )
  values (
    p_order_id,
    v_driver_id,
    p_latitude,
    p_longitude,
    p_accuracy,
    p_heading,
    p_speed,
    coalesce(p_recorded_at, now())
  )
  on conflict (order_id)
  do update set
    driver_id = excluded.driver_id,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    accuracy = excluded.accuracy,
    heading = excluded.heading,
    speed = excluded.speed,
    recorded_at = excluded.recorded_at
  returning * into v_location;

  return v_location;
end;
$$;

revoke execute on function public.update_driver_location(
  uuid,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  timestamptz
) from public, anon, authenticated;

grant execute on function public.update_driver_location(
  uuid,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  timestamptz
) to authenticated;
