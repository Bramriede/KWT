-- KWT Materialen v4 — één login tegelijk per groep
-- Voer dit uit in Supabase SQL Editor
alter table groepen add column if not exists sessie_id text;
alter table groepen add column if not exists sessie_tijd timestamptz;

-- v5: leerlingen per groep
alter table groepen add column if not exists leerlingen text;

-- v6: bestellers hernoemen
update materialen set besteller = 'Besteller Techniek' where besteller = 'Erik';
update materialen set besteller = 'Besteller Groen' where besteller = 'Groene docent';
update materialen set besteller = 'Besteller Kunst & Cultuur' where besteller = 'Docent';
alter table materialen alter column besteller set default 'Besteller Techniek';
