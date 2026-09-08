-- Tighten driver lifecycle RPC validation after the initial schema was applied.

create or replace function public.mark_order_picked_up(p_order_id uuid)
returns public.pickup_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_driver_id uuid := auth.uid();
  v_order public.pickup_orders%rowtype;
begin
  if v_driver_id is null then
    raise exception 'Authentication is required to update pickup status.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_driver_id
      and p.role = 'driver'
  ) then
    raise exception 'Only drivers can update pickup status.';
  end if;

  update public.pickup_orders
  set
    status = 'picked_up',
    picked_up_at = now()
  where id = p_order_id
    and assigned_driver_id = v_driver_id
    and status = 'accepted'
  returning * into v_order;

  if not found then
    raise exception 'Pickup order cannot be marked as picked up.';
  end if;

  return v_order;
end;
$$;

create or replace function public.mark_order_in_transit(p_order_id uuid)
returns public.pickup_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_driver_id uuid := auth.uid();
  v_order public.pickup_orders%rowtype;
begin
  if v_driver_id is null then
    raise exception 'Authentication is required to update pickup status.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_driver_id
      and p.role = 'driver'
  ) then
    raise exception 'Only drivers can update pickup status.';
  end if;

  update public.pickup_orders
  set
    status = 'in_transit',
    in_transit_at = now()
  where id = p_order_id
    and assigned_driver_id = v_driver_id
    and status = 'picked_up'
  returning * into v_order;

  if not found then
    raise exception 'Pickup order cannot be marked as in transit.';
  end if;

  return v_order;
end;
$$;

create or replace function public.mark_order_delivered(p_order_id uuid)
returns public.pickup_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_driver_id uuid := auth.uid();
  v_order public.pickup_orders%rowtype;
begin
  if v_driver_id is null then
    raise exception 'Authentication is required to update pickup status.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_driver_id
      and p.role = 'driver'
  ) then
    raise exception 'Only drivers can update pickup status.';
  end if;

  update public.pickup_orders
  set
    status = 'delivered',
    delivered_at = now()
  where id = p_order_id
    and assigned_driver_id = v_driver_id
    and status = 'in_transit'
  returning * into v_order;

  if not found then
    raise exception 'Pickup order cannot be marked as delivered.';
  end if;

  if v_order.assigned_lorry_id is not null then
    update public.lorries
    set status = 'available'
    where id = v_order.assigned_lorry_id;
  end if;

  delete from public.driver_locations
  where order_id = p_order_id;

  return v_order;
end;
$$;

revoke execute on function public.mark_order_picked_up(uuid) from public, anon, authenticated;
revoke execute on function public.mark_order_in_transit(uuid) from public, anon, authenticated;
revoke execute on function public.mark_order_delivered(uuid) from public, anon, authenticated;

grant execute on function public.mark_order_picked_up(uuid) to authenticated;
grant execute on function public.mark_order_in_transit(uuid) to authenticated;
grant execute on function public.mark_order_delivered(uuid) to authenticated;
