-- CVmess initial schema
-- Run through the Supabase SQL editor or `supabase db push`.

create extension if not exists pgcrypto;

-- Keep internal bookkeeping functions outside the Data API's exposed schema.
create schema if not exists private;

create type public.app_role as enum ('member', 'officer');
create type public.meal_period as enum ('Breakfast', 'Lunch', 'Dinner');
create type public.order_status as enum ('pending', 'confirmed', 'rejected', 'cancelled');
create type public.payment_status as enum ('due', 'paid');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null default '',
  room text not null default '',
  role public.app_role not null default 'member',
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  meal_period public.meal_period not null,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price > 0),
  category text not null default 'Meal',
  cutoff_time time not null,
  is_available boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_date, meal_period)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  quantity integer not null default 1 check (quantity between 1 and 10),
  unit_price numeric(10,2) not null default 0,
  total numeric(10,2) generated always as (unit_price * quantity) stored,
  status public.order_status not null default 'pending',
  note text not null default '',
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general' check (type in ('order', 'bill', 'menu', 'general')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  billing_month date not null check (billing_month = date_trunc('month', billing_month)::date),
  status public.payment_status not null default 'due',
  amount_received numeric(10,2),
  paid_at timestamptz,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (user_id, billing_month)
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index menu_items_date_idx on public.menu_items (service_date, meal_period);
create index menu_items_created_by_idx on public.menu_items (created_by);
create index orders_decided_by_idx on public.orders (decided_by);
create index orders_menu_item_idx on public.orders (menu_item_id);
create index payments_recorded_by_idx on public.payments (recorded_by);
create index notifications_user_unread_idx on public.notifications (user_id, is_read, created_at desc);
create unique index one_active_order_per_meal_idx
  on public.orders (user_id, menu_item_id)
  where status in ('pending', 'confirmed');

create or replace function private.is_officer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'officer'
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, phone, room)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'room', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

create or replace function private.prepare_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare selected_item public.menu_items;
begin
  select * into selected_item from public.menu_items where id = new.menu_item_id;
  if selected_item.id is null or not selected_item.is_available then
    raise exception 'This meal is not available to order';
  end if;
  if selected_item.service_date < current_date then
    raise exception 'This meal has already been served';
  end if;
  new.unit_price := selected_item.price;
  new.updated_at := now();
  return new;
end;
$$;

create trigger prepare_order_before_write
  before insert or update of menu_item_id, quantity on public.orders
  for each row execute procedure private.prepare_order();

create or replace function private.notify_order_decision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare meal_name text;
begin
  if old.status = 'pending' and new.status in ('confirmed', 'rejected') then
    select name into meal_name from public.menu_items where id = new.menu_item_id;
    new.decided_by := auth.uid();
    new.decided_at := now();
    insert into public.notifications (user_id, title, message, type)
    values (
      new.user_id,
      case when new.status = 'confirmed' then 'Order confirmed' else 'Order declined' end,
      case when new.status = 'confirmed'
        then 'Your ' || meal_name || ' order has been confirmed and added to your bill.'
        else 'Your ' || meal_name || ' order was declined by the mess officer.' end,
      'order'
    );
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger notify_after_order_decision
  before update of status on public.orders
  for each row execute procedure private.notify_order_decision();

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke all on function private.is_officer() from public, anon;
grant execute on function private.is_officer() to authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.prepare_order() from public, anon, authenticated;
revoke all on function private.notify_order_decision() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;

create policy "Members can read own profile; officers can read all"
  on public.profiles for select to authenticated
  using (id = auth.uid() or private.is_officer());
create policy "Members can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Signed-in users can read the menu"
  on public.menu_items for select to authenticated using (true);
create policy "Officers can create menu items"
  on public.menu_items for insert to authenticated with check (private.is_officer());
create policy "Officers can update menu items"
  on public.menu_items for update to authenticated using (private.is_officer()) with check (private.is_officer());
create policy "Officers can delete menu items"
  on public.menu_items for delete to authenticated using (private.is_officer());

create policy "Members see own orders; officers see all"
  on public.orders for select to authenticated
  using (user_id = auth.uid() or private.is_officer());
create policy "Members create their own pending orders"
  on public.orders for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy "Members can cancel own pending orders"
  on public.orders for update to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'cancelled');
create policy "Officers decide orders"
  on public.orders for update to authenticated
  using (private.is_officer()) with check (private.is_officer());

create policy "Members read their notifications"
  on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "Members mark their notifications read"
  on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Members see own payment; officers see all"
  on public.payments for select to authenticated
  using (user_id = auth.uid() or private.is_officer());
create policy "Officers record payments"
  on public.payments for insert to authenticated with check (private.is_officer());
create policy "Officers update payments"
  on public.payments for update to authenticated using (private.is_officer()) with check (private.is_officer());

revoke update on public.profiles from authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, room) on public.profiles to authenticated;
grant select, insert on public.orders to authenticated;
grant update (status) on public.orders to authenticated;
grant select on public.menu_items to authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant select, update (is_read) on public.notifications to authenticated;
grant select, insert, update on public.payments to authenticated;

create or replace view public.member_monthly_summary
with (security_invoker = true)
as
select
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.room,
  p.role,
  p.created_at,
  coalesce(sum(o.total) filter (
    where o.status = 'confirmed'
      and o.created_at >= date_trunc('month', current_date)
      and o.created_at < date_trunc('month', current_date) + interval '1 month'
  ), 0) as month_total,
  count(o.id) filter (
    where o.status = 'confirmed'
      and o.created_at >= date_trunc('month', current_date)
      and o.created_at < date_trunc('month', current_date) + interval '1 month'
  ) as order_count,
  coalesce(pay.status, 'due'::public.payment_status) as payment_status
from public.profiles p
left join public.orders o on o.user_id = p.id
left join public.payments pay on pay.user_id = p.id and pay.billing_month = date_trunc('month', current_date)::date
where p.role = 'member'
group by p.id, pay.status;

grant select on public.member_monthly_summary to authenticated;

-- Starter menu for the next seven days. The officer can replace any item in-app.
insert into public.menu_items (service_date, meal_period, name, description, price, category, cutoff_time)
select
  current_date + day_offset,
  meal::public.meal_period,
  case meal
    when 'Breakfast' then case day_offset % 3 when 0 then 'Aloo Paratha & Chai' when 1 then 'Anda Paratha' else 'Halwa Puri' end
    when 'Lunch' then case day_offset % 3 when 0 then 'Chicken Biryani' when 1 then 'Chicken Karahi' else 'Beef Qeema' end
    else case day_offset % 3 when 0 then 'Daal Mash & Chapati' when 1 then 'Sabzi Pulao' else 'Chicken Chow Mein' end
  end,
  case meal when 'Breakfast' then 'Fresh breakfast served with chai' when 'Lunch' then 'Main meal served with raita and salad' else 'Freshly prepared evening meal' end,
  case meal when 'Breakfast' then 180 when 'Lunch' then 320 else 250 end,
  case meal when 'Breakfast' then 'Pakistani' when 'Lunch' then 'Main course' else 'Dinner' end,
  case meal when 'Breakfast' then '09:00'::time when 'Lunch' then '12:30'::time else '18:30'::time end
from generate_series(0, 6) as day_offset
cross join (values ('Breakfast'), ('Lunch'), ('Dinner')) as meals(meal);

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.menu_items;

-- Promote the designated officer only after their email-verified account exists:
-- update public.profiles set role = 'officer' where email = 'officer@example.com';
