-- Lorry Link initial database foundation.
-- Apply once through Supabase migrations or the dashboard SQL Editor.

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('customer', 'driver');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.lorry_status as enum ('available', 'busy', 'inactive');
create type public.pickup_status as enum (
  'open',
  'accepted',
  'picked_up',
  'in_transit',
  'delivered',
  'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role public.user_role,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.driver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  driving_license_no text,
  address text,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lorries (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  registration_number text not null,
  vehicle_name text,
  vehicle_type text not null,
  capacity_kg numeric not null,
  vehicle_photo_url text,
  status public.lorry_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lorries_registration_number_key unique (registration_number),
  constraint lorries_capacity_kg_positive check (capacity_kg > 0)
);

create table public.pickup_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  pickup_pincode text not null,
  pickup_address text not null,
  pickup_latitude double precision not null,
  pickup_longitude double precision not null,
  drop_pincode text not null,
  drop_address text not null,
  drop_latitude double precision,
  drop_longitude double precision,
  parcel_name text not null,
  parcel_details text,
  weight_kg numeric not null,
  length_cm numeric,
  width_cm numeric,
  height_cm numeric,
  budget numeric not null,
  status public.pickup_status not null default 'open',
  assigned_driver_id uuid references public.profiles(id) on delete set null,
  assigned_lorry_id uuid references public.lorries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  picked_up_at timestamptz,
  in_transit_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  constraint pickup_orders_pickup_pincode_format check (pickup_pincode ~ '^[1-9][0-9]{5}$'),
  constraint pickup_orders_drop_pincode_format check (drop_pincode ~ '^[1-9][0-9]{5}$'),
  constraint pickup_orders_pickup_latitude_range check (pickup_latitude between -90 and 90),
  constraint pickup_orders_pickup_longitude_range check (pickup_longitude between -180 and 180),
  constraint pickup_orders_drop_latitude_range check (drop_latitude is null or drop_latitude between -90 and 90),
  constraint pickup_orders_drop_longitude_range check (drop_longitude is null or drop_longitude between -180 and 180),
  constraint pickup_orders_weight_kg_positive check (weight_kg > 0),
  constraint pickup_orders_budget_nonnegative check (budget >= 0),
  constraint pickup_orders_length_cm_positive check (length_cm is null or length_cm > 0),
  constraint pickup_orders_width_cm_positive check (width_cm is null or width_cm > 0),
  constraint pickup_orders_height_cm_positive check (height_cm is null or height_cm > 0)
);

create table public.driver_locations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.pickup_orders(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  heading double precision,
  speed double precision,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint driver_locations_latitude_range check (latitude between -90 and 90),
  constraint driver_locations_longitude_range check (longitude between -180 and 180),
  constraint driver_locations_accuracy_nonnegative check (accuracy is null or accuracy >= 0),
  constraint driver_locations_heading_range check (heading is null or heading between 0 and 360)
);

create index profiles_role_idx on public.profiles (role);
create index lorries_driver_id_idx on public.lorries (driver_id);
create index lorries_status_idx on public.lorries (status);
create index pickup_orders_customer_id_idx on public.pickup_orders (customer_id);
create index pickup_orders_status_idx on public.pickup_orders (status);
create index pickup_orders_assigned_driver_id_idx on public.pickup_orders (assigned_driver_id);
create index pickup_orders_assigned_lorry_id_idx on public.pickup_orders (assigned_lorry_id);
create index pickup_orders_created_at_idx on public.pickup_orders (created_at desc);
create index pickup_orders_pickup_pincode_idx on public.pickup_orders (pickup_pincode);
create index pickup_orders_drop_pincode_idx on public.pickup_orders (drop_pincode);
create index driver_locations_driver_id_idx on public.driver_locations (driver_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger driver_profiles_set_updated_at
before update on public.driver_profiles
for each row execute function public.set_updated_at();

create trigger lorries_set_updated_at
before update on public.lorries
for each row execute function public.set_updated_at();

create trigger pickup_orders_set_updated_at
before update on public.pickup_orders
for each row execute function public.set_updated_at();

create trigger driver_locations_set_updated_at
before update on public.driver_locations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.user_role;
begin
  v_role :=
    case
      when new.raw_user_meta_data ->> 'role' = 'customer' then 'customer'::public.user_role
      when new.raw_user_meta_data ->> 'role' = 'driver' then 'driver'::public.user_role
      else null
    end;

  insert into public.profiles (
    id,
    full_name,
    phone,
    email,
    role,
    avatar_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'phone',
    new.email,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.lorries enable row level security;
alter table public.pickup_orders enable row level security;
alter table public.driver_locations enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_update_own_safe_fields"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "driver_profiles_select_own"
on public.driver_profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "driver_profiles_insert_own_driver"
on public.driver_profiles
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
);

create policy "driver_profiles_update_own_driver"
on public.driver_profiles
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
);

create policy "lorries_select_own_or_assigned_customer"
on public.lorries
for select
to authenticated
using (
  driver_id = auth.uid()
  or exists (
    select 1
    from public.pickup_orders po
    where po.assigned_lorry_id = lorries.id
      and po.customer_id = auth.uid()
  )
);

create policy "lorries_insert_own_driver"
on public.lorries
for insert
to authenticated
with check (
  driver_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
);

create policy "lorries_update_own_driver"
on public.lorries
for update
to authenticated
using (
  driver_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
)
with check (
  driver_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
);

create policy "lorries_delete_own_driver"
on public.lorries
for delete
to authenticated
using (
  driver_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
);

create policy "pickup_orders_select_customer_own"
on public.pickup_orders
for select
to authenticated
using (customer_id = auth.uid());

create policy "pickup_orders_select_driver_discover_open"
on public.pickup_orders
for select
to authenticated
using (
  status = 'open'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
);

create policy "pickup_orders_select_assigned_driver"
on public.pickup_orders
for select
to authenticated
using (assigned_driver_id = auth.uid());

create policy "pickup_orders_insert_own_customer_open"
on public.pickup_orders
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and status = 'open'
  and assigned_driver_id is null
  and assigned_lorry_id is null
  and accepted_at is null
  and picked_up_at is null
  and in_transit_at is null
  and delivered_at is null
  and cancelled_at is null
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'customer'
  )
);

create policy "driver_locations_select_customer_or_assigned_driver"
on public.driver_locations
for select
to authenticated
using (
  exists (
    select 1
    from public.pickup_orders po
    where po.id = driver_locations.order_id
      and (
        po.customer_id = auth.uid()
        or po.assigned_driver_id = auth.uid()
      )
  )
);

create policy "driver_locations_insert_assigned_active_driver"
on public.driver_locations
for insert
to authenticated
with check (
  driver_id = auth.uid()
  and exists (
    select 1
    from public.pickup_orders po
    where po.id = order_id
      and po.assigned_driver_id = auth.uid()
      and po.status in ('picked_up', 'in_transit')
  )
);

create policy "driver_locations_update_assigned_active_driver"
on public.driver_locations
for update
to authenticated
using (
  driver_id = auth.uid()
  and exists (
    select 1
    from public.pickup_orders po
    where po.id = driver_locations.order_id
      and po.assigned_driver_id = auth.uid()
      and po.status in ('picked_up', 'in_transit')
  )
)
with check (
  driver_id = auth.uid()
  and exists (
    select 1
    from public.pickup_orders po
    where po.id = order_id
      and po.assigned_driver_id = auth.uid()
      and po.status in ('picked_up', 'in_transit')
  )
);

create or replace function public.set_initial_user_role(p_role public.user_role)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to choose a role.';
  end if;

  update public.profiles
  set role = p_role
  where id = v_user_id
    and role is null
  returning * into v_profile;

  if not found then
    raise exception 'Role is already set or profile does not exist.';
  end if;

  return v_profile;
end;
$$;

create or replace function public.accept_pickup_order(
  p_order_id uuid,
  p_lorry_id uuid
)
returns public.pickup_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_driver_id uuid := auth.uid();
  v_lorry_status public.lorry_status;
  v_order public.pickup_orders%rowtype;
begin
  if v_driver_id is null then
    raise exception 'Authentication is required to accept a pickup order.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_driver_id
      and p.role = 'driver'
  ) then
    raise exception 'Only drivers can accept pickup orders.';
  end if;

  select l.status
  into v_lorry_status
  from public.lorries l
  where l.id = p_lorry_id
    and l.driver_id = v_driver_id
  for update;

  if not found then
    raise exception 'The selected lorry does not belong to this driver.';
  end if;

  if v_lorry_status <> 'available' then
    raise exception 'The selected lorry is not available.';
  end if;

  update public.pickup_orders
  set
    status = 'accepted',
    assigned_driver_id = v_driver_id,
    assigned_lorry_id = p_lorry_id,
    accepted_at = now()
  where id = p_order_id
    and status = 'open'
    and assigned_driver_id is null
    and assigned_lorry_id is null
  returning * into v_order;

  if not found then
    raise exception 'Pickup order is no longer available.';
  end if;

  update public.lorries
  set status = 'busy'
  where id = p_lorry_id
    and driver_id = v_driver_id;

  return v_order;
end;
$$;

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

  update public.pickup_orders
  set
    status = 'delivered',
    delivered_at = now()
  where id = p_order_id
    and assigned_driver_id = v_driver_id
    and status in ('picked_up', 'in_transit')
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

create or replace function public.cancel_pickup_order(p_order_id uuid)
returns public.pickup_orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer_id uuid := auth.uid();
  v_order public.pickup_orders%rowtype;
begin
  if v_customer_id is null then
    raise exception 'Authentication is required to cancel a pickup order.';
  end if;

  update public.pickup_orders
  set
    status = 'cancelled',
    cancelled_at = now()
  where id = p_order_id
    and customer_id = v_customer_id
    and status in ('open', 'accepted')
  returning * into v_order;

  if not found then
    raise exception 'Pickup order cannot be cancelled.';
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

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  )
  and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'driver_locations'
  ) then
    alter publication supabase_realtime add table public.driver_locations;
  end if;
end;
$$;

revoke all on public.profiles from anon, authenticated;
revoke all on public.driver_profiles from anon, authenticated;
revoke all on public.lorries from anon, authenticated;
revoke all on public.pickup_orders from anon, authenticated;
revoke all on public.driver_locations from anon, authenticated;

grant usage on schema public to authenticated;
grant usage on type public.user_role to authenticated;
grant usage on type public.verification_status to authenticated;
grant usage on type public.lorry_status to authenticated;
grant usage on type public.pickup_status to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

grant select on public.driver_profiles to authenticated;
grant insert (user_id, driving_license_no, address) on public.driver_profiles to authenticated;
grant update (driving_license_no, address) on public.driver_profiles to authenticated;

grant select on public.lorries to authenticated;
grant insert (
  driver_id,
  registration_number,
  vehicle_name,
  vehicle_type,
  capacity_kg,
  vehicle_photo_url
) on public.lorries to authenticated;
grant update (
  registration_number,
  vehicle_name,
  vehicle_type,
  capacity_kg,
  vehicle_photo_url
) on public.lorries to authenticated;
grant delete on public.lorries to authenticated;

grant select on public.pickup_orders to authenticated;
grant insert (
  customer_id,
  pickup_pincode,
  pickup_address,
  pickup_latitude,
  pickup_longitude,
  drop_pincode,
  drop_address,
  drop_latitude,
  drop_longitude,
  parcel_name,
  parcel_details,
  weight_kg,
  length_cm,
  width_cm,
  height_cm,
  budget
) on public.pickup_orders to authenticated;

grant select on public.driver_locations to authenticated;
grant insert (
  order_id,
  driver_id,
  latitude,
  longitude,
  accuracy,
  heading,
  speed,
  recorded_at
) on public.driver_locations to authenticated;
grant update (
  latitude,
  longitude,
  accuracy,
  heading,
  speed,
  recorded_at
) on public.driver_locations to authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.set_initial_user_role(public.user_role) from public, anon, authenticated;
revoke execute on function public.accept_pickup_order(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.mark_order_picked_up(uuid) from public, anon, authenticated;
revoke execute on function public.mark_order_in_transit(uuid) from public, anon, authenticated;
revoke execute on function public.mark_order_delivered(uuid) from public, anon, authenticated;
revoke execute on function public.cancel_pickup_order(uuid) from public, anon, authenticated;

grant execute on function public.set_initial_user_role(public.user_role) to authenticated;
grant execute on function public.accept_pickup_order(uuid, uuid) to authenticated;
grant execute on function public.mark_order_picked_up(uuid) to authenticated;
grant execute on function public.mark_order_in_transit(uuid) to authenticated;
grant execute on function public.mark_order_delivered(uuid) to authenticated;
grant execute on function public.cancel_pickup_order(uuid) to authenticated;
