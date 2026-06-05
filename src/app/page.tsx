'use client'
import Link from 'next/link'
import Image from 'next/image'

const WERELDEN = [
  { naam: 'Techniek', img: '/wereld-techniek.png', kleur: '#1B4FCC', beschrijving: 'Bouwen, zagen, 3D-printen, uitvinden' },
  { naam: 'Kunst & Cultuur', img: '/wereld-kunst.png', kleur: '#7B2FBE', beschrijving: 'Schilderen, boetseren, handvaardigheid' },
  { naam: 'Natuur', img: '/wereld-natuur.png', kleur: '#1A6B3A', beschrijving: 'Planten, insecten, buiten ontdekken' },
  { naam: 'Mens & Maatschappij', img: '/wereld-reis.png', kleur: '#0A4A6B', beschrijving: 'Cultuur, samenleving, mensen & verhalen' },
]

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#0f1235', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, position: 'relative' }}>
        <div style={{ background: 'white', borderRadius: 10, padding: '8px 16px' }}>
          <Image src="/yuverta-logo.png" alt="Yuverta" width={130} height={38} style={{ display: 'block', filter: 'brightness(0) invert(1)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'Nunito', fontWeight: 700 }}>Keuze Werktijd — Boskoop</span>
        </div>
      </header>

      {/* Hero titel */}
      <div style={{ textAlign: 'center', padding: '10px 20px 32px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontFamily: 'Nunito', fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.05 }}>
          KWT <span style={{ color: '#96D400' }}>Materialen</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600 }}>Bestel slim — werk bewust met je budget</p>
      </div>

      {/* Wereld kaartjes — groot en visueel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, padding: '0 24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {WERELDEN.map(w => (
          <div key={w.naam} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', cursor: 'default' }}
            onMouseEnter={e => { (e.currentTarget.querySelector('.overlay') as HTMLElement).style.opacity = '0.5'; (e.currentTarget.querySelector('.img') as HTMLElement).style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { (e.currentTarget.querySelector('.overlay') as HTMLElement).style.opacity = '0.65'; (e.currentTarget.querySelector('.img') as HTMLElement).style.transform = 'scale(1)' }}>
            {/* Achtergrondafbeelding */}
            <div className="img" style={{ position: 'absolute', inset: 0, transition: 'transform 0.4s ease' }}>
              <Image src={w.img} alt={w.naam} fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
            </div>
            {/* Gradient overlay */}
            <div className="overlay" style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${w.kleur}cc 0%, ${w.kleur}55 100%)`, opacity: 0.65, transition: 'opacity 0.3s' }} />
            {/* Tekst */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px' }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 20, color: 'white', marginBottom: 4, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{w.naam}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{w.beschrijving}</div>
            </div>
            {/* Decoratief accent */}
            <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: '#96D400', boxShadow: '0 0 12px #96D400' }} />
          </div>
        ))}
      </div>

      {/* Inlog knoppen */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 500, margin: '32px auto 0', padding: '0 24px' }}>
        <Link href="/groep" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '18px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1B1F6B, #2a3094)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🎒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: '#1B1F6B' }}>Ik ben leerling</div>
              <div style={{ fontSize: 13, color: '#5a5a7a', marginTop: 2 }}>Inloggen met groepspincode</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#96D400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#1B1F6B' }}>→</div>
          </div>
        </Link>

        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(150,212,0,0.3)', borderRadius: 16, padding: '18px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.15s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.11)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(150,212,0,0.15)', border: '1px solid rgba(150,212,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🔑</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: '#96D400' }}>Beheer / Docent / Erik</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Materialen, rondes, groepen, overzicht</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(150,212,0,0.15)', border: '1px solid rgba(150,212,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#96D400' }}>→</div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '28px 0 24px', marginTop: 'auto' }}>
        <Image src="/yuverta-logo.png" alt="Yuverta" width={80} height={23} style={{ filter: 'brightness(0) invert(1)', opacity: 0.15, display: 'inline-block' }} />
      </div>
    </main>
  )
}
