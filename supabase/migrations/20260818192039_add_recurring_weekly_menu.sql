create table public.weekly_menu_templates (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  meal_period public.meal_period not null,
  name text not null check (char_length(trim(name)) > 0),
  description text not null default '',
  price numeric(10,2) not null check (price > 0),
  category text not null default 'Meal',
  cutoff_time time not null,
  is_available boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.menu_items
  add column template_id uuid references public.weekly_menu_templates(id) on delete set null,
  add column is_override boolean not null default false;

create unique index menu_items_template_date_unique
  on public.menu_items (template_id, service_date)
  where template_id is not null;
create index weekly_menu_templates_weekday_idx
  on public.weekly_menu_templates (weekday, meal_period);

alter table public.weekly_menu_templates enable row level security;

create policy "Signed-in users can read weekly menu templates"
  on public.weekly_menu_templates for select to authenticated using (true);
create policy "Officers can create weekly menu templates"
  on public.weekly_menu_templates for insert to authenticated with check (private.is_officer());
create policy "Officers can update weekly menu templates"
  on public.weekly_menu_templates for update to authenticated
  using (private.is_officer()) with check (private.is_officer());
create policy "Officers can delete weekly menu templates"
  on public.weekly_menu_templates for delete to authenticated using (private.is_officer());

grant select, insert, update, delete on public.weekly_menu_templates to authenticated;

create or replace function private.materialize_weekly_menu(days_ahead integer default 56)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  affected integer;
begin
  if days_ahead < 1 or days_ahead > 180 then
    raise exception 'days_ahead must be between 1 and 180';
  end if;

  insert into public.menu_items (
    service_date, meal_period, name, description, price, category,
    cutoff_time, is_available, created_by, template_id, is_override
  )
  select
    day_value::date, template.meal_period, template.name, template.description,
    template.price, template.category, template.cutoff_time,
    template.is_available, template.created_by, template.id, false
  from generate_series(current_date, current_date + days_ahead, interval '1 day') as day_value
  join public.weekly_menu_templates template
    on template.weekday = extract(dow from day_value)::smallint
  on conflict (template_id, service_date) where template_id is not null
  do update set
    meal_period = excluded.meal_period,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    category = excluded.category,
    cutoff_time = excluded.cutoff_time,
    is_available = excluded.is_available,
    updated_at = now()
  where not public.menu_items.is_override;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function public.refresh_weekly_menu(days_ahead integer default 56)
returns integer
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_officer() then
    raise exception 'Only a mess officer can publish the weekly menu';
  end if;
  return private.materialize_weekly_menu(days_ahead);
end;
$$;

revoke all on function private.materialize_weekly_menu(integer) from public, anon, authenticated;
revoke all on function public.refresh_weekly_menu(integer) from public, anon;
grant execute on function public.refresh_weekly_menu(integer) to authenticated;

create extension if not exists pg_cron;
select cron.schedule(
  'cvmess-refresh-weekly-menu',
  '15 0 * * *',
  'select private.materialize_weekly_menu(56);'
);

select private.materialize_weekly_menu(56);

alter publication supabase_realtime add table public.weekly_menu_templates;
