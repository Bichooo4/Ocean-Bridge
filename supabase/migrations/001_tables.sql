create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       varchar not null check (role in ('admin', 'staff')),
  full_name  varchar not null check (length(full_name) >= 2),
  phone      varchar,
  created_at timestamptz default now()
);

create table public.companies (
  id           uuid primary key references auth.users(id) on delete cascade,
  company_name varchar not null check (length(company_name) >= 2),
  contact_name varchar not null check (length(contact_name) >= 2),
  phone        varchar,
  created_at   timestamptz default now()
);

create table public.pricing_plans (
  id             uuid primary key default gen_random_uuid(),
  from_location  varchar not null check (length(from_location) >= 2),
  to_location    varchar not null check (length(to_location) >= 2),
  transport_type varchar not null check (transport_type in ('ship', 'truck', 'airplane')),
  base_price     numeric not null check (base_price >= 0),
  per_kg_rate    numeric not null check (per_kg_rate >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz default now(),
  constraint check_locations_differ check (from_location <> to_location)
);

create table public.trips (
  id              uuid primary key default gen_random_uuid(),
  pricing_plan_id uuid not null references public.pricing_plans(id) on delete restrict,
  from_location   varchar not null,
  to_location     varchar not null,
  transport_type  varchar not null check (transport_type in ('ship', 'truck', 'airplane')),
  base_price      numeric not null check (base_price >= 0),
  per_kg_rate     numeric not null check (per_kg_rate >= 0),
  departure_date  date not null,
  arrival_date    date not null,
  max_containers  int not null check (max_containers > 0),
  status          varchar not null default 'open'
                  check (status in ('open', 'full', 'out_for_delivery', 'delivered')),
  created_by      uuid not null references public.users(id) on delete restrict,
  created_at      timestamptz default now(),
  constraint check_dates check (arrival_date > departure_date)
);

create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid not null references public.trips(id) on delete restrict,
  company_id      uuid not null references public.companies(id) on delete restrict,
  status          varchar not null default 'pending'
                  check (status in ('pending', 'approved', 'out_for_delivery', 'delivered', 'cancelled')),
  total_weight_kg numeric not null check (total_weight_kg > 0),
  total_price     numeric not null check (total_price >= 0),
  notes           text,
  cancelled_at    timestamptz,
  cancel_reason   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  constraint uq_one_booking_per_company_per_trip unique (trip_id, company_id)
);

create table public.containers (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  weight_kg   numeric not null check (weight_kg > 0),
  description text,
  created_at  timestamptz default now()
);

create table public.booking_status_history (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  updated_by uuid references public.users(id) on delete set null,
  status     varchar not null,
  notes      text,
  created_at timestamptz default now()
);

create table public.invoices (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null unique references public.bookings(id) on delete restrict,
  company_id   uuid not null references public.companies(id) on delete restrict,
  total_price  numeric not null check (total_price >= 0),
  status       varchar not null default 'unpaid'
               check (status in ('unpaid', 'paid', 'cancelled')),
  issued_at    timestamptz default now(),
  paid_at      timestamptz,
  cancelled_at timestamptz
);
