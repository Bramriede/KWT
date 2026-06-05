'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

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
      .from('groepen').select('*, rondes(*)')
      .eq('pincode', pincode.trim()).single()
    setLaden(false)
    if (error || !data) { setFout('Pincode niet gevonden. Vraag je leraar om de juiste code.'); return }
    if (!data.rondes?.open) { setFout('Deze ronde is afgesloten. Vraag je docent om hulp.'); return }
    sessionStorage.setItem('groep', JSON.stringify(data))
    router.push('/bestellen')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--wit)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'var(--blauw)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Image src="/yuverta-logo.png" alt="Yuverta" width={120} height={35} style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Nunito', fontWeight: 700 }}>KWT Materialen</span>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link href="/" style={{ color: 'var(--subtekst)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 28 }}>← Terug naar home</Link>
          <div className="card" style={{ padding: 36 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 14px' }}>🎒</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--blauw)' }}>Inloggen</h1>
              <p style={{ color: 'var(--subtekst)', fontSize: 14, marginTop: 5 }}>Vul de pincode van jouw groep in</p>
            </div>
            <form onSubmit={inloggen}>
              <div style={{ marginBottom: 20 }}>
                <label>Groepspincode</label>
                <input type="text" value={pincode} onChange={e => setPincode(e.target.value)}
                  placeholder="· · · ·" maxLength={10} required autoFocus
                  style={{ fontSize: 36, fontFamily: 'Space Mono, monospace', textAlign: 'center', letterSpacing: '0.5em', padding: '16px' }} />
              </div>
              {fout && <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px 14px', borderRadius: 9, fontSize: 14, marginBottom: 16, border: '1px solid #FCA5A5' }}>{fout}</div>}
              <button className="btn btn-primary" type="submit" disabled={laden} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '13px' }}>
                {laden ? 'Even kijken...' : 'Inloggen →'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--subtekst)', fontSize: 12, marginTop: 20 }}>Geen pincode? Vraag die aan je KWT-docent.</p>
        </div>
      </div>
    </main>
  )
}
