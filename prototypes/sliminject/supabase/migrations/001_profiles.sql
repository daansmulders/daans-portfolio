-- Profielen (uitbreiding op Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'doctor')),
  full_name text not null,
  created_at timestamptz not null default now()
);

-- RLS inschakelen
alter table public.profiles enable row level security;

-- Gebruiker kan eigen profiel lezen
create policy "Eigen profiel lezen"
  on public.profiles for select
  using (auth.uid() = id);

-- Gebruiker kan eigen profiel aanmaken (via trigger bij registratie)
-- NOTE: "Dokter leest patiëntprofielen" policy is in 004_rls_core.sql (requires patients table)
create policy "Eigen profiel aanmaken"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Gebruiker kan eigen profiel bijwerken
create policy "Eigen profiel bijwerken"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: maak automatisch profiel aan bij nieuwe gebruiker
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
