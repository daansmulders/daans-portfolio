-- RLS-aanvullingen voor kern-entiteiten
-- (Zie 001_profiles.sql, 002_patients.sql, 003_doctors.sql voor tabel-specifieke policies)

-- Dokter kan profielen van eigen patiënten lezen (hier, omdat patients nu bestaat)
create policy "Dokter leest patiëntprofielen"
  on public.profiles for select
  using (
    exists (
      select 1 from public.patients
      where patients.id = profiles.id
        and patients.doctor_id = auth.uid()
    )
  );

-- Helper-functie: geeft de doctor_id terug van de ingelogde patiënt
create or replace function public.get_my_doctor_id()
returns uuid as $$
  select doctor_id from public.patients where id = auth.uid()
$$ language sql security definer stable;

-- Helper-functie: geeft patiënt-ids terug die bij de ingelogde dokter horen
create or replace function public.get_my_patient_ids()
returns setof uuid as $$
  select id from public.patients where doctor_id = auth.uid()
$$ language sql security definer stable;
