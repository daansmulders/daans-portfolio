create table public.dosage_schedule_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  dose_mg numeric not null,
  start_date date not null,
  notes text,
  created_by_doctor_id uuid not null references public.doctors(id)
);

alter table public.dosage_schedule_entries enable row level security;

create policy "Patiënt leest eigen schema"
  on public.dosage_schedule_entries for select
  using (patient_id = auth.uid());

create policy "Dokter beheert patiëntschema"
  on public.dosage_schedule_entries for all
  using (patient_id in (select public.get_my_patient_ids()))
  with check (patient_id in (select public.get_my_patient_ids()));

create table public.advice (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.advice enable row level security;

create policy "Patiënt leest eigen advies"
  on public.advice for select
  using (patient_id = auth.uid());

create policy "Dokter beheert advies"
  on public.advice for all
  using (patient_id in (select public.get_my_patient_ids()))
  with check (patient_id in (select public.get_my_patient_ids()));
