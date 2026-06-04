import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

export type WereldNaam = 'Techniek' | 'Kunst' | 'Natuur' | 'Mens & Maatschappij'
export type Leerjaar = 'LJ1' | 'LJ2'
export type UserRole = 'docent' | 'erik'

export const WERELDEN: { naam: WereldNaam; emoji: string; kleur: string; bg: string; beschrijving: string }[] = [
  { naam: 'Techniek',            emoji: '⚙️', kleur: '#1B4FCC', bg: '#EEF2FF', beschrijving: 'Bouwen, zagen, 3D-printen, uitvinden' },
  { naam: 'Kunst',               emoji: '🎨', kleur: '#9333EA', bg: '#F5F3FF', beschrijving: 'Schilderen, boetseren, handvaardigheid' },
  { naam: 'Natuur',              emoji: '🌿', kleur: '#16A34A', bg: '#F0FDF4', beschrijving: 'Planten, insecten, buiten ontdekken' },
  { naam: 'Mens & Maatschappij', emoji: '🌍', kleur: '#D97706', bg: '#FFFBEB', beschrijving: 'Cultuur, samenleving, mensen & verhalen' },
]

export const SUBCATEGORIEEN = ['Lijm', 'Hout', 'Karton', 'Elektronica', 'Groen', 'Verf', 'Overig']

export interface Ronde {
  id: string
  naam: string
  leerjaar: Leerjaar
  nummer: number
  open: boolean
}

export interface Materiaal {
  id: string
  naam: string
  wereld: string
  subcategorie: string
  eenheid: string
  prijs_per_eenheid: number
  min_bestelling: number
  max_bestelling: number
  besteller: string
  actief: boolean
}

export interface Groep {
  id: string
  naam: string
  pincode: string
  wereld: WereldNaam
  projectnaam: string | null
  budget: number
  leerjaar: Leerjaar
  ronde_id: string
  rondes?: Ronde
}

// Excel export helper
export function exporteerExcel(data: any[][], bestandsnaam: string) {
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'KWT')
    XLSX.writeFile(wb, `${bestandsnaam}.xlsx`)
  })
}
