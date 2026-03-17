create table public.injection_adherence (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  schedule_entry_id uuid not null references public.dosage_schedule_entries(id) on delete cascade,
  response text not null check (response in ('confirmed', 'skipped', 'adjusted')),
  note text,
  recorded_at timestamptz not null default now(),
  constraint injection_adherence_unique_per_cycle unique (patient_id, schedule_entry_id)
);

alter table public.injection_adherence enable row level security;

create policy "Patiënt beheert eigen adherentie"
  on public.injection_adherence for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

create policy "Dokter leest adherentie van patiënten"
  on public.injection_adherence for select
  using (patient_id in (select public.get_my_patient_ids()));
