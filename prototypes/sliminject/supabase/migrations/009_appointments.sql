create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id),
  scheduled_at timestamptz not null,
  notes text
);

alter table public.appointments enable row level security;

create policy "Patiënt en dokter lezen afspraken"
  on public.appointments for select
  using (
    patient_id = auth.uid()
    or doctor_id = auth.uid()
  );

create policy "Dokter beheert afspraken"
  on public.appointments for insert
  with check (patient_id in (select public.get_my_patient_ids()));

create policy "Dokter wijzigt afspraken"
  on public.appointments for update
  using (doctor_id = auth.uid());
