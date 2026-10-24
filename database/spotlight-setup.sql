-- Apply once to the existing Terqyn production Supabase project.
-- Starts locked with NO promotions. Only the existing verified founder account
-- is seeded; no accounts are created and no existing roles are changed.
begin;
create schema if not exists hq_private;
revoke all on schema hq_private from public;
grant usage on schema hq_private to anon, authenticated;

create table public.hq_spotlight_admins (
  user_id uuid primary key references auth.users(id),
  active boolean not null default true
);
alter table public.hq_spotlight_admins enable row level security;
revoke all on public.hq_spotlight_admins from anon, authenticated;
insert into public.hq_spotlight_admins(user_id)
select id from auth.users where lower(email)='colbylevesque@gmail.com'
and email_confirmed_at is not null and deleted_at is null;

-- Private privileged lookup is required because allowlist and auth.users are
-- intentionally inaccessible to clients. User-editable metadata is never used.
create function hq_private.spotlight_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.hq_spotlight_admins a
    join auth.users u on u.id=a.user_id
    where a.user_id=(select auth.uid()) and a.active
      and u.email_confirmed_at is not null and u.deleted_at is null
      and (u.banned_until is null or u.banned_until < now())
      and exists (select 1 from auth.sessions s where s.user_id=u.id
        and s.id::text=(select auth.jwt()->>'session_id'))
  );
$$;
revoke all on function hq_private.spotlight_admin() from public;
grant execute on function hq_private.spotlight_admin() to anon, authenticated;
create function public.hq_spotlight_is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select hq_private.spotlight_admin();
$$;
revoke all on function public.hq_spotlight_is_admin() from public;
grant execute on function public.hq_spotlight_is_admin() to authenticated;

create table public.hq_spotlight_settings (
  id integer primary key check(id=1), locked boolean not null default true,
  updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
insert into public.hq_spotlight_settings(id,locked) values(1,true);
create table public.hq_spotlight_promotions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('promo','giveaway')),
  title text not null check(length(trim(title)) between 1 and 160),
  description text not null check(length(trim(description)) between 1 and 8000),
  perks text not null check(length(trim(perks)) between 1 and 8000),
  code text not null default '' check(length(code)<=80),
  quantity integer check(quantity>0),
  eligibility text not null check(length(trim(eligibility)) between 1 and 2048),
  terms text not null check(length(trim(terms)) between 1 and 8000),
  action_url text not null default '' check(action_url='' or (length(action_url)<=2048 and action_url ~* '^https://[^[:space:]]+$')),
  starts_at timestamptz not null, ends_at timestamptz not null check(ends_at>starts_at),
  status text not null default 'draft' check(status in ('draft','published','paused')),
  created_at timestamptz not null default now(), created_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(), updated_by uuid not null references auth.users(id),
  launched_at timestamptz, launched_by uuid references auth.users(id),
  check(kind<>'promo' or length(trim(code))>0),
  check(status<>'published' or (launched_at is not null and launched_by is not null and action_url<>''))
);
create index hq_spotlight_active_idx on public.hq_spotlight_promotions(status,starts_at,ends_at);
create table public.hq_spotlight_audit (
  id bigint generated always as identity primary key, actor_id uuid not null,
  occurred_at timestamptz not null default now(), entity text not null,
  record_id text not null, operation text not null, before_data jsonb, after_data jsonb
);
alter table public.hq_spotlight_settings enable row level security;
alter table public.hq_spotlight_promotions enable row level security;
alter table public.hq_spotlight_audit enable row level security;
revoke all on public.hq_spotlight_settings, public.hq_spotlight_promotions, public.hq_spotlight_audit from anon, authenticated;
grant select on public.hq_spotlight_settings, public.hq_spotlight_promotions to anon, authenticated;
grant update(locked) on public.hq_spotlight_settings to authenticated;
grant insert(kind,title,description,perks,code,quantity,eligibility,terms,action_url,starts_at,ends_at,status),
update(kind,title,description,perks,code,quantity,eligibility,terms,action_url,starts_at,ends_at,status)
on public.hq_spotlight_promotions to authenticated;
grant select on public.hq_spotlight_audit to authenticated;
create policy settings_read on public.hq_spotlight_settings for select to anon,authenticated using(true);
create policy settings_edit on public.hq_spotlight_settings for update to authenticated
using((select hq_private.spotlight_admin())) with check((select hq_private.spotlight_admin()));
create policy promotions_read on public.hq_spotlight_promotions for select to anon,authenticated using(
  (select hq_private.spotlight_admin()) or
  (status='published' and starts_at<=now() and ends_at>now()
   and exists(select 1 from public.hq_spotlight_settings where id=1 and not locked))
);
create policy promotions_create on public.hq_spotlight_promotions for insert to authenticated
with check((select hq_private.spotlight_admin()));
create policy promotions_edit on public.hq_spotlight_promotions for update to authenticated
using((select hq_private.spotlight_admin())) with check((select hq_private.spotlight_admin()));
create policy audit_read on public.hq_spotlight_audit for select to authenticated
using((select hq_private.spotlight_admin()));

create function hq_private.spotlight_guard() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if not hq_private.spotlight_admin() then raise exception 'Verified Spotlight admin required'; end if;
  if tg_table_name='hq_spotlight_settings' then
    new.updated_at=now(); new.updated_by=auth.uid(); return new;
  end if;
  if tg_op='INSERT' then
    if new.status<>'draft' then raise exception 'Save a draft before launching'; end if;
    new.created_at=now(); new.created_by=auth.uid(); new.launched_at=null; new.launched_by=null;
  else
    new.created_at=old.created_at; new.created_by=old.created_by;
    new.launched_at=old.launched_at; new.launched_by=old.launched_by;
    if new.status='published' and (
      new.kind,new.title,new.description,new.perks,new.code,new.quantity,new.eligibility,
      new.terms,new.action_url,new.starts_at,new.ends_at
    ) is distinct from (
      old.kind,old.title,old.description,old.perks,old.code,old.quantity,old.eligibility,
      old.terms,old.action_url,old.starts_at,old.ends_at
    ) then raise exception 'Save changed content as draft, then launch separately'; end if;
    if new.status='published' and old.status<>'published' then
      if new.ends_at<=now() or new.action_url='' then raise exception 'Launch needs a future end date and an HTTPS action page'; end if;
      new.launched_at=now();new.launched_by=auth.uid();
    end if;
  end if;
  new.updated_at=now(); new.updated_by=auth.uid(); return new;
end;
$$;
revoke all on function hq_private.spotlight_guard() from public;
create trigger spotlight_settings_guard before update on public.hq_spotlight_settings
for each row execute function hq_private.spotlight_guard();
create trigger spotlight_promotions_guard before insert or update on public.hq_spotlight_promotions
for each row execute function hq_private.spotlight_guard();

create function hq_private.spotlight_audit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not hq_private.spotlight_admin() then raise exception 'Verified Spotlight admin required'; end if;
  insert into public.hq_spotlight_audit(actor_id,entity,record_id,operation,before_data,after_data)
  values(auth.uid(),tg_table_name,new.id::text,tg_op,case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
  return new;
end;
$$;
revoke all on function hq_private.spotlight_audit() from public;
create trigger spotlight_settings_audit after update on public.hq_spotlight_settings
for each row execute function hq_private.spotlight_audit();
create trigger spotlight_promotions_audit after insert or update on public.hq_spotlight_promotions
for each row execute function hq_private.spotlight_audit();
commit;
