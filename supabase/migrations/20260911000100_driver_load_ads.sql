-- Driver load ads let lorry drivers publish available route/capacity posts.

create table public.driver_load_ads (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  lorry_id uuid references public.lorries(id) on delete set null,
  from_pincode text not null,
  from_address text not null,
  to_pincode text not null,
  to_address text not null,
  available_date date not null,
  capacity_kg numeric not null,
  expected_rate numeric,
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint driver_load_ads_from_pincode_format check (from_pincode ~ '^[1-9][0-9]{5}$'),
  constraint driver_load_ads_to_pincode_format check (to_pincode ~ '^[1-9][0-9]{5}$'),
  constraint driver_load_ads_capacity_kg_positive check (capacity_kg > 0),
  constraint driver_load_ads_expected_rate_nonnegative check (expected_rate is null or expected_rate >= 0),
  constraint driver_load_ads_status_check check (status in ('active', 'closed'))
);

create index driver_load_ads_driver_id_idx on public.driver_load_ads (driver_id);
create index driver_load_ads_status_idx on public.driver_load_ads (status);
create index driver_load_ads_route_idx on public.driver_load_ads (from_pincode, to_pincode);
create index driver_load_ads_available_date_idx on public.driver_load_ads (available_date);

create trigger driver_load_ads_set_updated_at
before update on public.driver_load_ads
for each row execute function public.set_updated_at();

alter table public.driver_load_ads enable row level security;

create policy "driver_load_ads_select_active_or_own"
on public.driver_load_ads
for select
to authenticated
using (
  status = 'active'
  or driver_id = auth.uid()
);

create policy "driver_load_ads_insert_own_driver"
on public.driver_load_ads
for insert
to authenticated
with check (
  driver_id = auth.uid()
  and status = 'active'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'driver'
  )
  and (
    lorry_id is null
    or exists (
      select 1
      from public.lorries l
      where l.id = driver_load_ads.lorry_id
        and l.driver_id = auth.uid()
    )
  )
);

create policy "driver_load_ads_update_own_driver"
on public.driver_load_ads
for update
to authenticated
using (driver_id = auth.uid())
with check (
  driver_id = auth.uid()
  and status in ('active', 'closed')
  and (
    lorry_id is null
    or exists (
      select 1
      from public.lorries l
      where l.id = driver_load_ads.lorry_id
        and l.driver_id = auth.uid()
    )
  )
);

create policy "driver_load_ads_delete_own_driver"
on public.driver_load_ads
for delete
to authenticated
using (driver_id = auth.uid());

grant select on public.driver_load_ads to authenticated;
grant insert (
  driver_id,
  lorry_id,
  from_pincode,
  from_address,
  to_pincode,
  to_address,
  available_date,
  capacity_kg,
  expected_rate,
  notes,
  status
) on public.driver_load_ads to authenticated;
grant update (
  lorry_id,
  from_pincode,
  from_address,
  to_pincode,
  to_address,
  available_date,
  capacity_kg,
  expected_rate,
  notes,
  status
) on public.driver_load_ads to authenticated;
grant delete on public.driver_load_ads to authenticated;
