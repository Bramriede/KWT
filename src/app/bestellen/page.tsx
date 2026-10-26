'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, WERELDEN, SESSIE_HEARTBEAT_MS, type Groep, type Materiaal } from '@/lib/supabase'

export default function Bestellen() {
  const router = useRouter()
  const [groep, setGroep] = useState<Groep | null>(null)
  const [projectnaam, setProjectnaam] = useState('')
  const [projectOpgeslagen, setProjectOpgeslagen] = useState(false)
  const [materialen, setMaterialen] = useState<Materiaal[]>([])
  const [mandje, setMandje] = useState<Record<string, number>>({})
  const [laden, setLaden] = useState(true)
  const [opslaan, setOpslaan] = useState(false)
  const [succes, setSucces] = useState(false)
  const [zoekterm, setZoekterm] = useState('')
  const [actieveSubcat, setActieveSubcat] = useState('Alle')
  const [mandjeOpen, setMandjeOpen] = useState(false)

  useEffect(() => {
    const g = sessionStorage.getItem('groep')
    if (!g) { router.push('/groep'); return }
    const parsed: Groep = JSON.parse(g)
    setGroep(parsed)
    setProjectnaam(parsed.projectnaam || '')
    if (parsed.projectnaam) setProjectOpgeslagen(true)
    laadData(parsed.id, parsed.wereld)
  }, [router])

  // Sessie levend houden; uitloggen als iemand anders de groep heeft overgenomen
  useEffect(() => {
    if (!groep?.sessie_id) return
    const sessieId = groep.sessie_id
    const tik = async () => {
      const { data, error } = await supabase.from('groepen')
        .update({ sessie_tijd: new Date().toISOString() })
        .eq('id', groep.id).eq('sessie_id', sessieId).select('id')
      if (!error && (!data || data.length === 0)) {
        sessionStorage.removeItem('groep')
        alert('Je bent uitgelogd: iemand anders van jouw groep is ingelogd, of de docent heeft je uitgelogd.')
        router.push('/groep')
      }
    }
    const t = setInterval(tik, SESSIE_HEARTBEAT_MS)
    return () => clearInterval(t)
  }, [groep?.id, groep?.sessie_id, router])

  async function uitloggen() {
    if (groep?.sessie_id) {
      await supabase.from('groepen').update({ sessie_id: null, sessie_tijd: null })
        .eq('id', groep.id).eq('sessie_id', groep.sessie_id)
    }
    sessionStorage.removeItem('groep')
    router.push('/')
  }

  const laadData = useCallback(async (groepId: string, wereld: string) => {
    setLaden(true)
    const { data: mat } = await supabase
      .from('materialen').select('*').eq('actief', true)
      .or(`wereld.eq.Alle,wereld.eq.${wereld}`)
      .order('subcategorie').order('naam')
    const { data: best } = await supabase
      .from('bestellingen').select('*').eq('groep_id', groepId)
    if (mat) setMaterialen(mat)
    if (best) {
      const map: Record<string, number> = {}
      best.forEach((b: any) => { map[b.materiaal_id] = b.aantal })
      setMandje(map)
    }
    setLaden(false)
  }, [])

  async function slaProjectnaamOp() {
    if (!groep || !projectnaam.trim()) return
    await supabase.from('groepen').update({ projectnaam: projectnaam.trim() }).eq('id', groep.id)
    const updated = { ...groep, projectnaam: projectnaam.trim() }
    setGroep(updated)
    sessionStorage.setItem('groep', JSON.stringify(updated))
    setProjectOpgeslagen(true)
  }

  function setAantal(matId: string, val: number, mat: Materiaal) {
    const nieuw = Math.max(0, Math.min(mat.max_bestelling, Math.floor(val)))
    setMandje(prev => {
      if (nieuw === 0) { const c = { ...prev }; delete c[matId]; return c }
      return { ...prev, [matId]: nieuw }
    })
  }

  function wijzig(matId: string, delta: number, mat: Materiaal) {
    setAantal(matId, (mandje[matId] || 0) + delta, mat)
  }

  const totaal = useMemo(() =>
    Object.entries(mandje).reduce((sum, [id, n]) => {
      const m = materialen.find(x => x.id === id)
      return sum + (m ? m.prijs_per_eenheid * n : 0)
    }, 0), [mandje, materialen])

  const budgetPct = groep ? Math.min(100, (totaal / groep.budget) * 100) : 0
  const budgetKleur = budgetPct > 90 ? '#DC2626' : budgetPct > 70 ? '#D97706' : '#16A34A'
  const overBudget = groep ? totaal > groep.budget : false
  const aantalItems = Object.keys(mandje).length

  async function bestelOpslaan() {
    if (!groep || overBudget || aantalItems === 0) return
    setOpslaan(true)
    await supabase.from('bestellingen').delete().eq('groep_id', groep.id)
    const rows = Object.entries(mandje).map(([materiaal_id, aantal]) => {
      const m = materialen.find(x => x.id === materiaal_id)!
      return { groep_id: groep.id, materiaal_id, aantal, prijs_totaal: m.prijs_per_eenheid * aantal }
    })
    if (rows.length > 0) await supabase.from('bestellingen').insert(rows)
    setOpslaan(false)
    setSucces(true)
    setMandjeOpen(false)
    setTimeout(() => setSucces(false), 4000)
  }

  const gefilterdeMateriaal = useMemo(() => materialen.filter(m => {
    const zoekOk = zoekterm === '' || m.naam.toLowerCase().includes(zoekterm.toLowerCase())
    const subcatOk = actieveSubcat === 'Alle' || m.subcategorie === actieveSubcat
    return zoekOk && subcatOk
  }), [materialen, zoekterm, actieveSubcat])

  const subcategorieen = useMemo(() =>
    ['Alle', ...Array.from(new Set(materialen.map(m => m.subcategorie))).sort()],
    [materialen])

  const wereld = WERELDEN.find(w => w.naam === groep?.wereld)
  const mandjeItems = Object.entries(mandje).map(([id, aantal]) => ({
    materiaal: materialen.find(m => m.id === id)!, aantal
  })).filter(x => x.materiaal)

  if (laden) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div><p style={{ color: 'var(--subtekst)' }}>Materialen laden...</p></div>
    </main>
  )
  if (!groep) return null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--wit)', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'var(--blauw)', padding: '16px 0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{wereld?.emoji}</span>
            <div>
              <div style={{ fontWeight: 900, color: 'white', fontSize: 16, lineHeight: 1.2 }}>{groep.naam}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {groep.leerjaar} · {(groep as any).rondes?.naam}
                {groep.projectnaam && ` · 📋 ${groep.projectnaam}`}
                {groep.leerlingen && ` · 👤 ${groep.leerlingen}`}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Budget</span>
              <span style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Space Mono, monospace', color: overBudget ? '#FCA5A5' : '#96D400' }}>€{totaal.toFixed(2)} / €{groep.budget.toFixed(2)}</span>
            </div>
            <div className="budget-bar-wrap"><div className="budget-bar" style={{ width: `${budgetPct}%`, background: budgetKleur }} /></div>
          </div>
          <button onClick={() => setMandjeOpen(true)} style={{ position: 'relative', background: aantalItems > 0 ? '#96D400' : 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: aantalItems > 0 ? '#1B1F6B' : 'white', fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, transition: 'all 0.15s' }}>
            🛒 {aantalItems > 0 && <span>€{totaal.toFixed(2)}</span>}
            {aantalItems > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#DC2626', color: 'white', borderRadius: '99px', width: 20, height: 20, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{aantalItems}</span>}
          </button>
          <button onClick={uitloggen} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', color: 'white', fontFamily: 'Nunito', fontWeight: 800, fontSize: 13 }}>Uitloggen</button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 22 }}>
        {!projectOpgeslagen && (
          <div className="card" style={{ marginBottom: 18, borderLeft: '4px solid #96D400', padding: '18px 22px' }}>
            <div style={{ fontWeight: 900, color: 'var(--blauw)', marginBottom: 6 }}>📝 Geef jullie project een naam</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={projectnaam} onChange={e => setProjectnaam(e.target.value)} placeholder='bijv. "De sterkste brug"' onKeyDown={e => e.key === 'Enter' && slaProjectnaamOp()} />
              <button className="btn btn-groen" onClick={slaProjectnaamOp} disabled={!projectnaam.trim()}>Opslaan ✓</button>
            </div>
          </div>
        )}

        {succes && (
          <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 12, padding: '13px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ fontWeight: 800, color: '#166534', fontSize: 14 }}>Bestelling opgeslagen!</span>
          </div>
        )}

        {overBudget && (
          <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 12, padding: '13px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 900, color: '#991B1B', fontSize: 14 }}>Budget overschreden met €{(totaal - groep.budget).toFixed(2)}</div>
              <div style={{ fontSize: 13, color: '#B91C1C' }}>Verwijder wat items.</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            <input value={zoekterm} onChange={e => setZoekterm(e.target.value)} placeholder="Zoek materiaal..." style={{ paddingLeft: 38 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}>
          {subcategorieen.map(s => (
            <button key={s} onClick={() => setActieveSubcat(s)} style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, background: actieveSubcat === s ? 'var(--blauw)' : 'white', color: actieveSubcat === s ? 'white' : 'var(--subtekst)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.12s' }}>
              {s === 'Lijm' ? '🔧' : s === 'Hout' ? '🪵' : s === 'Karton' ? '📦' : s === 'Elektronica' ? '⚡' : s === 'Groen' ? '🌿' : s === 'Verf' ? '🎨' : ''}{' '}{s}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {gefilterdeMateriaal.map(mat => {
            const aantal = mandje[mat.id] || 0
            const inMandje = aantal > 0
            return (
              <div key={mat.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', borderLeft: inMandje ? '4px solid #96D400' : '4px solid transparent', transition: 'border-color 0.2s', boxShadow: inMandje ? '0 2px 10px rgba(150,212,0,0.15)' : 'var(--shadow-sm)' }}>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{mat.naam}</div>
                  <div style={{ fontSize: 12, color: 'var(--subtekst)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge" style={{ background: 'var(--lichtgrijs)', color: 'var(--subtekst)' }}>{mat.subcategorie}</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: mat.prijs_per_eenheid === 0 ? '#16A34A' : 'var(--subtekst)' }}>{mat.prijs_per_eenheid === 0 ? 'Gratis' : `€${mat.prijs_per_eenheid.toFixed(2)}`} / {mat.eenheid}</span>
                    <span style={{ color: '#ccc' }}>max {mat.max_bestelling}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="teller-btn" onClick={() => wijzig(mat.id, -1, mat)} disabled={aantal === 0}>−</button>
                  <input type="number" value={aantal === 0 ? '' : aantal} onChange={e => setAantal(mat.id, parseInt(e.target.value) || 0, mat)} placeholder="0" min={0} max={mat.max_bestelling} style={{ width: 52, textAlign: 'center', fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 17, padding: '6px 4px' }} />
                  <button className="teller-btn" onClick={() => wijzig(mat.id, 1, mat)} disabled={aantal >= mat.max_bestelling}>+</button>
                </div>
                <div style={{ minWidth: 64, textAlign: 'right', fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 14, color: inMandje ? 'var(--blauw)' : 'var(--rand)' }}>
                  {inMandje ? `€${(mat.prijs_per_eenheid * aantal).toFixed(2)}` : '€0.00'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1.5px solid var(--rand)', padding: '12px 20px', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', boxShadow: '0 -4px 20px rgba(0,0,0,0.07)', zIndex: 30 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--subtekst)' }}>{aantalItems} materialen in mandje</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 20, color: overBudget ? 'var(--rood)' : 'var(--blauw)' }}>€{totaal.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--subtekst)' }}>/ €{groep?.budget.toFixed(2)}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {aantalItems > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setMandjeOpen(true)}>🛒 Mandje</button>}
          <button className="btn btn-groen" onClick={bestelOpslaan} disabled={opslaan || overBudget || aantalItems === 0} style={{ fontSize: 15 }}>
            {opslaan ? 'Opslaan...' : '💾 Bestelling opslaan'}
          </button>
        </div>
      </div>

      {/* Mandje drawer */}
      {mandjeOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setMandjeOpen(false)} />
          <div style={{ width: '100%', maxWidth: 420, background: 'white', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid var(--rand)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--blauw)' }}>🛒 Jouw mandje</h2>
              <button onClick={() => setMandjeOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--subtekst)' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {mandjeItems.length === 0
                ? <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--subtekst)' }}><div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div><p>Nog niets in je mandje</p></div>
                : <div style={{ display: 'grid', gap: 10 }}>
                  {mandjeItems.map(({ materiaal: m, aantal }) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--lichtgrijs)', borderRadius: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{m.naam}</div>
                        <div style={{ fontSize: 12, color: 'var(--subtekst)' }}>{aantal} × {m.eenheid} = <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--blauw)' }}>€{(m.prijs_per_eenheid * aantal).toFixed(2)}</span></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button className="teller-btn" style={{ width: 28, height: 28 }} onClick={() => wijzig(m.id, -1, m)}>−</button>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{aantal}</span>
                        <button className="teller-btn" style={{ width: 28, height: 28 }} onClick={() => wijzig(m.id, 1, m)} disabled={aantal >= m.max_bestelling}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1.5px solid var(--rand)' }}>
              {overBudget && <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px 14px', borderRadius: 9, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚠️ €{(totaal - (groep?.budget || 0)).toFixed(2)} over budget</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontWeight: 700, color: 'var(--subtekst)' }}>Totaal</span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: 20, color: overBudget ? 'var(--rood)' : 'var(--blauw)' }}>€{totaal.toFixed(2)}</span>
              </div>
              <div className="budget-bar-wrap" style={{ marginBottom: 14 }}><div className="budget-bar" style={{ width: `${budgetPct}%`, background: budgetKleur }} /></div>
              <button className="btn btn-groen" onClick={bestelOpslaan} disabled={opslaan || overBudget || aantalItems === 0} style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
                {opslaan ? 'Opslaan...' : '💾 Bestelling bevestigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
