-- Moet vóór patients aangemaakt worden (foreign key)
create table public.doctors (
  id uuid primary key references public.profiles(id) on delete cascade
);

alter table public.doctors enable row level security;

-- Dokter leest eigen rij
create policy "Dokter leest eigen rij"
  on public.doctors for select
  using (auth.uid() = id);

-- Patiënten kunnen hun dokter niet zien via deze tabel (alleen via profiel)
