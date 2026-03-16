-- Telefoonnummer toevoegen aan profielen (optioneel)
alter table public.profiles add column if not exists phone text;
