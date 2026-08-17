create table public.officer_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table private.officer_invites (
  code_hash text primary key,
  created_by uuid not null references public.profiles(id),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  used_by uuid references public.profiles(id),
  used_at timestamptz
);

insert into public.officer_accounts (user_id)
select id from public.profiles where role = 'officer'
on conflict do nothing;

alter table public.officer_accounts enable row level security;
create policy "Officers can view officer accounts" on public.officer_accounts
  for select to authenticated using (private.is_officer());
grant select on public.officer_accounts to authenticated;

create or replace function private.is_officer()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.officer_accounts where user_id = auth.uid()); $$;

create or replace function public.create_officer_invite()
returns text language plpgsql security definer set search_path = ''
as $$
declare raw_code text;
begin
  if not private.is_officer() then raise exception 'Only a mess officer can create officer accounts'; end if;
  raw_code := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into private.officer_invites(code_hash, created_by)
  values (encode(extensions.digest(raw_code, 'sha256'), 'hex'), auth.uid());
  return raw_code;
end; $$;
revoke all on function public.create_officer_invite() from public, anon;
grant execute on function public.create_officer_invite() to authenticated;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare invite private.officer_invites;
declare requested_type text := coalesce(new.raw_user_meta_data ->> 'account_type', 'member');
begin
  if requested_type = 'officer' then
    select * into invite from private.officer_invites
    where code_hash = encode(extensions.digest(coalesce(new.raw_user_meta_data ->> 'officer_invite', ''), 'sha256'), 'hex')
      and used_at is null and expires_at > now() for update;
    if invite.code_hash is null then raise exception 'Invalid or expired officer invitation'; end if;
  end if;

  insert into public.profiles (id, full_name, email, phone, room, role)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'room', ''), case when requested_type = 'officer' then 'officer'::public.app_role else 'member'::public.app_role end);

  if requested_type = 'officer' then
    insert into public.officer_accounts(user_id, created_by) values (new.id, invite.created_by);
    update private.officer_invites set used_by = new.id, used_at = now() where code_hash = invite.code_hash;
  end if;
  return new;
end; $$;

drop function if exists public.set_user_role(uuid, public.app_role);
