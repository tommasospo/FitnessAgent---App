import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'
import { isEsercizioEseguitoArray, type SerieEseguita } from '../lib/domain'

type SessioneEseguita = Tables<'sessione_eseguita'>

function simboloSerie(serie: SerieEseguita): string {
  if (serie.stato === 'fatto') return '✓'
  if (serie.stato === 'cedimento') return '△'
  return '–'
}

export function SessioneDettaglio() {
  const { id } = useParams<{ id: string }>()
  const [sessione, setSessione] = useState<SessioneEseguita | null>(null)
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)

  useEffect(() => {
    async function carica() {
      if (!id) return
      setLoading(true)
      const { data, error } = await supabase.from('sessione_eseguita').select('*').eq('id', id).single()
      if (error) {
        setErrore(error.message)
      } else {
        setSessione(data)
      }
      setLoading(false)
    }

    carica()
  }, [id])

  if (loading) {
    return <p className="p-4 text-gray-400">Carico...</p>
  }

  if (errore || !sessione) {
    return <p className="p-4 text-sm text-red-400">{errore ?? 'Sessione non trovata.'}</p>
  }

  const esercizi = isEsercizioEseguitoArray(sessione.serie_eseguite) ? sessione.serie_eseguite : []

  return (
    <div className="space-y-4 p-4 pb-20">
      <Link to="/storico" className="text-sm text-gray-500">
        ← Storico
      </Link>
      <h1 className="text-lg font-semibold text-gray-100">
        {sessione.data_effettiva} {sessione.saltata && <span className="text-gray-500">(saltata)</span>}
      </h1>
      <p className="text-sm text-gray-500">
        {sessione.durata_minuti ? `${sessione.durata_minuti} min` : ''}
        {sessione.rpe_sessione ? ` · RPE ${sessione.rpe_sessione}` : ''}
      </p>
      {sessione.note_libere && <p className="text-sm text-gray-400">{sessione.note_libere}</p>}

      {esercizi.length === 0 && !sessione.saltata && (
        <p className="text-sm text-gray-500">Nessun esercizio registrato.</p>
      )}

      <div className="space-y-3">
        {esercizi.map((es, i) => (
          <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="mb-1 text-sm font-medium text-gray-200">{es.nome}</h2>
            {es.nota && <p className="mb-2 text-sm text-gray-500">{es.nota}</p>}
            <ul className="space-y-0.5 text-sm text-gray-400">
              {es.serie.map((s, j) => (
                <li key={j}>
                  Serie {s.serie_n}: {simboloSerie(s)} {s.stato}
                  {s.ripetizioni_fatte ? ` · ${s.ripetizioni_fatte} rip` : ''}
                  {s.secondi_fatti ? ` · ${s.secondi_fatti}s` : ''}
                  {s.carico ? ` @ ${s.carico}kg` : ''}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
