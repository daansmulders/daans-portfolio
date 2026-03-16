-- Medicijntypen (extensible referentietabel — nieuwe medicijnen toevoegen via INSERT)
create table public.drug_types (
  id text primary key,        -- bijv. 'ozempic', 'wegovy', 'mounjaro'
  name text not null,         -- weergavenaam
  sort_order int not null default 0
);

alter table public.drug_types enable row level security;

create policy "Iedereen leest medicijntypen"
  on public.drug_types for select
  to authenticated
  using (true);

insert into public.drug_types (id, name, sort_order) values
  ('ozempic',   'Ozempic',   1),
  ('wegovy',    'Wegovy',    2),
  ('mounjaro',  'Mounjaro',  3);

-- Medicijntype koppelen aan doseerregels
alter table public.dosage_schedule_entries
  add column drug_type_id text references public.drug_types(id);
