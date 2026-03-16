create table public.concerns (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  severity text not null check (severity in ('routine', 'urgent')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'reviewed')),
  doctor_response text,
  responded_at timestamptz
);

alter table public.concerns enable row level security;

-- Patiënt beheert eigen meldingen
create policy "Patiënt beheert eigen meldingen"
  on public.concerns for all
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- Dokter leest meldingen van eigen patiënten
create policy "Dokter leest patiëntmeldingen"
  on public.concerns for select
  using (patient_id in (select public.get_my_patient_ids()));

-- Dokter kan reageren (update status + response)
create policy "Dokter reageert op melding"
  on public.concerns for update
  using (patient_id in (select public.get_my_patient_ids()));

create index concerns_patient_status on public.concerns(patient_id, status);
