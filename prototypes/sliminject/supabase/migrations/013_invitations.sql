-- Uitnodigingen: dokter nodigt nieuwe patiënt uit
create table if not exists public.invitations (
  id            uuid primary key default gen_random_uuid(),
  doctor_id     uuid references public.doctors(id) on delete cascade not null,
  patient_name  text not null,
  patient_email text not null,
  treatment_start_date date,
  initial_dose_mg    numeric(4,2),
  starting_weight_kg numeric(5,1),
  drug_type_id  text references public.drug_types(id),
  status        text not null default 'pending'
                  check (status in ('pending', 'accepted')),
  created_at    timestamptz not null default now()
);

alter table public.invitations enable row level security;

-- Dokters beheren hun eigen uitnodigingen
create policy "Doctors manage own invitations"
  on public.invitations
  for all
  using  (doctor_id = auth.uid())
  with check (doctor_id = auth.uid());
