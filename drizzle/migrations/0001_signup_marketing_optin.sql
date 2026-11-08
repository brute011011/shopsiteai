create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, terms_accepted_at, marketing_opt_in)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    case when new.raw_user_meta_data->>'terms_accepted' = 'true' then now() else null end,
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end $$;