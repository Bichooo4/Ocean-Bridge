create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_type text := new.raw_user_meta_data->>'type';
begin
  if user_type = 'admin' or user_type = 'staff' then
    insert into public.users (id, role, full_name, phone)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'role', 'staff'),
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.raw_user_meta_data->>'phone'
    );
  elsif user_type = 'company' then
    insert into public.companies (id, company_name, contact_name, phone)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'company_name', ''),
      coalesce(new.raw_user_meta_data->>'contact_name', ''),
      new.raw_user_meta_data->>'phone'
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
