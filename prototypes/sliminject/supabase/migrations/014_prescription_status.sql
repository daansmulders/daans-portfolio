-- Prescriptiestatus toevoegen aan medicatieschema
-- Bestaande entries zijn al 'approved' (backward compat)
-- Nieuwe entries beginnen als 'draft' totdat de dokter ze goedkeurt

alter table public.dosage_schedule_entries
  add column if not exists status text not null default 'approved'
    check (status in ('draft', 'approved'));
