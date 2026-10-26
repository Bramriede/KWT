'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase, WERELDEN, SUBCATEGORIEEN, sessieActief,type Groep, type Materiaal, type WereldNaam, type Leerjaar, type Ronde, type UserRole } from '@/lib/supabase'
import Link from 'next/link'

type Tab = 'rondes' | 'groepen' | 'materialen' | 'overzicht'

export default function Admin() {
  const [ingelogd, setIngelogd] = useState(false)
  const [rol, setRol] = useState<UserRole>('docent')
  const [ww, setWw] = useState('')
  const [fout, setFout] = useState('')
  const [tab, setTab] = useState<Tab>('overzicht')
  const [rondes, setRondes] = useState<Ronde[]>([])
  const [groepen, setGroepen] = useState<Groep[]>([])
  const [materialen, setMaterialen] = useState<Materiaal[]>([])
  const [bestellingen, setBestellingen] = useState<any[]>([])
  const [laden, setLaden] = useState(false)
  const [bewerkMateriaal, setBewerkMateriaal] = useState<string | null>(null)
  const [bewerkWaarden, setBewerkWaarden] = useState<Partial<Materiaal>>({})
  const [actiefLJ, setActiefLJ] = useState<Leerjaar>('LJ1')
  const [actieveRondeFilter, setActieveRondeFilter] = useState<string>('alle')

  const [ng, setNg] = useState({ naam: '', pincode: '', wereld: 'Techniek' as WereldNaam, budget: '10', leerjaar: 'LJ1' as Leerjaar, ronde_id: '' })
  const [nm, setNm] = useState({ naam: '', wereld: 'Alle', subcategorie: 'Hout', eenheid: 'stuk', prijs_per_eenheid: '', min_bestelling: '1', max_bestelling: '20', besteller: 'Erik' })

  const laadAlles = useCallback(async () => {
    setLaden(true)
    const [{ data: r }, { data: g }, { data: m }, { data: b }] = await Promise.all([
      supabase.from('rondes').select('*').order('leerjaar').order('nummer'),
      supabase.from('groepen').select('*, rondes(*)').order('aangemaakt_op', { ascending: false }),
      supabase.from('materialen').select('*').order('wereld').order('subcategorie').order('naam'),
      supabase.from('bestellingen').select('*, groepen(naam,wereld,projectnaam,budget,leerjaar,ronde_id,rondes(naam,leerjaar,nummer)), materialen(naam,eenheid,prijs_per_eenheid,besteller,subcategorie)')
    ])
    if (r) setRondes(r)
    if (g) setGroepen(g)
    if (m) setMaterialen(m)
    if (b) setBestellingen(b)
    if (r && r.length > 0) setNg(prev => ({ ...prev, ronde_id: r.find((x: Ronde) => x.leerjaar === 'LJ1' && x.open)?.id || r[0].id }))
    setLaden(false)
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const { data } = await supabase.from('admin_config').select('docent_wachtwoord, erik_wachtwoord').single()
    if (data?.erik_wachtwoord === ww) { setRol('erik'); setIngelogd(true); setTab('overzicht'); laadAlles() }
    else if (data?.docent_wachtwoord === ww) { setRol('docent'); setIngelogd(true); setTab('rondes'); laadAlles() }
    else setFout('Onjuist wachtwoord')
  }

  async function toggleRonde(id: string, open: boolean) {
    await supabase.from('rondes').update({ open: !open }).eq('id', id)
    laadAlles()
  }

  async function voegGroepToe(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('groepen').insert({ naam: ng.naam, pincode: ng.pincode, wereld: ng.wereld, budget: parseFloat(ng.budget), leerjaar: ng.leerjaar, ronde_id: ng.ronde_id })
    setNg(prev => ({ ...prev, naam: '', pincode: '' }))
    laadAlles()
  }

  async function verwijderGroep(id: string) {
    const g = groepen.find(x => x.id === id)
    if (!confirm(`Weet je het zeker?\n\nGroep "${g?.naam ?? ''}" wordt verwijderd, inclusief alle bestellingen van deze groep.\nDit kan niet ongedaan worden gemaakt.`)) return
    await supabase.from('groepen').delete().eq('id', id)
    laadAlles()
  }

  async function wisGroepen() {
    const doel = groepen.filter(g => g.leerjaar === actiefLJ && (actieveRondeFilter === 'alle' || g.ronde_id === actieveRondeFilter))
    if (doel.length === 0) { alert('Geen groepen om te wissen.'); return }
    const rondeNaam = actieveRondeFilter === 'alle' ? 'alle rondes' : rondes.find(r => r.id === actieveRondeFilter)?.naam
    const antwoord = prompt(`Weet je het zeker?\n\n${doel.length} groep(en) van ${actiefLJ} (${rondeNaam}) worden gewist, inclusief al hun bestellingen.\nDit kan niet ongedaan worden gemaakt.\n\nTyp WISSEN om te bevestigen:`)
    if (antwoord?.trim().toUpperCase() !== 'WISSEN') return
    await supabase.from('groepen').delete().in('id', doel.map(g => g.id))
    laadAlles()
  }

  async function geefSessieVrij(id: string) {
    await supabase.from('groepen').update({ sessie_id: null, sessie_tijd: null }).eq('id', id)
    laadAlles()
  }

  async function voegMateriaalToe(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('materialen').insert({ ...nm, prijs_per_eenheid: parseFloat(nm.prijs_per_eenheid), min_bestelling: parseInt(nm.min_bestelling), max_bestelling: parseInt(nm.max_bestelling) })
    setNm(prev => ({ ...prev, naam: '', prijs_per_eenheid: '' }))
    laadAlles()
  }

  async function slaMateriaalOp(id: string) {
    await supabase.from('materialen').update(bewerkWaarden).eq('id', id)
    setBewerkMateriaal(null)
    laadAlles()
  }

  async function toggleActief(id: string, actief: boolean) {
    await supabase.from('materialen').update({ actief: !actief }).eq('id', id)
    laadAlles()
  }

  async function verwijderMateriaal(id: string) {
    const m = materialen.find(x => x.id === id)
    if (!confirm(`Weet je het zeker?\n\nMateriaal "${m?.naam ?? ''}" wordt verwijderd uit de lijst. Bestellingen met dit materiaal verdwijnen ook.\n\nTip: wil je het alleen tijdelijk verbergen? Zet het dan op inactief.`)) return
    await supabase.from('materialen').delete().eq('id', id)
    laadAlles()
  }

  // Gefilterde bestellingen voor overzicht
  const gefilterdeBestellingen = bestellingen.filter(b => {
    const ljOk = b.groepen?.leerjaar === actiefLJ
    const rondeOk = actieveRondeFilter === 'alle' || b.groepen?.ronde_id === actieveRondeFilter
    return ljOk && rondeOk
  })

  // Inkoop per besteller (gefilterd)
  const inkoopPerBesteller = gefilterdeBestellingen.reduce((acc: Record<string, any[]>, b: any) => {
    const besteller = b.materialen?.besteller || 'Onbekend'
    if (!acc[besteller]) acc[besteller] = []
    const bestaand = acc[besteller].find((x: any) => x.materiaal_id === b.materiaal_id)
    if (bestaand) { bestaand.aantal += b.aantal; bestaand.prijs_totaal += b.prijs_totaal }
    else acc[besteller].push({ ...b, naam: b.materialen?.naam, eenheid: b.materialen?.eenheid, prijs_per_eenheid: b.materialen?.prijs_per_eenheid })
    return acc
  }, {})

  // Groepen per ronde/LJ (gefilterd)
  const groepBestellingen = groepen
    .filter(g => g.leerjaar === actiefLJ && (actieveRondeFilter === 'alle' || g.ronde_id === actieveRondeFilter))
    .map(g => {
      const best = bestellingen.filter(b => b.groep_id === g.id)
      const totaal = best.reduce((s: number, b: any) => s + b.prijs_totaal, 0)
      return { groep: g, best, totaal }
    })

  function exporteerExcel(items: any[], naam: string) {
    const rows = [
      ['Materiaal', 'Subcategorie', 'Eenheid', 'Prijs/stuk', 'Aantal', 'Totaal'],
      ...items.map((x: any) => [x.naam, x.materialen?.subcategorie || '', x.eenheid, `€${x.prijs_per_eenheid?.toFixed(2)}`, x.aantal, `€${x.prijs_totaal.toFixed(2)}`])
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `KWT-${naam}-${actiefLJ}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  function exporteerAllesExcel() {
    const rows: any[][] = [['Groep', 'Leerjaar', 'Ronde', 'Wereld', 'Project', 'Materiaal', 'Subcategorie', 'Besteller', 'Aantal', 'Prijs/stuk', 'Totaal']]
    gefilterdeBestellingen.forEach((b: any) => {
      rows.push([
        b.groepen?.naam, b.groepen?.leerjaar, b.groepen?.rondes?.naam,
        b.groepen?.wereld, b.groepen?.projectnaam || '',
        b.materialen?.naam, b.materialen?.subcategorie, b.materialen?.besteller,
        b.aantal, `€${b.materialen?.prijs_per_eenheid?.toFixed(2)}`, `€${b.prijs_totaal.toFixed(2)}`
      ])
    })
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `KWT-volledig-${actiefLJ}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const rondesVoorLJ = rondes.filter(r => r.leerjaar === actiefLJ)
  const inputStyle = { fontSize: 13, padding: '6px 10px' }

  if (!ingelogd) return (
    <main style={{ minHeight: '100vh', background: 'var(--wit)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <Link href="/" style={{ color: 'var(--subtekst)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 24 }}>← Terug</Link>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔑</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--blauw)' }}>KWT Beheer</h1>
            <p style={{ fontSize: 13, color: 'var(--subtekst)', marginTop: 4 }}>Docenten: kwt2026 · Erik: erik2026</p>
          </div>
          <form onSubmit={login}>
            <label>Wachtwoord</label>
            <input type="password" value={ww} onChange={e => setWw(e.target.value)} autoFocus style={{ marginBottom: 12 }} />
            {fout && <p style={{ color: 'var(--rood)', fontSize: 13, marginBottom: 10 }}>{fout}</p>}
            <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Inloggen →</button>
          </form>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--wit)', paddingBottom: 60 }}>
      <div style={{ background: 'var(--blauw)', padding: '14px 0', marginBottom: 20 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ color: '#96D400', fontWeight: 900, fontSize: 18 }}>
              {rol === 'erik' ? '📦 Erik — Inkoopoverzicht' : '🔑 KWT Beheer'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Yuverta Boskoop</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* LJ toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 9, padding: 3, gap: 3 }}>
              {(['LJ1', 'LJ2'] as Leerjaar[]).map(lj => (
                <button key={lj} onClick={() => setActiefLJ(lj)} style={{ padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, background: actiefLJ === lj ? '#96D400' : 'transparent', color: actiefLJ === lj ? '#1B1F6B' : 'rgba(255,255,255,0.6)', transition: 'all 0.15s' }}>{lj}</button>
              ))}
            </div>
            <Link href="/" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}>← Home</Link>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, boxShadow: 'var(--shadow-sm)', marginBottom: 20, width: 'fit-content', border: '1.5px solid var(--rand)', flexWrap: 'wrap' }}>
          {(rol === 'erik'
            ? [['overzicht', '📋 Besteloverzicht']] as [Tab, string][]
            : [['rondes', '📅 Rondes'], ['groepen', '👥 Groepen'], ['materialen', '📦 Materialen'], ['overzicht', '📋 Besteloverzicht']] as [Tab, string][]
          ).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t as Tab)} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 800, fontSize: 13, background: tab === t ? 'var(--blauw)' : 'transparent', color: tab === t ? 'white' : 'var(--subtekst)', transition: 'all 0.12s' }}>{label}</button>
          ))}
        </div>

        {/* ===== RONDES ===== */}
        {tab === 'rondes' && (
          <div className="card">
            <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 16, color: 'var(--blauw)' }}>📅 Rondes — {actiefLJ}</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {rondesVoorLJ.map(r => {
                const aantalGroepen = groepen.filter(g => g.ronde_id === r.id).length
                const aantalBestellingen = bestellingen.filter(b => b.groepen?.ronde_id === r.id).length
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: r.open ? '#F0FDF4' : 'var(--lichtgrijs)', borderRadius: 12, border: r.open ? '1.5px solid #86EFAC' : '1.5px solid var(--rand)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{r.naam}</div>
                      <div style={{ fontSize: 12, color: 'var(--subtekst)', marginTop: 2 }}>{aantalGroepen} groepen · {aantalBestellingen} bestellingen</div>
                    </div>
                    <span className={`badge ${r.open ? 'badge-groen' : 'badge-rood'}`}>{r.open ? '🟢 Open' : '🔴 Gesloten'}</span>
                    <button
                      onClick={() => toggleRonde(r.id, r.open)}
                      className={`btn btn-sm ${r.open ? 'btn-danger' : 'btn-groen'}`}
                    >
                      {r.open ? '🔒 Sluiten' : '🔓 Openen'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ===== GROEPEN ===== */}
        {tab === 'groepen' && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14, color: 'var(--blauw)' }}>➕ Nieuwe groep — {actiefLJ}</h2>
              <form onSubmit={voegGroepToe} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <div><label>Groepsnaam</label><input value={ng.naam} onChange={e => setNg({...ng, naam: e.target.value})} placeholder="Groep Bruggen" required /></div>
                <div><label>Pincode</label><input value={ng.pincode} onChange={e => setNg({...ng, pincode: e.target.value})} placeholder="1234" required /></div>
                <div><label>Wereld</label>
                  <select value={ng.wereld} onChange={e => setNg({...ng, wereld: e.target.value as WereldNaam})}>
                    {WERELDEN.map(w => <option key={w.naam} value={w.naam}>{w.emoji} {w.naam}</option>)}
                  </select>
                </div>
                <div><label>Ronde</label>
                  <select value={ng.ronde_id} onChange={e => setNg({...ng, ronde_id: e.target.value})}>
                    {rondesVoorLJ.map(r => <option key={r.id} value={r.id}>{r.naam} {r.open ? '🟢' : '🔴'}</option>)}
                  </select>
                </div>
                <div><label>Budget €</label><input type="number" step="0.50" value={ng.budget} onChange={e => setNg({...ng, budget: e.target.value})} required /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-groen" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Aanmaken</button>
                </div>
              </form>
            </div>

            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14, color: 'var(--blauw)' }}>👥 Groepen — {actiefLJ}</h2>
              {/* Filter per ronde */}
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
                <button onClick={() => setActieveRondeFilter('alle')} style={{ padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, background: actieveRondeFilter === 'alle' ? 'var(--blauw)' : 'var(--lichtgrijs)', color: actieveRondeFilter === 'alle' ? 'white' : 'var(--subtekst)' }}>Alle rondes</button>
                {rondesVoorLJ.map(r => (
                  <button key={r.id} onClick={() => setActieveRondeFilter(r.id)} style={{ padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, background: actieveRondeFilter === r.id ? 'var(--blauw)' : 'var(--lichtgrijs)', color: actieveRondeFilter === r.id ? 'white' : 'var(--subtekst)' }}>{r.naam} {r.open ? '🟢' : '🔴'}</button>
                ))}
                <button className="btn btn-danger btn-sm" onClick={wisGroepen} style={{ marginLeft: 'auto' }}>🗑 Groepen in deze selectie wissen</button>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {groepen.filter(g => g.leerjaar === actiefLJ && (actieveRondeFilter === 'alle' || g.ronde_id === actieveRondeFilter)).map(g => {
                  const w = WERELDEN.find(x => x.naam === g.wereld)
                  const gb = bestellingen.filter(b => b.groep_id === g.id)
                  const tot = gb.reduce((s: number, b: any) => s + b.prijs_totaal, 0)
                  const pct = Math.min(100, (tot / g.budget) * 100)
                  const ronde = rondes.find(r => r.id === g.ronde_id)
                  return (
                    <div key={g.id} style={{ padding: '12px 14px', background: 'var(--lichtgrijs)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{w?.emoji} {g.naam} <span style={{ fontSize: 11, color: 'var(--subtekst)', fontWeight: 400 }}>· {ronde?.naam}</span></div>
                        <div style={{ fontSize: 12, color: 'var(--subtekst)', display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                          <span>PIN: <code style={{ fontFamily: 'Space Mono, monospace', background: 'white', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{g.pincode}</code></span>
                          {g.projectnaam && <span>📋 {g.projectnaam}</span>}
                          {sessieActief(g) && <span className="badge badge-groen">🟢 Leerling ingelogd <button onClick={() => geefSessieVrij(g.id)} style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: 'inherit', fontSize: 11, fontWeight: 700 }}>vrijgeven</button></span>}
                        </div>
                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="budget-bar-wrap" style={{ flex: 1, height: 6 }}><div className="budget-bar" style={{ width: `${pct}%`, background: pct > 90 ? '#DC2626' : pct > 70 ? '#D97706' : '#16A34A' }} /></div>
                          <span style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', fontWeight: 700, color: tot > g.budget ? 'var(--rood)' : 'var(--subtekst)' }}>€{tot.toFixed(2)}/€{g.budget.toFixed(2)}</span>
                        </div>
                      </div>
                      <button onClick={() => verwijderGroep(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rood)', fontSize: 16, padding: 4 }}>🗑</button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== MATERIALEN ===== */}
        {tab === 'materialen' && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14, color: 'var(--blauw)' }}>➕ Nieuw materiaal</h2>
              <form onSubmit={voegMateriaalToe} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div><label>Naam</label><input value={nm.naam} onChange={e => setNm({...nm, naam: e.target.value})} placeholder="IJslolliestokje" required /></div>
                <div><label>Wereld</label>
                  <select value={nm.wereld} onChange={e => setNm({...nm, wereld: e.target.value})}>
                    <option value="Alle">🌐 Alle werelden</option>
                    {WERELDEN.map(w => <option key={w.naam} value={w.naam}>{w.emoji} {w.naam}</option>)}
                  </select>
                </div>
                <div><label>Subcategorie</label>
                  <select value={nm.subcategorie} onChange={e => setNm({...nm, subcategorie: e.target.value})}>
                    {SUBCATEGORIEEN.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label>Eenheid</label><input value={nm.eenheid} onChange={e => setNm({...nm, eenheid: e.target.value})} required /></div>
                <div><label>Prijs €</label><input type="number" step="0.01" value={nm.prijs_per_eenheid} onChange={e => setNm({...nm, prijs_per_eenheid: e.target.value})} placeholder="0.05" required /></div>
                <div><label>Max</label><input type="number" value={nm.max_bestelling} onChange={e => setNm({...nm, max_bestelling: e.target.value})} /></div>
                <div><label>Besteller</label>
                  <select value={nm.besteller} onChange={e => setNm({...nm, besteller: e.target.value})}>
                    <option>Erik</option><option>Groene docent</option><option>Docent</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-groen" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Toevoegen</button>
                </div>
              </form>
            </div>
            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14, color: 'var(--blauw)' }}>📦 Catalogus ({materialen.length})</h2>
              <div style={{ display: 'grid', gap: 6 }}>
                {materialen.map(m => {
                  const bezig = bewerkMateriaal === m.id
                  return (
                    <div key={m.id} style={{ padding: '10px 14px', background: m.actief ? (m.besteller === 'Groene docent' ? '#F0FDF4' : 'var(--lichtgrijs)') : '#f5f0f0', borderRadius: 10, opacity: m.actief ? 1 : 0.55, borderLeft: m.besteller === 'Groene docent' ? '3px solid #16A34A' : '3px solid transparent' }}>
                      {!bezig ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <span style={{ fontWeight: 800, fontSize: 14 }}>{m.naam}</span>
                            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--subtekst)' }}>
                              {m.wereld === 'Alle' ? '🌐' : WERELDEN.find(w => w.naam === m.wereld)?.emoji} {m.subcategorie} · <strong style={{ fontFamily: 'Space Mono, monospace' }}>€{m.prijs_per_eenheid.toFixed(2)}</strong>/{m.eenheid} · max {m.max_bestelling}
                              {m.besteller === 'Groene docent' && <span className="badge badge-groen" style={{ marginLeft: 6 }}>🌿 Groene docent</span>}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm btn-ghost" onClick={() => { setBewerkMateriaal(m.id); setBewerkWaarden({ naam: m.naam, prijs_per_eenheid: m.prijs_per_eenheid, max_bestelling: m.max_bestelling, besteller: m.besteller, eenheid: m.eenheid }) }}>✏️</button>
                            <button onClick={() => toggleActief(m.id, m.actief)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, background: m.actief ? '#DCFCE7' : '#FEE2E2', color: m.actief ? '#166534' : '#B91C1C' }}>{m.actief ? '✓' : '✗'}</button>
                            <button onClick={() => verwijderMateriaal(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rood)', fontSize: 15, padding: 2 }}>🗑</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 10 }}>
                            <div><label>Naam</label><input style={inputStyle} value={bewerkWaarden.naam || ''} onChange={e => setBewerkWaarden({...bewerkWaarden, naam: e.target.value})} /></div>
                            <div><label>Prijs €</label><input style={inputStyle} type="number" step="0.01" value={bewerkWaarden.prijs_per_eenheid || ''} onChange={e => setBewerkWaarden({...bewerkWaarden, prijs_per_eenheid: parseFloat(e.target.value)})} /></div>
                            <div><label>Eenheid</label><input style={inputStyle} value={bewerkWaarden.eenheid || ''} onChange={e => setBewerkWaarden({...bewerkWaarden, eenheid: e.target.value})} /></div>
                            <div><label>Max</label><input style={inputStyle} type="number" value={bewerkWaarden.max_bestelling || ''} onChange={e => setBewerkWaarden({...bewerkWaarden, max_bestelling: parseInt(e.target.value)})} /></div>
                            <div><label>Besteller</label>
                              <select style={inputStyle} value={bewerkWaarden.besteller || 'Erik'} onChange={e => setBewerkWaarden({...bewerkWaarden, besteller: e.target.value})}>
                                <option>Erik</option><option>Groene docent</option><option>Docent</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-groen btn-sm" onClick={() => slaMateriaalOp(m.id)}>Opslaan ✓</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setBewerkMateriaal(null)}>Annuleren</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== OVERZICHT ===== */}
        {tab === 'overzicht' && (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--subtekst)' }}>Ronde:</span>
              <button onClick={() => setActieveRondeFilter('alle')} style={{ padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, background: actieveRondeFilter === 'alle' ? 'var(--blauw)' : 'var(--lichtgrijs)', color: actieveRondeFilter === 'alle' ? 'white' : 'var(--subtekst)' }}>Alle</button>
              {rondesVoorLJ.map(r => (
                <button key={r.id} onClick={() => setActieveRondeFilter(r.id)} style={{ padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, background: actieveRondeFilter === r.id ? 'var(--blauw)' : 'var(--lichtgrijs)', color: actieveRondeFilter === r.id ? 'white' : 'var(--subtekst)' }}>{r.naam}</button>
              ))}
              <button className="btn btn-groen btn-sm" onClick={exporteerAllesExcel} style={{ marginLeft: 'auto' }}>⬇ Alles exporteren (Excel)</button>
              <button className="btn btn-danger btn-sm" onClick={wisGroepen}>🗑 Groepen + bestellingen wissen</button>
            </div>

            {/* Per groep */}
            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 16, color: 'var(--blauw)' }}>📋 Bestellingen per groep — {actiefLJ}</h2>
              {groepBestellingen.filter(x => x.best.length > 0).length === 0
                ? <p style={{ color: 'var(--subtekst)', fontSize: 13 }}>Nog geen bestellingen.</p>
                : groepBestellingen.filter(x => x.best.length > 0).map(({ groep: g, best, totaal }) => {
                  const w = WERELDEN.find(x => x.naam === g.wereld)
                  const ronde = rondes.find(r => r.id === g.ronde_id)
                  return (
                    <div key={g.id} style={{ marginBottom: 20, paddingLeft: 16, borderLeft: `4px solid ${w?.kleur || 'var(--blauw)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontWeight: 900, fontSize: 15 }}>
                          {w?.emoji} {g.naam} <span style={{ fontSize: 12, color: 'var(--subtekst)', fontWeight: 400 }}>· {ronde?.naam}</span>
                          {g.projectnaam && <span style={{ fontWeight: 400, color: 'var(--subtekst)', marginLeft: 8 }}>— {g.projectnaam}</span>}
                        </div>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, color: totaal > g.budget ? 'var(--rood)' : 'var(--blauw)', fontSize: 14 }}>€{totaal.toFixed(2)} / €{g.budget.toFixed(2)}</span>
                      </div>
                      {best.map((b: any) => (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--rand)' }}>
                          <span>{b.materialen?.naam} <span style={{ color: b.materialen?.besteller === 'Groene docent' ? '#16A34A' : 'var(--subtekst)', fontSize: 11, fontWeight: 700 }}>via {b.materialen?.besteller}</span></span>
                          <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--subtekst)' }}>{b.aantal}× = €{b.prijs_totaal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )
                })
              }
            </div>

            {/* Per besteller — Erik eerst, dan Groene docent duidelijk gemarkeerd */}
            {['Erik', 'Groene docent', 'Docent'].map(besteller => {
              const items = inkoopPerBesteller[besteller]
              if (!items || items.length === 0) return null
              const totaalBesteller = items.reduce((s: number, x: any) => s + x.prijs_totaal, 0)
              const isGroen = besteller === 'Groene docent'
              return (
                <div key={besteller} className="card" style={{ borderLeft: isGroen ? '4px solid #16A34A' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h2 style={{ fontWeight: 900, fontSize: 16, color: isGroen ? '#16A34A' : 'var(--blauw)' }}>
                        {isGroen ? '🌿' : '🛒'} Inkooplijst — {besteller}
                      </h2>
                      {isGroen && <p style={{ fontSize: 12, color: '#16A34A', marginTop: 2 }}>⚠️ Erik geeft deze lijst door aan de groene docent</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 16, color: isGroen ? '#16A34A' : 'var(--blauw)' }}>€{totaalBesteller.toFixed(2)}</span>
                      <button className={`btn btn-sm ${isGroen ? '' : 'btn-groen'}`} style={isGroen ? { background: '#DCFCE7', color: '#166534' } : {}} onClick={() => exporteerExcel(items, besteller.replace(' ', '-'))}>⬇ Excel</button>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--rand)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 800, color: 'var(--subtekst)', fontSize: 11, textTransform: 'uppercase' }}>Materiaal</th>
                        <th style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 800, color: 'var(--subtekst)', fontSize: 11, textTransform: 'uppercase' }}>Aantal</th>
                        <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 800, color: 'var(--subtekst)', fontSize: 11, textTransform: 'uppercase' }}>Totaal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((x: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--rand)' }}>
                          <td style={{ padding: '9px 4px' }}>
                            <div style={{ fontWeight: 700 }}>{x.naam}</div>
                            <div style={{ fontSize: 11, color: 'var(--subtekst)' }}>€{x.prijs_per_eenheid?.toFixed(2)} / {x.eenheid}</div>
                          </td>
                          <td style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 18 }}>{x.aantal}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: isGroen ? '#16A34A' : 'var(--blauw)' }}>€{x.prijs_totaal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} style={{ padding: '10px 4px', fontWeight: 900, textAlign: 'right' }}>Totaal:</td>
                        <td style={{ textAlign: 'right', fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 18, color: isGroen ? '#16A34A' : 'var(--blauw)', padding: '10px 4px' }}>€{totaalBesteller.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            })}

            {Object.keys(inkoopPerBesteller).length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--subtekst)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <p>Nog geen bestellingen voor {actiefLJ}{actieveRondeFilter !== 'alle' ? ` · ${rondes.find(r => r.id === actieveRondeFilter)?.naam}` : ''}.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
