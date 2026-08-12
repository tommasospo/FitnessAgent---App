import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'

type SessioneEseguita = Tables<'sessione_eseguita'>

export function Storico() {
  const [caricamento, setCaricamento] = useState(true)
  const [erroreCaricamento, setErroreCaricamento] = useState<string | null>(null)
  const [sessioni, setSessioni] = useState<SessioneEseguita[]>([])

  useEffect(() => {
    async function carica() {
      setCaricamento(true)

      const { data, error } = await supabase
        .from('sessione_eseguita')
        .select('*')
        .order('data_effettiva', { ascending: false })
        .limit(10)

      if (error) {
        setErroreCaricamento(error.message)
      } else {
        setSessioni(data)
      }

      setCaricamento(false)
    }

    carica()
  }, [])

  if (caricamento) {
    return <p className="p-4 text-gray-400">Carico...</p>
  }

  if (erroreCaricamento) {
    return <p className="p-4 text-sm text-red-400">{erroreCaricamento}</p>
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      <h1 className="text-lg font-semibold text-gray-100">Storico</h1>
      <UltimiAllenamenti sessioni={sessioni} />
    </div>
  )
}

function UltimiAllenamenti({ sessioni }: { sessioni: SessioneEseguita[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-gray-400">Ultimi allenamenti</h2>
      {sessioni.length === 0 && <p className="text-gray-500 text-sm">Nessuna sessione ancora.</p>}
      <ul className="space-y-2">
        {sessioni.map((s) => (
          <li key={s.id}>
            <Link
              to={`/storico/${s.id}`}
              className="block rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm hover:border-gray-700"
            >
              <div className="flex justify-between text-gray-300">
                <span>
                  {s.data_effettiva} {s.saltata && <span className="text-gray-500">(saltata)</span>}
                </span>
                <span className="text-gray-500">
                  {s.durata_minuti ? `${s.durata_minuti} min` : ''} {s.rpe_sessione ? `· RPE ${s.rpe_sessione}` : ''}
                </span>
              </div>
              {s.note_libere && <p className="mt-1 text-gray-500">{s.note_libere}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
