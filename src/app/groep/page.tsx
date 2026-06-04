'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function GroepLogin() {
  const router = useRouter()
  const [pincode, setPincode] = useState('')
  const [fout, setFout] = useState('')
  const [laden, setLaden] = useState(false)

  async function inloggen(e: React.FormEvent) {
    e.preventDefault()
    setFout('')
    setLaden(true)

    const { data, error } = await supabase
      .from('groepen')
      .select('*, rondes(*)')
      .eq('pincode', pincode.trim())
      .single()

    setLaden(false)

    if (error || !data) {
      setFout('Pincode niet gevonden. Vraag je leraar om de juiste code.')
      return
    }

    // Check of ronde open is
    if (!data.rondes?.open) {
      setFout('Deze ronde is afgesloten. Je kunt niet meer bestellen. Vraag je docent om hulp.')
      return
    }

    sessionStorage.setItem('groep', JSON.stringify(data))
    router.push('/bestellen')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--wit)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link href="/" style={{ color: 'var(--subtekst)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 28 }}>← Terug naar home</Link>

        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🎒</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--blauw)' }}>Inloggen</h1>
            <p style={{ color: 'var(--subtekst)', fontSize: 14, marginTop: 5 }}>Vul de pincode van jouw groep in</p>
          </div>

          <form onSubmit={inloggen}>
            <div style={{ marginBottom: 20 }}>
              <label>Groepspincode</label>
              <input
                type="text" value={pincode} onChange={e => setPincode(e.target.value)}
                placeholder="bijv. 1234" maxLength={10} required autoFocus
                style={{ fontSize: 32, fontFamily: 'Space Mono, monospace', textAlign: 'center', letterSpacing: '0.4em', padding: '14px' }}
              />
            </div>
            {fout && (
              <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px 14px', borderRadius: 9, fontSize: 14, marginBottom: 16, border: '1px solid #FCA5A5' }}>
                {fout}
              </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={laden} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '13px' }}>
              {laden ? 'Even kijken...' : 'Verder →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--subtekst)', fontSize: 12, marginTop: 20 }}>Heb je geen pincode? Vraag die aan je KWT-docent.</p>
      </div>
    </main>
  )
}
