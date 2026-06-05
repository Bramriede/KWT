'use client'
import Link from 'next/link'
import Image from 'next/image'
import { WERELDEN } from '@/lib/supabase'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Schoolfoto achtergrond */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Image src="/yuverta-school.jpg" alt="Yuverta Boskoop" fill style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(27,31,107,0.92) 0%, rgba(27,31,107,0.85) 50%, rgba(26,58,32,0.88) 100%)' }} />
      </div>

      {/* Header met logo */}
      <header style={{ position: 'relative', zIndex: 1, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Image src="/yuverta-logo.png" alt="Yuverta" width={160} height={47} style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'Nunito', fontWeight: 600 }}>Boskoop</span>
      </header>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 60px' }}>
        
        {/* Titel */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'inline-block', background: 'rgba(150,212,0,0.15)', border: '1px solid rgba(150,212,0,0.3)', borderRadius: 99, padding: '6px 18px', marginBottom: 16 }}>
            <span style={{ color: '#96D400', fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Keuze Werktijd</span>
          </div>
          <h1 style={{ fontFamily: 'Nunito', fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.1 }}>
            KWT Materialen
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: 600 }}>
            Bestel slim — werk bewust met je budget
          </p>
        </div>

        {/* Werelden */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 36, maxWidth: 440, width: '100%' }}>
          {WERELDEN.map(w => (
            <div key={w.naam} style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 16px' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{w.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 14, color: 'white', marginBottom: 3 }}>{w.naam}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{w.beschrijving}</div>
            </div>
          ))}
        </div>

        {/* Knoppen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
          <Link href="/groep" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 14, padding: '18px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎒</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#1B1F6B' }}>Ik ben leerling</div>
                <div style={{ fontSize: 12, color: '#5a5a7a', marginTop: 2 }}>Inloggen met groepspincode</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 18, color: '#ccc' }}>→</div>
            </div>
          </Link>

          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(150,212,0,0.4)', borderRadius: 14, padding: '18px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(150,212,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🔑</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#96D400' }}>Beheer / Docent / Erik</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Materialen, rondes, groepen, overzicht</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 18, color: 'rgba(150,212,0,0.4)' }}>→</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 0 24px' }}>
        <Image src="/yuverta-logo.png" alt="Yuverta" width={80} height={24} style={{ filter: 'brightness(0) invert(1)', opacity: 0.2 }} />
      </div>
    </main>
  )
}
