import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'

type Piano = Tables<'piano'>

export function Schede() {
  const [piani, setPiani] = useState<Piano[]>([])
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)

  useEffect(() => {
    async function carica() {
      setLoading(true)
      const { data, error } = await supabase.from('piano').select('*').order('data_creazione', { ascending: false })

      if (error) {
        setErrore(error.message)
      } else {
        setPiani(data)
      }
      setLoading(false)
    }

    carica()
  }, [])

  if (loading) {
    return <p className="p-4 text-gray-400">Carico...</p>
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      <h1 className="text-lg font-semibold text-gray-100">Schede</h1>
      {errore && <p className="text-sm text-red-400">{errore}</p>}

      {piani.length === 0 && <p className="text-gray-500 text-sm">Nessuna scheda ancora.</p>}
      <ul className="space-y-2">
        {piani.map((p) => (
          <li key={p.id}>
            <Link
              to={`/schede/${p.id}`}
              className={`block rounded-lg border bg-gray-900 p-3 text-sm hover:border-gray-700 ${
                p.stato === 'attivo' ? 'border-green-700' : 'border-gray-800'
              }`}
            >
              <div className="flex justify-between text-gray-300">
                <span className="capitalize">
                  {p.tipo} v{p.versione}
                </span>
                <span
                  className={
                    p.stato === 'attivo'
                      ? 'text-green-400'
                      : p.stato === 'proposta'
                        ? 'text-yellow-400'
                        : 'text-gray-500'
                  }
                >
                  {p.stato}
                </span>
              </div>
              {p.motivazione && <p className="mt-1 text-gray-500">{p.motivazione}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
