-- Migration 018: Create weekly_wellbeing_checkins table
-- Stores a patient's weekly self-assessment across energy, mood, and body confidence.
-- No UPDATE or DELETE — submissions are final.

create table public.weekly_wellbeing_checkins (
  id               uuid        primary key default gen_random_uuid(),
  patient_id       uuid        not null references public.patients(id) on delete cascade,
  submitted_at     timestamptz not null default now(),
  energy_score     int         check (energy_score between 1 and 5),
  mood_score       int         check (mood_score between 1 and 5),
  confidence_score int         check (confidence_score between 1 and 5),
  note             text        check (char_length(note) <= 200)
);

alter table public.weekly_wellbeing_checkins enable row level security;

-- Patients can insert their own records
create policy "Patients: insert own checkins"
  on public.weekly_wellbeing_checkins
  for insert
  with check (patient_id = auth.uid());

-- Patients can select their own records
create policy "Patients: select own checkins"
  on public.weekly_wellbeing_checkins
  for select
  using (patient_id = auth.uid());

-- Doctors can select records for their assigned patients
create policy "Doctors: select patient checkins"
  on public.weekly_wellbeing_checkins
  for select
  using (patient_id in (select public.get_my_patient_ids()));
