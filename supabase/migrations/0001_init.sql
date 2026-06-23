-- =====================================================================
-- PIATTAFORMA PRENOTAZIONE VISITE MEDICHE — SCHEMA DATABASE
-- PostgreSQL 15+ / Supabase
-- =====================================================================
-- Convenzioni:
--   - tutte le PK sono uuid (gen_random_uuid())
--   - timestamptz per tutte le date/ore (sempre UTC, conversione lato client)
--   - "profiles" estende auth.users di Supabase (pattern standard 1:1)
--   - le tabelle *_profiles usano come PK lo stesso id del profilo
--     (profile_id) per evitare un id ridondante e semplificare i JOIN/RLS
-- =====================================================================


-- =====================================================================
-- 0. ESTENSIONI
-- =====================================================================
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- ricerca fuzzy/full-text


-- =====================================================================
-- 0.1 ENUM TYPES
-- =====================================================================
create type public.user_role as enum ('patient', 'doctor', 'admin');

create type public.doctor_verification_status as enum (
  'pending', 'approved', 'rejected', 'suspended'
);

create type public.consultation_type as enum ('in_person', 'video', 'both');

create type public.appointment_status as enum (
  'pending_payment',
  'confirmed',
  'completed',
  'cancelled_by_patient',
  'cancelled_by_doctor',
  'no_show'
);

create type public.payment_status as enum (
  'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'
);

create type public.document_type as enum (
  'medical_license', 'id_card', 'degree_certificate', 'other'
);

create type public.document_status as enum ('pending', 'approved', 'rejected');


-- =====================================================================
-- 1. PROFILES — estende auth.users (comune a tutti i ruoli)
-- =====================================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text not null,
  phone       text,
  avatar_url  text,
  role        public.user_role not null default 'patient',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);


-- =====================================================================
-- 2. PATIENT_DETAILS — dati anagrafici specifici del paziente (1:1)
-- =====================================================================
create table public.patient_details (
  profile_id    uuid primary key references public.profiles(id) on delete cascade,
  date_of_birth date,
  gender        text,
  fiscal_code   text,
  address       text,
  city          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- =====================================================================
-- 3. SPECIALIZATIONS — catalogo specializzazioni mediche
-- =====================================================================
create table public.specializations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  icon        text,
  created_at  timestamptz not null default now()
);

create index idx_specializations_slug on public.specializations(slug);


-- =====================================================================
-- 4. DOCTOR_PROFILES — dati professionali del medico (1:1 con profiles)
-- =====================================================================
create table public.doctor_profiles (
  profile_id          uuid primary key references public.profiles(id) on delete cascade,
  slug                text not null unique,              -- usato in /medici/[slug]
  bio                 text,
  years_experience    smallint,
  license_number      text not null,
  consultation_fee    numeric(10,2) not null check (consultation_fee >= 0),
  currency            text not null default 'EUR',
  consultation_type   public.consultation_type not null default 'both',
  languages           text[] not null default array['it'],
  city                text,
  address             text,
  verification_status public.doctor_verification_status not null default 'pending',
  verified_at         timestamptz,
  rejected_reason     text,
  average_rating      numeric(3,2) not null default 0,
  total_reviews        integer not null default 0,
  is_visible          boolean not null default false,   -- true solo se approved
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_doctor_profiles_status on public.doctor_profiles(verification_status);
create index idx_doctor_profiles_visible on public.doctor_profiles(is_visible) where is_visible = true;
create index idx_doctor_profiles_city on public.doctor_profiles(city);
create index idx_doctor_profiles_bio_trgm on public.doctor_profiles using gin (bio gin_trgm_ops);


-- =====================================================================
-- 5. DOCTOR_SPECIALIZATIONS — N:N medico <-> specializzazione
-- =====================================================================
create table public.doctor_specializations (
  doctor_id         uuid not null references public.doctor_profiles(profile_id) on delete cascade,
  specialization_id uuid not null references public.specializations(id) on delete cascade,
  primary key (doctor_id, specialization_id)
);

create index idx_doctor_spec_specialization on public.doctor_specializations(specialization_id);


-- =====================================================================
-- 6. DOCTOR_DOCUMENTS — documenti caricati per la verifica admin
-- =====================================================================
create table public.doctor_documents (
  id            uuid primary key default gen_random_uuid(),
  doctor_id     uuid not null references public.doctor_profiles(profile_id) on delete cascade,
  document_type public.document_type not null,
  file_path     text not null,                 -- path su Supabase Storage (bucket privato)
  status        public.document_status not null default 'pending',
  reviewed_by   uuid references public.profiles(id),
  reviewed_at   timestamptz,
  uploaded_at   timestamptz not null default now()
);

create index idx_doctor_documents_doctor on public.doctor_documents(doctor_id);


-- =====================================================================
-- 7. DOCTOR_STRIPE_ACCOUNTS — collegamento Stripe Connect (payout medico)
-- =====================================================================
create table public.doctor_stripe_accounts (
  doctor_id        uuid primary key references public.doctor_profiles(profile_id) on delete cascade,
  stripe_account_id text not null unique,
  charges_enabled  boolean not null default false,
  payouts_enabled  boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);


-- =====================================================================
-- 8. AVAILABILITY_RULES — disponibilità settimanale ricorrente
-- =====================================================================
create table public.availability_rules (
  id                    uuid primary key default gen_random_uuid(),
  doctor_id             uuid not null references public.doctor_profiles(profile_id) on delete cascade,
  weekday               smallint not null check (weekday between 0 and 6), -- 0 = domenica
  start_time            time not null,
  end_time              time not null check (end_time > start_time),
  slot_duration_minutes smallint not null default 30,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now()
);

create index idx_availability_rules_doctor on public.availability_rules(doctor_id, weekday);


-- =====================================================================
-- 9. AVAILABILITY_EXCEPTIONS — chiusure straordinarie / aperture extra
-- =====================================================================
create table public.availability_exceptions (
  id             uuid primary key default gen_random_uuid(),
  doctor_id      uuid not null references public.doctor_profiles(profile_id) on delete cascade,
  exception_date date not null,
  is_available   boolean not null default false,   -- false = giornata bloccata (ferie)
  start_time     time,
  end_time       time,
  reason         text,
  created_at     timestamptz not null default now(),
  unique (doctor_id, exception_date)
);

create index idx_availability_exceptions_doctor on public.availability_exceptions(doctor_id, exception_date);


-- =====================================================================
-- 10. APPOINTMENTS — appuntamenti prenotati
-- =====================================================================
create table public.appointments (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.profiles(id) on delete restrict,
  doctor_id          uuid not null references public.doctor_profiles(profile_id) on delete restrict,
  specialization_id  uuid references public.specializations(id),
  scheduled_start    timestamptz not null,
  scheduled_end      timestamptz not null check (scheduled_end > scheduled_start),
  status             public.appointment_status not null default 'pending_payment',
  consultation_type  public.consultation_type not null,
  patient_notes      text,
  price              numeric(10,2) not null,         -- snapshot tariffa al momento della prenotazione
  cancelled_reason   text,
  cancelled_by       uuid references public.profiles(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint uq_doctor_slot unique (doctor_id, scheduled_start)  -- evita doppia prenotazione
);

create index idx_appointments_doctor_date on public.appointments(doctor_id, scheduled_start);
create index idx_appointments_patient_date on public.appointments(patient_id, scheduled_start);
create index idx_appointments_status on public.appointments(status);


-- =====================================================================
-- 11. PAYMENTS — transazioni Stripe collegate a un appuntamento
-- =====================================================================
create table public.payments (
  id                       uuid primary key default gen_random_uuid(),
  appointment_id           uuid not null references public.appointments(id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id   text unique,
  amount                   numeric(10,2) not null,
  application_fee_amount   numeric(10,2) not null default 0,  -- commissione piattaforma
  currency                 text not null default 'EUR',
  status                   public.payment_status not null default 'pending',
  paid_at                  timestamptz,
  refunded_at              timestamptz,
  created_at               timestamptz not null default now()
);

create index idx_payments_appointment on public.payments(appointment_id);
create index idx_payments_status on public.payments(status);


-- =====================================================================
-- 12. REVIEWS — recensioni post-visita (1:1 con appointment)
-- =====================================================================
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  patient_id     uuid not null references public.profiles(id) on delete cascade,
  doctor_id      uuid not null references public.doctor_profiles(profile_id) on delete cascade,
  rating         smallint not null check (rating between 1 and 5),
  comment        text,
  created_at     timestamptz not null default now()
);

create index idx_reviews_doctor on public.reviews(doctor_id);


-- =====================================================================
-- 13. ADMIN_AUDIT_LOG — log delle azioni amministrative
-- =====================================================================
create table public.admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references public.profiles(id),
  action       text not null,        -- es. 'approve_doctor', 'reject_doctor', 'deactivate_user'
  target_table text not null,
  target_id    uuid not null,
  metadata     jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

create index idx_admin_audit_admin on public.admin_audit_log(admin_id);
create index idx_admin_audit_target on public.admin_audit_log(target_table, target_id);


-- =====================================================================
-- 14. FUNZIONI E TRIGGER
-- =====================================================================

-- 14.1 updated_at automatico
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_patient_details_updated_at before update on public.patient_details
  for each row execute function public.set_updated_at();
create trigger trg_doctor_profiles_updated_at before update on public.doctor_profiles
  for each row execute function public.set_updated_at();
create trigger trg_doctor_stripe_accounts_updated_at before update on public.doctor_stripe_accounts
  for each row execute function public.set_updated_at();
create trigger trg_appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- 14.2 Crea automaticamente il profilo alla registrazione (auth.users -> profiles)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'patient')
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 14.3 Aggiorna rating medio e conteggio recensioni del medico
create or replace function public.update_doctor_rating()
returns trigger language plpgsql as $$
begin
  update public.doctor_profiles
  set average_rating = (
        select coalesce(round(avg(rating)::numeric, 2), 0)
        from public.reviews where doctor_id = new.doctor_id
      ),
      total_reviews = (
        select count(*) from public.reviews where doctor_id = new.doctor_id
      )
  where profile_id = new.doctor_id;
  return new;
end;
$$;

create trigger trg_review_insert after insert on public.reviews
  for each row execute function public.update_doctor_rating();

-- 14.4 Sincronizza is_visible con verification_status (solo approved è pubblico)
create or replace function public.sync_doctor_visibility()
returns trigger language plpgsql as $$
begin
  new.is_visible := (new.verification_status = 'approved');
  return new;
end;
$$;

create trigger trg_doctor_visibility
  before insert or update of verification_status on public.doctor_profiles
  for each row execute function public.sync_doctor_visibility();


-- =====================================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.patient_details enable row level security;
alter table public.doctor_profiles enable row level security;
alter table public.doctor_specializations enable row level security;
alter table public.doctor_documents enable row level security;
alter table public.doctor_stripe_accounts enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_audit_log enable row level security;

-- Funzione helper: ruolo dell'utente corrente
create or replace function public.current_role()
returns public.user_role language sql stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---- PROFILES ----
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.current_role() = 'admin');
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- ---- PATIENT_DETAILS ----
create policy "patient_details_owner" on public.patient_details
  for all using (profile_id = auth.uid() or public.current_role() = 'admin');

-- ---- DOCTOR_PROFILES ----
-- pubblico in lettura solo se approvato e visibile; il medico vede sempre il proprio; l'admin vede tutto
create policy "doctor_profiles_public_select" on public.doctor_profiles
  for select using (is_visible = true or profile_id = auth.uid() or public.current_role() = 'admin');
create policy "doctor_profiles_insert_own" on public.doctor_profiles
  for insert with check (profile_id = auth.uid());
create policy "doctor_profiles_update_own" on public.doctor_profiles
  for update using (profile_id = auth.uid() or public.current_role() = 'admin');

-- ---- DOCTOR_SPECIALIZATIONS ----
create policy "doctor_specializations_public_select" on public.doctor_specializations
  for select using (true);
create policy "doctor_specializations_owner_write" on public.doctor_specializations
  for all using (doctor_id = auth.uid() or public.current_role() = 'admin');

-- ---- DOCTOR_DOCUMENTS ----
create policy "doctor_documents_owner_or_admin" on public.doctor_documents
  for select using (doctor_id = auth.uid() or public.current_role() = 'admin');
create policy "doctor_documents_insert_own" on public.doctor_documents
  for insert with check (doctor_id = auth.uid());

-- ---- DOCTOR_STRIPE_ACCOUNTS ----
-- letto/scritto dal medico stesso (onboarding Connect) o dal service role (webhook account.updated)
create policy "doctor_stripe_accounts_owner_all" on public.doctor_stripe_accounts
  for all using (doctor_id = auth.uid() or public.current_role() = 'admin');

-- ---- AVAILABILITY (pubblica in lettura per calcolare gli slot liberi) ----
create policy "availability_rules_public_select" on public.availability_rules
  for select using (true);
create policy "availability_rules_owner_write" on public.availability_rules
  for all using (doctor_id = auth.uid() or public.current_role() = 'admin');

create policy "availability_exceptions_public_select" on public.availability_exceptions
  for select using (true);
create policy "availability_exceptions_owner_write" on public.availability_exceptions
  for all using (doctor_id = auth.uid() or public.current_role() = 'admin');

-- ---- APPOINTMENTS ----
create policy "appointments_select_involved" on public.appointments
  for select using (patient_id = auth.uid() or doctor_id = auth.uid() or public.current_role() = 'admin');
create policy "appointments_insert_patient" on public.appointments
  for insert with check (patient_id = auth.uid());
create policy "appointments_update_involved" on public.appointments
  for update using (patient_id = auth.uid() or doctor_id = auth.uid() or public.current_role() = 'admin');

-- ---- PAYMENTS (scrittura riservata al service_role lato webhook) ----
create policy "payments_select_involved" on public.payments
  for select using (
    exists (
      select 1 from public.appointments a
      where a.id = payments.appointment_id
        and (a.patient_id = auth.uid() or a.doctor_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

-- ---- REVIEWS ----
create policy "reviews_public_select" on public.reviews
  for select using (true);
create policy "reviews_insert_patient_own_appointment" on public.reviews
  for insert with check (
    patient_id = auth.uid()
    and exists (
      select 1 from public.appointments a
      where a.id = reviews.appointment_id
        and a.patient_id = auth.uid()
        and a.status = 'completed'
    )
  );

-- ---- ADMIN_AUDIT_LOG ----
create policy "admin_audit_log_admin_only" on public.admin_audit_log
  for all using (public.current_role() = 'admin');

-- NOTA: le operazioni di scrittura su "payments" e l'aggiornamento di
-- "appointments.status" innescate dal webhook Stripe vengono eseguite
-- lato server con la service_role key di Supabase, che bypassa la RLS
-- per definizione (il webhook non ha un auth.uid() di un utente loggato).
