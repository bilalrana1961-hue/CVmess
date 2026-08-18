create index if not exists officer_accounts_created_by_idx on public.officer_accounts (created_by);
create index if not exists officer_invites_created_by_idx on private.officer_invites (created_by);
create index if not exists officer_invites_used_by_idx on private.officer_invites (used_by);
