import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'
import type { PianoContenutoNutrizione } from '../lib/domain'

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
  const [attivita, setAttivita] = useState<AttivitaGiornaliera | null>(null)
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)

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
    </div>
  )
}
