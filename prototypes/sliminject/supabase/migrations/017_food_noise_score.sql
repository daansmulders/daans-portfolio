-- Migration 017: Add food_noise_score to progress_entries
-- Food noise is a daily 1–5 score logged alongside weight and hunger.
-- All existing rows remain valid (NULL = not recorded).

alter table public.progress_entries
  add column food_noise_score int check (food_noise_score between 1 and 5);
