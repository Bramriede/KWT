'use client'
import Link from 'next/link'
import { WERELDEN } from '@/lib/supabase'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1B1F6B 0%, #2a3080 60%, #1a3a20 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🏫</div>
        <h1 style={{ fontFamily: 'Nunito', fontSize: 38, fontWeight: 900, color: '#96D400', letterSpacing: '-0.02em', marginBottom: 6 }}>KWT Materialen</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: 600 }}>Yuverta Boskoop — Keuze Werktijd</p>
      </div>

      {/* Werelden preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 36, maxWidth: 420, width: '100%' }}>
        {WERELDEN.map(w => (
          <div key={w.naam} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{w.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'white' }}>{w.naam}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, lineHeight: 1.4 }}>{w.beschrijving}</div>
          </div>
        ))}
      </div>

      {/* Keuze knoppen */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}>
        <Link href="/groep" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 36 }}>🎒</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: '#1B1F6B' }}>Ik ben leerling</div>
              <div style={{ fontSize: 12, color: '#5a5a7a', marginTop: 2 }}>Inloggen met groepspincode</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 20, color: '#ccc' }}>→</div>
          </div>
        </Link>

        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'rgba(255,255,255,0.10)', border: '1.5px solid rgba(150,212,0,0.35)', borderRadius: 14, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}>
            <div style={{ fontSize: 36 }}>🔑</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, color: '#96D400' }}>Beheer / Docent</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Materialen, prijzen, groepen, overzicht</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 20, color: 'rgba(150,212,0,0.5)' }}>→</div>
          </div>
        </Link>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 48, fontFamily: 'Space Mono, monospace' }}>
        Yuverta Boskoop · KWT {new Date().getFullYear()}
      </p>
    </main>
  )
}
