alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.trips enable row level security;
alter table public.bookings enable row level security;
alter table public.containers enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.invoices enable row level security;

create or replace function public.get_my_role()
returns varchar language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.get_my_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.companies where id = auth.uid()
$$;

create policy "admin_full" on public.users for all using (public.get_my_role() = 'admin');
create policy "staff_read_own" on public.users for select using (id = auth.uid());

create policy "admin_full" on public.companies for all using (public.get_my_role() = 'admin');
create policy "staff_read_all" on public.companies for select using (public.get_my_role() = 'staff');
create policy "company_read_update_own" on public.companies for select using (id = auth.uid());
create policy "company_update_own" on public.companies for update using (id = auth.uid());

create policy "admin_full" on public.pricing_plans for all using (public.get_my_role() = 'admin');
create policy "staff_read" on public.pricing_plans for select using (public.get_my_role() = 'staff');
create policy "company_read_active" on public.pricing_plans for select using (is_active = true);

create policy "admin_full" on public.trips for all using (public.get_my_role() = 'admin');
create policy "staff_read_all" on public.trips for select using (public.get_my_role() = 'staff');
create policy "staff_update" on public.trips for update using (public.get_my_role() = 'staff');
create policy "company_read_open" on public.trips for select using (status in ('open', 'full'));

create policy "admin_full" on public.bookings for all using (public.get_my_role() = 'admin');
create policy "staff_read_all" on public.bookings for select using (public.get_my_role() = 'staff');
create policy "staff_update" on public.bookings for update using (public.get_my_role() = 'staff');
create policy "company_own" on public.bookings for all using (company_id = public.get_my_company_id());

create policy "admin_full" on public.containers for all using (public.get_my_role() = 'admin');
create policy "staff_read_all" on public.containers for select using (public.get_my_role() = 'staff');
create policy "company_own" on public.containers for all
  using (booking_id in (
    select id from public.bookings where company_id = public.get_my_company_id()
  ));

create policy "admin_full" on public.booking_status_history for all using (public.get_my_role() = 'admin');
create policy "staff_read_insert" on public.booking_status_history for select using (public.get_my_role() = 'staff');
create policy "staff_insert" on public.booking_status_history for insert with check (
  public.get_my_role() in ('admin', 'staff')
  AND EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id)
);
create policy "company_read_own" on public.booking_status_history for select
  using (booking_id in (
    select id from public.bookings where company_id = public.get_my_company_id()
  ));

create policy "admin_full" on public.invoices for all using (public.get_my_role() = 'admin');
create policy "staff_read_all" on public.invoices for select using (public.get_my_role() = 'staff');
create policy "staff_update" on public.invoices for update using (public.get_my_role() in ('admin', 'staff'));
create policy "company_read_own" on public.invoices for select using (company_id = public.get_my_company_id());
