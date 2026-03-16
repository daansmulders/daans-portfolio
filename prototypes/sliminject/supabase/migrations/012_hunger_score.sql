-- Welzijnsscore vervangen door hongergevoel
-- Wellbeing_score optioneel maken (bestaande data behouden)
alter table public.progress_entries
  alter column wellbeing_score drop not null;

-- Hongergevoel toevoegen (1 = geen honger, 5 = heel veel honger)
alter table public.progress_entries
  add column hunger_score int check (hunger_score between 1 and 5);
