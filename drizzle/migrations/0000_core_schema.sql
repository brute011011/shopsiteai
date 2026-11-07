create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  plan text not null default 'free',
  credits integer not null default 10,
  marketing_opt_in boolean not null default false,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
-- users may only change harmless fields
revoke update on public.profiles from authenticated;
grant update (display_name, marketing_opt_in, terms_accepted_at) on public.profiles to authenticated;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null default 'My website',
  html text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.sites to authenticated;
grant select on public.sites to anon;
grant all on public.sites to service_role;
alter table public.sites enable row level security;
create policy "own sites" on public.sites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "published sites public" on public.sites for select to anon, authenticated using (published = true);

create table public.site_messages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.site_messages to authenticated;
grant all on public.site_messages to service_role;
alter table public.site_messages enable row level security;
create policy "own messages" on public.site_messages for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  credits integer not null default 1,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(10,5) not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.usage_events to authenticated;
grant all on public.usage_events to service_role;
alter table public.usage_events enable row level security;
create policy "own usage" on public.usage_events for select to authenticated using (auth.uid() = user_id);
create policy "admin usage" on public.usage_events for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount_cents integer not null,
  kind text not null,
  provider_ref text,
  created_at timestamptz not null default now()
);
grant select on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "own payments" on public.payments for select to authenticated using (auth.uid() = user_id);
create policy "admin payments" on public.payments for select to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "admin profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);
grant insert on public.feedback to anon, authenticated;
grant select on public.feedback to authenticated;
grant all on public.feedback to service_role;
alter table public.feedback enable row level security;
create policy "anyone send feedback" on public.feedback for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
create policy "admin feedback" on public.feedback for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- atomic credit spend, server only
create or replace function public.spend_credit(_user_id uuid, _amount integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  update public.profiles set credits = credits - _amount where id = _user_id and credits >= _amount returning true into ok;
  return coalesce(ok,false);
end $$;
revoke execute on function public.spend_credit(uuid,integer) from public, anon, authenticated;
grant execute on function public.spend_credit(uuid,integer) to service_role;

create or replace function public.refund_credit(_user_id uuid, _amount integer)
returns void language sql security definer set search_path = public as $$
  update public.profiles set credits = credits + _amount where id = _user_id
$$;
revoke execute on function public.refund_credit(uuid,integer) from public, anon, authenticated;
grant execute on function public.refund_credit(uuid,integer) to service_role;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, terms_accepted_at)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    case when new.raw_user_meta_data->>'terms_accepted' = 'true' then now() else null end);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();