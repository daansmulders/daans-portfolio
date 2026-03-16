create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  logged_at timestamptz not null,
  weight_kg numeric,
  wellbeing_score int not null check (wellbeing_score between 1 and 5),
  symptoms text[] not null default '{}',
  notes text
);

alter table public.progress_entries enable row level security;

-- Patiënt leest en schrijft eigen metingen
create policy "Patiënt beheert eigen metingen"
  on public.progress_entries for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- Dokter leest metingen van eigen patiënten
create policy "Dokter leest patiëntmetingen"
  on public.progress_entries for select
  using (patient_id in (select public.get_my_patient_ids()));

-- Index voor snel ophalen per patiënt op datum
create index progress_entries_patient_logged_at on public.progress_entries(patient_id, logged_at desc);
