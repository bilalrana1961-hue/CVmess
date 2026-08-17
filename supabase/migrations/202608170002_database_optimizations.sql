-- Advisor-driven indexes and RLS initialization-plan optimizations.
create index if not exists menu_items_created_by_idx on public.menu_items (created_by);
create index if not exists orders_decided_by_idx on public.orders (decided_by);
create index if not exists orders_menu_item_idx on public.orders (menu_item_id);
create index if not exists payments_recorded_by_idx on public.payments (recorded_by);

drop policy "Members can read own profile; officers can read all" on public.profiles;
create policy "Members can read own profile; officers can read all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.is_officer());

drop policy "Members can update their own profile" on public.profiles;
create policy "Members can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy "Members see own orders; officers see all" on public.orders;
create policy "Members see own orders; officers see all"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or private.is_officer());

drop policy "Members create their own pending orders" on public.orders;
create policy "Members create their own pending orders"
  on public.orders for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

drop policy "Members can cancel own pending orders" on public.orders;
drop policy "Officers decide orders" on public.orders;
create policy "Members cancel own orders; officers decide orders"
  on public.orders for update to authenticated
  using ((user_id = (select auth.uid()) and status = 'pending') or private.is_officer())
  with check ((user_id = (select auth.uid()) and status = 'cancelled') or private.is_officer());

drop policy "Members read their notifications" on public.notifications;
create policy "Members read their notifications"
  on public.notifications for select to authenticated using (user_id = (select auth.uid()));

drop policy "Members mark their notifications read" on public.notifications;
create policy "Members mark their notifications read"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy "Members see own payment; officers see all" on public.payments;
create policy "Members see own payment; officers see all"
  on public.payments for select to authenticated
  using (user_id = (select auth.uid()) or private.is_officer());
