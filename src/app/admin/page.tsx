'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase, WERELDEN, SUBCATEGORIEEN, type Groep, type Materiaal, type WereldNaam } from '@/lib/supabase'
import Link from 'next/link'

type Tab = 'groepen' | 'materialen' | 'overzicht'

export default function Admin() {
  const [ingelogd, setIngelogd] = useState(false)
  const [ww, setWw] = useState('')
  const [fout, setFout] = useState('')
  const [tab, setTab] = useState<Tab>('groepen')
  const [groepen, setGroepen] = useState<Groep[]>([])
  const [materialen, setMaterialen] = useState<Materiaal[]>([])
  const [bestellingen, setBestellingen] = useState<any[]>([])
  const [laden, setLaden] = useState(false)
  const [bewerkMateriaal, setBewerkMateriaal] = useState<string | null>(null)
  const [bewerkWaarden, setBewerkWaarden] = useState<Partial<Materiaal>>({})

  // Nieuwe groep
  const [ng, setNg] = useState({ naam: '', pincode: '', wereld: 'Techniek' as WereldNaam, budget: '10' })
  // Nieuw materiaal
  const [nm, setNm] = useState({ naam: '', wereld: 'Alle', subcategorie: 'Hout', eenheid: 'stuk', prijs_per_eenheid: '', min_bestelling: '1', max_bestelling: '20', besteller: 'Erik' })

  const laadAlles = useCallback(async () => {
    setLaden(true)
    const [{ data: g }, { data: m }, { data: b }] = await Promise.all([
      supabase.from('groepen').select('*').order('aangemaakt_op', { ascending: false }),
      supabase.from('materialen').select('*').order('wereld').order('subcategorie').order('naam'),
      supabase.from('bestellingen').select('*, groepen(naam,wereld,projectnaam,budget), materialen(naam,eenheid,prijs_per_eenheid,besteller)')
    ])
    if (g) setGroepen(g)
    if (m) setMaterialen(m)
    if (b) setBestellingen(b)
    setLaden(false)
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const { data } = await supabase.from('admin_config').select('beheer_wachtwoord').single()
    if (data?.beheer_wachtwoord === ww) { setIngelogd(true); laadAlles() }
    else setFout('Onjuist wachtwoord')
  }

  async function voegGroepToe(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('groepen').insert({ naam: ng.naam, pincode: ng.pincode, wereld: ng.wereld, budget: parseFloat(ng.budget) })
    setNg({ naam: '', pincode: '', wereld: 'Techniek', budget: '10' })
    laadAlles()
  }

  async function verwijderGroep(id: string) {
    if (!confirm('Groep + alle bestellingen verwijderen?')) return
    await supabase.from('groepen').delete().eq('id', id)
    laadAlles()
  }

  async function voegMateriaalToe(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('materialen').insert({ ...nm, prijs_per_eenheid: parseFloat(nm.prijs_per_eenheid), min_bestelling: parseInt(nm.min_bestelling), max_bestelling: parseInt(nm.max_bestelling) })
    setNm({ naam: '', wereld: 'Alle', subcategorie: 'Hout', eenheid: 'stuk', prijs_per_eenheid: '', min_bestelling: '1', max_bestelling: '20', besteller: 'Erik' })
    laadAlles()
  }

  async function slaMateriaalOp(id: string) {
    await supabase.from('materialen').update(bewerkWaarden).eq('id', id)
    setBewerkMateriaal(null)
    setBewerkWaarden({})
    laadAlles()
  }

  async function toggleActief(id: string, actief: boolean) {
    await supabase.from('materialen').update({ actief: !actief }).eq('id', id)
    laadAlles()
  }

  async function verwijderMateriaal(id: string) {
    if (!confirm('Materiaal verwijderen?')) return
    await supabase.from('materialen').delete().eq('id', id)
    laadAlles()
  }

  // Overzicht berekeningen
  const groepBestellingen = groepen.map(g => {
    const best = bestellingen.filter(b => b.groep_id === g.id)
    const totaal = best.reduce((s: number, b: any) => s + b.prijs_totaal, 0)
    return { groep: g, best, totaal }
  })

  const inkoopPerBesteller = bestellingen.reduce((acc: Record<string, any[]>, b: any) => {
    const besteller = b.materialen?.besteller || 'Onbekend'
    if (!acc[besteller]) acc[besteller] = []
    const bestaand = acc[besteller].find((x: any) => x.materiaal_id === b.materiaal_id)
    if (bestaand) { bestaand.aantal += b.aantal; bestaand.prijs_totaal += b.prijs_totaal }
    else acc[besteller].push({ ...b, naam: b.materialen?.naam, eenheid: b.materialen?.eenheid })
    return acc
  }, {})

  function exportCSV(besteller: string) {
    const items = inkoopPerBesteller[besteller] || []
    const rows = [['Materiaal', 'Eenheid', 'Aantal', 'Prijs/stuk', 'Totaal'],
      ...items.map((x: any) => [x.naam, x.eenheid, x.aantal, `€${x.materialen?.prijs_per_eenheid?.toFixed(2)}`, `€${x.prijs_totaal.toFixed(2)}`])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `kwt-${besteller.toLowerCase().replace(' ', '-')}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const inputStyle = { fontSize: 13, padding: '6px 10px' }

  if (!ingelogd) return (
    <main style={{ minHeight: '100vh', background: 'var(--wit)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <Link href="/" style={{ color: 'var(--subtekst)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 24 }}>← Terug</Link>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔑</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--blauw)' }}>Beheerderspaneel</h1>
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
      <div style={{ background: 'var(--blauw)', padding: '16px 0', marginBottom: 24 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#96D400', fontWeight: 900, fontSize: 18 }}>🔑 KWT Beheer</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Yuverta Boskoop</p>
          </div>
          <Link href="/" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}>← Voorkant</Link>
        </div>
      </div>

      <div className="container">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, boxShadow: 'var(--shadow-sm)', marginBottom: 24, width: 'fit-content', border: '1.5px solid var(--rand)' }}>
          {(['groepen', 'materialen', 'overzicht'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'Nunito', fontWeight: 800, fontSize: 13,
              background: tab === t ? 'var(--blauw)' : 'transparent',
              color: tab === t ? 'white' : 'var(--subtekst)', transition: 'all 0.12s'
            }}>
              {t === 'groepen' ? '👥 Groepen' : t === 'materialen' ? '📦 Materialen' : '📋 Besteloverzicht'}
            </button>
          ))}
        </div>

        {/* ===== GROEPEN ===== */}
        {tab === 'groepen' && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14, color: 'var(--blauw)' }}>➕ Nieuwe groep</h2>
              <form onSubmit={voegGroepToe} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                <div><label>Groepsnaam</label><input value={ng.naam} onChange={e => setNg({...ng, naam: e.target.value})} placeholder="Groep Bruggen" required /></div>
                <div><label>Pincode</label><input value={ng.pincode} onChange={e => setNg({...ng, pincode: e.target.value})} placeholder="1234" required /></div>
                <div><label>Wereld</label>
                  <select value={ng.wereld} onChange={e => setNg({...ng, wereld: e.target.value as WereldNaam})}>
                    {WERELDEN.map(w => <option key={w.naam} value={w.naam}>{w.emoji} {w.naam}</option>)}
                  </select>
                </div>
                <div><label>Budget €</label><input type="number" step="0.50" value={ng.budget} onChange={e => setNg({...ng, budget: e.target.value})} required /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-groen" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Aanmaken</button>
                </div>
              </form>
            </div>

            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14, color: 'var(--blauw)' }}>👥 Alle groepen ({groepen.length})</h2>
              {groepen.length === 0 ? <p style={{ color: 'var(--subtekst)', fontSize: 13 }}>Nog geen groepen aangemaakt.</p> : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {groepen.map(g => {
                    const w = WERELDEN.find(x => x.naam === g.wereld)
                    const gb = bestellingen.filter(b => b.groep_id === g.id)
                    const tot = gb.reduce((s: number, b: any) => s + b.prijs_totaal, 0)
                    const pct = Math.min(100, (tot / g.budget) * 100)
                    return (
                      <div key={g.id} style={{ padding: '12px 14px', background: 'var(--lichtgrijs)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{w?.emoji} {g.naam}</div>
                          <div style={{ fontSize: 12, color: 'var(--subtekst)', display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                            <span>PIN: <code style={{ fontFamily: 'Space Mono, monospace', background: 'white', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{g.pincode}</code></span>
                            <span>{g.wereld}</span>
                            {g.projectnaam && <span>📋 {g.projectnaam}</span>}
                          </div>
                          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="budget-bar-wrap" style={{ flex: 1, height: 6 }}>
                              <div className="budget-bar" style={{ width: `${pct}%`, background: pct > 90 ? '#DC2626' : pct > 70 ? '#D97706' : '#16A34A' }} />
                            </div>
                            <span style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', fontWeight: 700, color: tot > g.budget ? 'var(--rood)' : 'var(--subtekst)' }}>€{tot.toFixed(2)}/€{g.budget.toFixed(2)}</span>
                          </div>
                        </div>
                        <button onClick={() => verwijderGroep(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rood)', fontSize: 16, padding: 4 }} title="Verwijderen">🗑</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== MATERIALEN ===== */}
        {tab === 'materialen' && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14, color: 'var(--blauw)' }}>➕ Nieuw materiaal</h2>
              <form onSubmit={voegMateriaalToe} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <div><label>Naam</label><input value={nm.naam} onChange={e => setNm({...nm, naam: e.target.value})} placeholder="IJslolliestokje" required /></div>
                <div><label>Wereld</label>
                  <select value={nm.wereld} onChange={e => setNm({...nm, wereld: e.target.value})}>
                    <option value="Alle">🌐 Alle werelden</option>
                    {WERELDEN.map(w => <option key={w.naam} value={w.naam}>{w.emoji} {w.naam}</option>)}
                  </select>
                </div>
                <div><label>Subcategorie</label>
                  <select value={nm.subcategorie} onChange={e => setNm({...nm, subcategorie: e.target.value})}>
                    {SUBCATEGORIEEN.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label>Eenheid</label><input value={nm.eenheid} onChange={e => setNm({...nm, eenheid: e.target.value})} placeholder="stuk" required /></div>
                <div><label>Prijs €</label><input type="number" step="0.01" value={nm.prijs_per_eenheid} onChange={e => setNm({...nm, prijs_per_eenheid: e.target.value})} placeholder="0.05" required /></div>
                <div><label>Min</label><input type="number" value={nm.min_bestelling} onChange={e => setNm({...nm, min_bestelling: e.target.value})} /></div>
                <div><label>Max</label><input type="number" value={nm.max_bestelling} onChange={e => setNm({...nm, max_bestelling: e.target.value})} /></div>
                <div><label>Besteller</label>
                  <select value={nm.besteller} onChange={e => setNm({...nm, besteller: e.target.value})}>
                    <option>Erik</option>
                    <option>Groene docent</option>
                    <option>Docent</option>
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
                    <div key={m.id} style={{ padding: '10px 14px', background: m.actief ? 'var(--lichtgrijs)' : '#f5f0f0', borderRadius: 10, opacity: m.actief ? 1 : 0.55 }}>
                      {!bezig ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <span style={{ fontWeight: 800, fontSize: 14 }}>{m.naam}</span>
                            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--subtekst)' }}>
                              {m.wereld === 'Alle' ? '🌐' : WERELDEN.find(w => w.naam === m.wereld)?.emoji} {m.subcategorie} · <strong style={{ fontFamily: 'Space Mono, monospace' }}>€{m.prijs_per_eenheid.toFixed(2)}</strong>/{m.eenheid} · max {m.max_bestelling} · {m.besteller}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm btn-ghost" onClick={() => { setBewerkMateriaal(m.id); setBewerkWaarden({ naam: m.naam, prijs_per_eenheid: m.prijs_per_eenheid, max_bestelling: m.max_bestelling, besteller: m.besteller, eenheid: m.eenheid }) }}>✏️ Bewerk</button>
                            <button onClick={() => toggleActief(m.id, m.actief)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, background: m.actief ? '#DCFCE7' : '#FEE2E2', color: m.actief ? '#166534' : '#B91C1C' }}>
                              {m.actief ? '✓ Actief' : '✗ Uit'}
                            </button>
                            <button onClick={() => verwijderMateriaal(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rood)', fontSize: 15, padding: 2 }}>🗑</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 10 }}>
                            <div><label>Naam</label><input style={inputStyle} value={bewerkWaarden.naam || ''} onChange={e => setBewerkWaarden({...bewerkWaarden, naam: e.target.value})} /></div>
                            <div><label>Prijs €</label><input style={inputStyle} type="number" step="0.01" value={bewerkWaarden.prijs_per_eenheid || ''} onChange={e => setBewerkWaarden({...bewerkWaarden, prijs_per_eenheid: parseFloat(e.target.value)})} /></div>
                            <div><label>Eenheid</label><input style={inputStyle} value={bewerkWaarden.eenheid || ''} onChange={e => setBewerkWaarden({...bewerkWaarden, eenheid: e.target.value})} /></div>
                            <div><label>Max bestelling</label><input style={inputStyle} type="number" value={bewerkWaarden.max_bestelling || ''} onChange={e => setBewerkWaarden({...bewerkWaarden, max_bestelling: parseInt(e.target.value)})} /></div>
                            <div><label>Besteller</label>
                              <select style={inputStyle} value={bewerkWaarden.besteller || 'Erik'} onChange={e => setBewerkWaarden({...bewerkWaarden, besteller: e.target.value})}>
                                <option>Erik</option>
                                <option>Groene docent</option>
                                <option>Docent</option>
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
            {/* Per groep */}
            <div className="card">
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 16, color: 'var(--blauw)' }}>📋 Bestellingen per groep</h2>
              {groepBestellingen.filter(x => x.best.length > 0).length === 0
                ? <p style={{ color: 'var(--subtekst)', fontSize: 13 }}>Nog geen bestellingen geplaatst.</p>
                : groepBestellingen.filter(x => x.best.length > 0).map(({ groep: g, best, totaal }) => {
                    const w = WERELDEN.find(x => x.naam === g.wereld)
                    return (
                      <div key={g.id} style={{ marginBottom: 20, paddingLeft: 16, borderLeft: `4px solid ${w?.kleur || 'var(--blauw)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ fontWeight: 900, fontSize: 15 }}>
                            {w?.emoji} {g.naam}
                            {g.projectnaam && <span style={{ fontWeight: 400, color: 'var(--subtekst)', marginLeft: 8 }}>— {g.projectnaam}</span>}
                          </div>
                          <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, color: totaal > g.budget ? 'var(--rood)' : 'var(--blauw)', fontSize: 14 }}>
                            €{totaal.toFixed(2)} / €{g.budget.toFixed(2)}
                          </span>
                        </div>
                        {best.map((b: any) => (
                          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--rand)' }}>
                            <span>{b.materialen?.naam} <span style={{ color: 'var(--subtekst)', fontSize: 11 }}>via {b.materialen?.besteller}</span></span>
                            <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--subtekst)' }}>{b.aantal}× = €{b.prijs_totaal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })
              }
            </div>

            {/* Per besteller */}
            {Object.entries(inkoopPerBesteller).map(([besteller, items]) => {
              const totaalBesteller = (items as any[]).reduce((s: number, x: any) => s + x.prijs_totaal, 0)
              return (
                <div key={besteller} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--blauw)' }}>
                      🛒 Inkooplijst — {besteller}
                    </h2>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 16, color: 'var(--blauw)' }}>€{totaalBesteller.toFixed(2)}</span>
                      <button className="btn btn-groen btn-sm" onClick={() => exportCSV(besteller)}>⬇ CSV</button>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--rand)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 800, color: 'var(--subtekst)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Materiaal</th>
                        <th style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 800, color: 'var(--subtekst)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Aantal</th>
                        <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 800, color: 'var(--subtekst)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Totaal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(items as any[]).map((x: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--rand)' }}>
                          <td style={{ padding: '9px 4px' }}>
                            <div style={{ fontWeight: 700 }}>{x.naam}</div>
                            <div style={{ fontSize: 11, color: 'var(--subtekst)' }}>€{x.materialen?.prijs_per_eenheid?.toFixed(2)} / {x.eenheid}</div>
                          </td>
                          <td style={{ textAlign: 'center', fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 18 }}>{x.aantal}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--blauw)' }}>€{x.prijs_totaal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} style={{ padding: '10px 4px', fontWeight: 900, textAlign: 'right' }}>Totaal:</td>
                        <td style={{ textAlign: 'right', fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 18, color: 'var(--blauw)', padding: '10px 4px' }}>€{totaalBesteller.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            })}

            {Object.keys(inkoopPerBesteller).length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--subtekst)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <p>Nog geen bestellingen geplaatst.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
