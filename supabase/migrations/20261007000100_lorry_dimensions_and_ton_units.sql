-- Add lorry deck dimensions. Existing weight/capacity columns keep their
-- database names for compatibility, but the app now captures/displays tons.

alter table public.lorries
add column if not exists length_ft numeric,
add column if not exists width_ft numeric;

alter table public.lorries
drop constraint if exists lorries_length_ft_positive,
add constraint lorries_length_ft_positive check (length_ft is null or length_ft > 0);

alter table public.lorries
drop constraint if exists lorries_width_ft_positive,
add constraint lorries_width_ft_positive check (width_ft is null or width_ft > 0);

grant insert (
  length_ft,
  width_ft
) on public.lorries to authenticated;

grant update (
  length_ft,
  width_ft
) on public.lorries to authenticated;
