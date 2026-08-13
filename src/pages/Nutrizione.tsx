import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'
import type { PianoContenutoNutrizione } from '../lib/domain'
import { BarTrend, PeriodoFiltro, StatTile, TabellaStorico, VistaToggle, media, type Vista } from '../components/charts'

type Piano = Tables<'piano'>
type DiarioAlimentare = Tables<'diario_alimentare'>
type AttivitaGiornaliera = Tables<'attivita_giornaliera'>

function formattaData(data: string): string {
  return new Date(`${data}T00:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
}

function Delta({ reale, target, unita }: { reale: number; target: number; unita: string }) {
  const diff = Math.round((reale - target) * 10) / 10
  const segno = diff > 0 ? '+' : ''
  return (
    <span className="text-gray-500">
      {' '}
      (target {target}{unita}, {segno}
      {diff}
      {unita})
    </span>
  )
}

export function Nutrizione() {
  const [piano, setPiano] = useState<Piano | null>(null)
  const [diario, setDiario] = useState<DiarioAlimentare | null>(null)
  const [storico, setStorico] = useState<DiarioAlimentare[]>([])
  const [attivita, setAttivita] = useState<AttivitaGiornaliera | null>(null)
  const [loading, setLoading] = useState(true)
  const [caricandoStorico, setCaricandoStorico] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)
  const [giorniStorico, setGiorniStorico] = useState(14)
  const [vista, setVista] = useState<Vista>('grafico')

  useEffect(() => {
    async function carica() {
      setLoading(true)
      const [pianoRes, diarioRes, attivitaRes] = await Promise.all([
        supabase.from('piano').select('*').eq('tipo', 'nutrizione').eq('stato', 'attivo').maybeSingle(),
        supabase.from('diario_alimentare').select('*').order('data', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('attivita_giornaliera').select('*').order('data', { ascending: false }).limit(1).maybeSingle(),
      ])
      if (pianoRes.error) setErrore(pianoRes.error.message)
      else setPiano(pianoRes.data)
      if (!diarioRes.error) setDiario(diarioRes.data)
      if (!attivitaRes.error) setAttivita(attivitaRes.data)
      setLoading(false)
    }

    carica()
  }, [])

  useEffect(() => {
    async function caricaStorico() {
      setCaricandoStorico(true)
      const dalGiorno = new Date(Date.now() - giorniStorico * 86_400_000).toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('diario_alimentare')
        .select('*')
        .gte('data', dalGiorno)
        .order('data', { ascending: true })
      if (!error) setStorico(data ?? [])
      setCaricandoStorico(false)
    }

    caricaStorico()
  }, [giorniStorico])

  if (loading) {
    return <p className="p-4 text-gray-400">Carico...</p>
  }

  const contenuto = piano?.contenuto as PianoContenutoNutrizione | null
  const macro = contenuto?.macro

  return (
    <div className="space-y-4 p-4 pb-20">
      <h1 className="text-lg font-semibold text-gray-100">Nutrizione</h1>

      {errore && <p className="text-sm text-red-400">{errore}</p>}

      <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <h2 className="text-sm font-medium text-gray-400">Obiettivi di oggi</h2>

        {!piano && <p className="text-sm text-gray-500">Nessun piano di nutrizione attivo.</p>}

        {piano && !macro && <p className="text-sm text-gray-500">Piano attivo senza macro definiti.</p>}

        {macro && (
          <dl className="grid grid-cols-2 gap-2 text-sm text-gray-300">
            {macro.kcal !== undefined && (
              <div>
                <dt className="text-gray-500">kcal</dt>
                <dd>{macro.kcal}</dd>
              </div>
            )}
            {macro.proteine_g !== undefined && (
              <div>
                <dt className="text-gray-500">proteine</dt>
                <dd>{macro.proteine_g} g</dd>
              </div>
            )}
            {macro.carboidrati_g !== undefined && (
              <div>
                <dt className="text-gray-500">carboidrati</dt>
                <dd>{macro.carboidrati_g} g</dd>
              </div>
            )}
            {macro.grassi_g !== undefined && (
              <div>
                <dt className="text-gray-500">grassi</dt>
                <dd>{macro.grassi_g} g</dd>
              </div>
            )}
          </dl>
        )}

        {contenuto?.note && <p className="text-sm text-gray-400">{contenuto.note}</p>}

        {piano && (
          <Link to={`/schede/${piano.id}`} className="inline-block text-sm text-gray-400 underline">
            Vedi scheda completa
          </Link>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <h2 className="text-sm font-medium text-gray-400">
          {diario ? `Diario reale — ${formattaData(diario.data)}` : 'Diario reale'}
        </h2>

        {!diario && (
          <p className="text-sm text-gray-500">
            Nessun dato ancora arrivato da Apple Health. Il diario alimentare si aggiorna un giorno alla volta (i dati di oggi
            sono disponibili da domani).
          </p>
        )}

        {diario && (
          <dl className="space-y-1 text-sm text-gray-300">
            {diario.kcal !== null && (
              <div>
                <dt className="inline text-gray-500">kcal: </dt>
                <dd className="inline">
                  {diario.kcal}
                  {macro?.kcal !== undefined && <Delta reale={diario.kcal} target={macro.kcal} unita="" />}
                </dd>
              </div>
            )}
            {diario.proteine_g !== null && (
              <div>
                <dt className="inline text-gray-500">proteine: </dt>
                <dd className="inline">
                  {diario.proteine_g}g
                  {macro?.proteine_g !== undefined && <Delta reale={diario.proteine_g} target={macro.proteine_g} unita="g" />}
                </dd>
              </div>
            )}
            {diario.carboidrati_g !== null && (
              <div>
                <dt className="inline text-gray-500">carboidrati: </dt>
                <dd className="inline">
                  {diario.carboidrati_g}g
                  {macro?.carboidrati_g !== undefined && (
                    <Delta reale={diario.carboidrati_g} target={macro.carboidrati_g} unita="g" />
                  )}
                </dd>
              </div>
            )}
            {diario.grassi_g !== null && (
              <div>
                <dt className="inline text-gray-500">grassi: </dt>
                <dd className="inline">
                  {diario.grassi_g}g
                  {macro?.grassi_g !== undefined && <Delta reale={diario.grassi_g} target={macro.grassi_g} unita="g" />}
                </dd>
              </div>
            )}
          </dl>
        )}

        {attivita && (
          <Link to="/attivita" className="block border-t border-gray-800 pt-3 text-sm text-gray-400 underline">
            Vedi passi, battito, sonno e resto dell'attività →
          </Link>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <PeriodoFiltro valore={giorniStorico} onCambia={setGiorniStorico} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-400">kcal — ultimi {giorniStorico} giorni</h2>
          <VistaToggle vista={vista} onCambia={setVista} />
        </div>

        {caricandoStorico && <p className="text-sm text-gray-500">Carico...</p>}

        {!caricandoStorico && vista === 'grafico' && (
          <BarTrend
            dati={storico.map((d) => ({ data: d.data, valore: d.kcal }))}
            target={macro?.kcal}
            colore="#22c55e"
          />
        )}

        {!caricandoStorico && vista === 'tabella' && (
          <TabellaStorico
            righe={storico}
            colonne={[
              { chiave: 'kcal', etichetta: 'kcal' },
              { chiave: 'proteine_g', etichetta: 'proteine', unita: 'g' },
              { chiave: 'carboidrati_g', etichetta: 'carbo', unita: 'g' },
              { chiave: 'grassi_g', etichetta: 'grassi', unita: 'g' },
            ]}
          />
        )}

        {!caricandoStorico && storico.length > 0 && (
          <dl className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
            <StatTile etichetta="media kcal" valore={media(storico.map((d) => d.kcal)) ?? '—'} />
            <StatTile etichetta="media proteine" valore={media(storico.map((d) => d.proteine_g)) ?? '—'} unita="g" />
            <StatTile etichetta="media carbo" valore={media(storico.map((d) => d.carboidrati_g)) ?? '—'} unita="g" />
            <StatTile etichetta="media grassi" valore={media(storico.map((d) => d.grassi_g)) ?? '—'} unita="g" />
          </dl>
        )}

        {!caricandoStorico && storico.length === 0 && (
          <p className="text-xs text-gray-500">
            Nessun dato in questo periodo — il grafico si popola man mano che arrivano i dati da Apple Health.
          </p>
        )}
      </section>
    </div>
  )
}
