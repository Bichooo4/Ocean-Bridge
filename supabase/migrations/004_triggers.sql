create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
