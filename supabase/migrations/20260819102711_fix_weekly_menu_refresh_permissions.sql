alter table public.menu_items
  drop constraint if exists menu_items_service_date_meal_period_key;

create or replace function public.refresh_weekly_menu(days_ahead integer default 56)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected integer;
begin
  if not private.is_officer() then
    raise exception 'Only a mess officer can publish the weekly menu';
  end if;
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

revoke all on function public.refresh_weekly_menu(integer) from public, anon;
grant execute on function public.refresh_weekly_menu(integer) to authenticated;

select private.materialize_weekly_menu(56);
