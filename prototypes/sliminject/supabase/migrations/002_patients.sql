create table public.patients (
  id uuid primary key references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id),
  treatment_start_date date not null,
  current_dosage_mg numeric not null default 0
);

alter table public.patients enable row level security;

-- Patiënt leest eigen rij
create policy "Patiënt leest eigen rij"
  on public.patients for select
  using (auth.uid() = id);

-- Dokter leest rijen van eigen patiënten
create policy "Dokter leest eigen patiënten"
  on public.patients for select
  using (doctor_id = auth.uid());

-- Alleen dokter kan patiëntrijen bijwerken
create policy "Dokter werkt patiëntrij bij"
  on public.patients for update
  using (doctor_id = auth.uid());
