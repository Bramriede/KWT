# KWT Materialen App v2 — Yuverta Boskoop

## Wat doet de app

- 🎒 Leerlingen loggen in met groepspincode → vullen projectnaam in → bestellen materialen
- 🛒 Winkelmandje met live budgetmeter — overschrijding = blokkade
- 🔍 Zoekbalk + subcategorie-filter (Lijm / Hout / Karton / etc.)
- 🌍 Werelden als hoofdcategorie: Techniek / Kunst / Natuur / Mens & Maatschappij
- 🌐 Materialen kunnen voor "Alle" werelden gelden (bijv. lijm, karton)
- 🔑 Beheerderspaneel: groepen, materialen + prijzen bewerken, besteloverzicht
- 🛒 Aparte inkooplijst per besteller (Erik / Groene docent / etc.) met CSV export

## Online zetten (gratis)

### 1. Supabase (database)
1. Ga naar [supabase.com](https://supabase.com) → maak gratis account + project
2. Ga naar SQL Editor → plak `supabase-setup.sql` → Run
3. Ga naar Settings → API → kopieer Project URL en anon key

### 2. GitHub (code)
1. Ga naar [github.com](https://github.com) → New repository (bijv. `kwt-materialen`)
2. Upload alle bestanden uit deze map

### 3. Vercel (hosting)
1. Ga naar [vercel.com](https://vercel.com) → New Project → importeer je GitHub repo
2. Voeg toe bij Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → jouw Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → jouw anon key
3. Klik Deploy → je krijgt een gratis URL!

## Standaard instellingen
- Admin wachtwoord: `kwt2026` (aanpassen via Supabase → admin_config tabel)
- Budget per groep: €10,00 (instelbaar per groep)
