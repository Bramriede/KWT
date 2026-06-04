-- =============================================
-- KWT Materialen App v3 — Supabase SQL Update
-- Voer dit uit in Supabase SQL Editor
-- =============================================

-- Admin config uitbreiden
drop table if exists admin_config cascade;
create table admin_config (
  id uuid primary key default gen_random_uuid(),
  docent_wachtwoord text not null default 'kwt2026',
  erik_wachtwoord text not null default 'erik2026',
  standaard_budget numeric(10,2) not null default 10.00
);
insert into admin_config (docent_wachtwoord, erik_wachtwoord, standaard_budget)
values ('kwt2026', 'erik2026', 10.00);

-- Rondes tabel
create table if not exists rondes (
  id uuid primary key default gen_random_uuid(),
  naam text not null,           -- bijv. "Ronde 1"
  leerjaar text not null,       -- "LJ1" of "LJ2"
  nummer int not null,          -- 1 t/m 5
  open boolean not null default true,
  aangemaakt_op timestamptz default now()
);

-- Materialen
create table if not exists materialen (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  wereld text not null default 'Alle',
  subcategorie text not null default 'Overig',
  eenheid text not null default 'stuk',
  prijs_per_eenheid numeric(10,2) not null,
  min_bestelling int not null default 1,
  max_bestelling int not null default 20,
  besteller text not null default 'Erik',
  actief boolean not null default true,
  aangemaakt_op timestamptz default now()
);

-- Groepen (nu met ronde_id en leerjaar)
create table if not exists groepen (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  pincode text not null,
  wereld text not null,
  projectnaam text,
  budget numeric(10,2) not null default 10.00,
  leerjaar text not null default 'LJ1',
  ronde_id uuid references rondes(id) on delete cascade,
  aangemaakt_op timestamptz default now()
);

-- Bestellingen
create table if not exists bestellingen (
  id uuid primary key default gen_random_uuid(),
  groep_id uuid not null references groepen(id) on delete cascade,
  materiaal_id uuid not null references materialen(id) on delete cascade,
  aantal int not null default 1,
  prijs_totaal numeric(10,2) not null,
  aangemaakt_op timestamptz default now(),
  unique(groep_id, materiaal_id)
);

-- RLS
alter table admin_config enable row level security;
alter table rondes enable row level security;
alter table materialen enable row level security;
alter table groepen enable row level security;
alter table bestellingen enable row level security;

create policy "allow all" on admin_config for all using (true) with check (true);
create policy "allow all" on rondes for all using (true) with check (true);
create policy "allow all" on materialen for all using (true) with check (true);
create policy "allow all" on groepen for all using (true) with check (true);
create policy "allow all" on bestellingen for all using (true) with check (true);

-- Rondes aanmaken (5 per leerjaar)
insert into rondes (naam, leerjaar, nummer, open) values
('Ronde 1', 'LJ1', 1, true),
('Ronde 2', 'LJ1', 2, false),
('Ronde 3', 'LJ1', 3, false),
('Ronde 4', 'LJ1', 4, false),
('Ronde 5', 'LJ1', 5, false),
('Ronde 1', 'LJ2', 1, true),
('Ronde 2', 'LJ2', 2, false),
('Ronde 3', 'LJ2', 3, false),
('Ronde 4', 'LJ2', 4, false),
('Ronde 5', 'LJ2', 5, false);

-- Materialen
insert into materialen (naam, wereld, subcategorie, eenheid, prijs_per_eenheid, min_bestelling, max_bestelling, besteller) values
('Lijmpatroon (per stuk)', 'Alle', 'Lijm', 'stuk', 0.25, 1, 20, 'Erik'),
('Houtlijm 100ml', 'Alle', 'Lijm', 'fles', 1.50, 1, 3, 'Erik'),
('Dubbelzijdig tape 5m', 'Alle', 'Lijm', 'rol', 0.80, 1, 5, 'Erik'),
('Lijmpistool (lenen)', 'Alle', 'Lijm', 'stuk', 0.00, 1, 1, 'Erik'),
('Karton A3', 'Alle', 'Karton', 'vel', 0.25, 1, 20, 'Erik'),
('Golfkarton A3', 'Alle', 'Karton', 'vel', 0.40, 1, 15, 'Erik'),
('Gekleurd karton A4', 'Alle', 'Karton', 'vel', 0.15, 2, 30, 'Erik'),
('Foam EVA vel', 'Alle', 'Karton', 'vel', 0.60, 1, 10, 'Erik'),
('IJslolliestokje', 'Techniek', 'Hout', 'stuk', 0.05, 5, 100, 'Erik'),
('Bamboestokje 30cm', 'Techniek', 'Hout', 'stuk', 0.10, 2, 50, 'Erik'),
('Balk 2x2x30cm', 'Techniek', 'Hout', 'stuk', 0.80, 1, 10, 'Erik'),
('Multiplex A4 3mm', 'Techniek', 'Hout', 'vel', 1.20, 1, 5, 'Erik'),
('Ronde stok 6mm 30cm', 'Techniek', 'Hout', 'stuk', 0.30, 1, 20, 'Erik'),
('Filament 3D printer 10g', 'Techniek', 'Elektronica', 'eenheid', 0.50, 1, 20, 'Erik'),
('LED lampje', 'Techniek', 'Elektronica', 'stuk', 0.20, 1, 20, 'Erik'),
('Koper draad 1m', 'Techniek', 'Elektronica', 'stuk', 0.30, 1, 10, 'Erik'),
('Batterijhouder AA', 'Techniek', 'Elektronica', 'stuk', 0.80, 1, 5, 'Erik'),
('Schroef M4 (per 10)', 'Techniek', 'Elektronica', 'zakje', 0.40, 1, 5, 'Erik'),
('Verf tube primair 30ml', 'Kunst', 'Verf', 'tube', 1.00, 1, 6, 'Erik'),
('Penseel set 3x', 'Kunst', 'Verf', 'set', 1.50, 1, 3, 'Erik'),
('Klei luchtdrogend 200g', 'Kunst', 'Verf', 'blok', 2.00, 1, 3, 'Erik'),
('Aquarelverf set', 'Kunst', 'Verf', 'set', 2.50, 1, 2, 'Erik'),
('Stiften set 10 kleuren', 'Kunst', 'Verf', 'set', 1.80, 1, 3, 'Erik'),
('Bloemzaad mix', 'Natuur', 'Groen', 'zakje', 1.00, 1, 5, 'Groene docent'),
('Potgrond 1L', 'Natuur', 'Groen', 'liter', 0.60, 1, 5, 'Groene docent'),
('Plantenpot 10cm', 'Natuur', 'Groen', 'stuk', 0.50, 1, 6, 'Groene docent'),
('Prikstokjes bamboe', 'Natuur', 'Groen', 'stuk', 0.10, 5, 30, 'Groene docent'),
('Kurk vel A4', 'Natuur', 'Groen', 'vel', 1.20, 1, 5, 'Groene docent'),
('Twijgjes bundel', 'Natuur', 'Groen', 'bundel', 0.80, 1, 5, 'Groene docent'),
('Sisal touw 2m', 'Natuur', 'Groen', 'stuk', 0.40, 1, 10, 'Groene docent'),
('Tijdschrift (oud)', 'Mens & Maatschappij', 'Overig', 'stuk', 0.00, 1, 5, 'Erik'),
('Kaartpapier A5', 'Mens & Maatschappij', 'Overig', 'vel', 0.10, 5, 40, 'Erik'),
('Schaar (lenen)', 'Mens & Maatschappij', 'Overig', 'stuk', 0.00, 1, 1, 'Erik'),
('Liniaal 30cm (lenen)', 'Mens & Maatschappij', 'Overig', 'stuk', 0.00, 1, 1, 'Erik');
