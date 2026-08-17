-- Multiple-officer role management. Only an existing officer may change roles.
create or replace function public.set_user_role(
  target_user_id uuid,
  requested_role public.app_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_role public.app_role;
  officer_count integer;
begin
  if not private.is_officer() then
    raise exception 'Only a mess officer can manage roles';
  end if;

  select role into current_role
  from public.profiles
  where id = target_user_id
  for update;

  if current_role is null then
    raise exception 'Account not found';
  end if;

  if current_role = 'officer' and requested_role = 'member' then
    select count(*) into officer_count from public.profiles where role = 'officer';
    if officer_count <= 1 then
      raise exception 'CVmess must retain at least one officer';
    end if;
  end if;

  update public.profiles set role = requested_role where id = target_user_id;
end;
$$;

revoke all on function public.set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;
