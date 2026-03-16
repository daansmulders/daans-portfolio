-- Apotheken
create table if not exists public.pharmacies (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  address text not null,
  city    text not null,
  phone   text
);

alter table public.pharmacies enable row level security;

-- Alle ingelogde gebruikers kunnen apotheken lezen
create policy "Authenticated users can read pharmacies"
  on public.pharmacies for select
  using (auth.role() = 'authenticated');

-- Apotheek koppelen aan patiënt
alter table public.patients
  add column if not exists pharmacy_id uuid references public.pharmacies(id);
