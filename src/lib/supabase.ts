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
  sessie_id?: string | null
  sessie_tijd?: string | null
}

// Eén login tegelijk per groep: een sessie verloopt als er 2 minuten geen teken van leven is
export const SESSIE_TIMEOUT_MS = 2 * 60 * 1000
export const SESSIE_HEARTBEAT_MS = 30 * 1000

export function sessieActief(g: Pick<Groep, 'sessie_id' | 'sessie_tijd'>) {
  if (!g.sessie_id || !g.sessie_tijd) return false
  return Date.now() - new Date(g.sessie_tijd).getTime() < SESSIE_TIMEOUT_MS
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
