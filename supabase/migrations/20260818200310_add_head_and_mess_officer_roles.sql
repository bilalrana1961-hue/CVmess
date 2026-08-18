create type public.officer_level as enum ('head_officer', 'mess_officer');

alter table public.officer_accounts
  add column level public.officer_level not null default 'mess_officer';

update public.officer_accounts oa
set level = 'head_officer'
from public.profiles p
where p.id = oa.user_id
  and lower(p.email) = 'bilal.rana1961@gmail.com';

create or replace function private.is_head_officer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.officer_accounts
    where user_id = auth.uid() and level = 'head_officer'
  );
$$;

revoke all on function private.is_head_officer() from public, anon;
grant execute on function private.is_head_officer() to authenticated;

drop policy if exists "Officers can view officer accounts" on public.officer_accounts;
create policy "Officers view own account; head officer views all"
  on public.officer_accounts for select to authenticated
  using (user_id = (select auth.uid()) or private.is_head_officer());

create or replace function public.create_officer_invite()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare raw_code text;
begin
  if not private.is_head_officer() then
    raise exception 'Only the Head Officer can create Mess Officer accounts';
  end if;
  raw_code := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into private.officer_invites(code_hash, created_by)
  values (encode(extensions.digest(raw_code, 'sha256'), 'hex'), auth.uid());
  return raw_code;
end;
$$;

alter table public.menu_items drop constraint menu_items_created_by_fkey;
alter table public.menu_items add constraint menu_items_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.officer_accounts drop constraint officer_accounts_created_by_fkey;
alter table public.officer_accounts add constraint officer_accounts_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.orders drop constraint orders_decided_by_fkey;
alter table public.orders add constraint orders_decided_by_fkey
  foreign key (decided_by) references public.profiles(id) on delete set null;

alter table public.payments drop constraint payments_recorded_by_fkey;
alter table public.payments add constraint payments_recorded_by_fkey
  foreign key (recorded_by) references public.profiles(id) on delete set null;

alter table private.officer_invites alter column created_by drop not null;
alter table private.officer_invites drop constraint officer_invites_created_by_fkey;
alter table private.officer_invites add constraint officer_invites_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;
alter table private.officer_invites drop constraint officer_invites_used_by_fkey;
alter table private.officer_invites add constraint officer_invites_used_by_fkey
  foreign key (used_by) references public.profiles(id) on delete set null;

create index if not exists officer_accounts_level_idx on public.officer_accounts (level);
