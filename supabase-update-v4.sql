-- KWT Materialen v4 — één login tegelijk per groep
-- Voer dit uit in Supabase SQL Editor
alter table groepen add column if not exists sessie_id text;
alter table groepen add column if not exists sessie_tijd timestamptz;
