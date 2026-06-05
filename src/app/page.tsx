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
        <div style={{ background: 'white', borderRadius: 10, padding: '8px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
          <Image src="/yuverta-logo.png" alt="Yuverta" width={130} height={38} style={{ display: 'block' }} />
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

          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 600, margin: '32px auto 0', padding: '0 24px 40px' }}>
        <Link href="/groep" style={{ textDecoration: 'none' }}>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 120, cursor: 'pointer', boxShadow: '0 6px 28px rgba(0,0,0,0.4)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.4)' }}>
            <Image src="/knop-leerling.png" alt="Ik ben leerling" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
          </div>
        </Link>

        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 120, cursor: 'pointer', boxShadow: '0 6px 28px rgba(0,0,0,0.4)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.4)' }}>
            <Image src="/knop-beheer.png" alt="Beheer / Docent / Erik" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
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
