import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'
import { BarTrend, LineTrend, PeriodoFiltro, StatTile, TabellaStorico, VistaToggle, media, type Vista } from '../components/charts'

type AttivitaGiornaliera = Tables<'attivita_giornaliera'>
type MetricaCorporea = Tables<'metrica_corporea'>

function formattaData(data: string): string {
  return new Date(`${data}T00:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
}

function Riga({ etichetta, valore }: { etichetta: string; valore: string | number | null }) {
  if (valore === null) return null
  return (
    <div className="flex justify-between border-b border-gray-800 py-1.5 text-sm">
      <dt className="text-gray-500">{etichetta}</dt>
      <dd className="text-gray-200">{valore}</dd>
    </div>
  )
}

export function Attivita() {
  const [attivita, setAttivita] = useState<AttivitaGiornaliera | null>(null)
  const [storico, setStorico] = useState<AttivitaGiornaliera[]>([])
  const [pesoStorico, setPesoStorico] = useState<MetricaCorporea[]>([])
  const [loading, setLoading] = useState(true)
  const [caricandoStorico, setCaricandoStorico] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)
  const [giorniStorico, setGiorniStorico] = useState(14)
  const [vista, setVista] = useState<Vista>('grafico')

  useEffect(() => {
    async function carica() {
      setLoading(true)
      const { data, error } = await supabase
        .from('attivita_giornaliera')
        .select('*')
        .order('data', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) setErrore(error.message)
      else setAttivita(data)
      setLoading(false)
    }

    carica()
  }, [])

  useEffect(() => {
    async function caricaStorico() {
      setCaricandoStorico(true)
      const dalGiorno = new Date(Date.now() - giorniStorico * 86_400_000).toISOString().slice(0, 10)
      const [storicoRes, pesoRes] = await Promise.all([
        supabase.from('attivita_giornaliera').select('*').gte('data', dalGiorno).order('data', { ascending: true }),
        supabase
          .from('metrica_corporea')
          .select('*')
          .eq('tipo', 'peso')
          .gte('data', dalGiorno)
          .order('data', { ascending: false }),
      ])
      if (!storicoRes.error) setStorico(storicoRes.data ?? [])
      if (!pesoRes.error) setPesoStorico(pesoRes.data ?? [])
      setCaricandoStorico(false)
    }

    caricaStorico()
  }, [giorniStorico])

  if (loading) {
    return <p className="p-4 text-gray-400">Carico...</p>
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      <h1 className="text-lg font-semibold text-gray-100">Attività</h1>

      {errore && <p className="text-sm text-red-400">{errore}</p>}

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <h2 className="mb-2 text-sm font-medium text-gray-400">
          {attivita ? `Riepilogo giornaliero — ${formattaData(attivita.data)}` : 'Riepilogo giornaliero'}
        </h2>

        {!attivita && (
          <p className="text-sm text-gray-500">
            Nessun dato ancora arrivato da Apple Health. Si aggiorna un giorno alla volta.
          </p>
        )}

        {attivita && (
          <dl>
            <Riga etichetta="Passi" valore={attivita.passi} />
            <Riga etichetta="Energia attiva" valore={attivita.energia_attiva_kcal !== null ? `${attivita.energia_attiva_kcal} kcal` : null} />
            <Riga etichetta="Minuti esercizio" valore={attivita.minuti_esercizio} />
            <Riga etichetta="Minuti movimento" valore={attivita.minuti_movimento} />
            <Riga etichetta="Distanza" valore={attivita.distanza_km !== null ? `${attivita.distanza_km} km` : null} />
            <Riga etichetta="Battito medio" valore={attivita.battito_medio} />
            <Riga etichetta="Battito min/max" valore={attivita.battito_min !== null && attivita.battito_max !== null ? `${attivita.battito_min} – ${attivita.battito_max}` : null} />
            <Riga etichetta="Battito a riposo" valore={attivita.battito_riposo} />
            <Riga etichetta="HRV" valore={attivita.hrv_ms !== null ? `${attivita.hrv_ms} ms` : null} />
            <Riga etichetta="VO2 max" valore={attivita.vo2_max} />
          </dl>
        )}
      </section>

      <PeriodoFiltro valore={giorniStorico} onCambia={setGiorniStorico} />

      <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-400">Passi — ultimi {giorniStorico} giorni</h2>
          <VistaToggle vista={vista} onCambia={setVista} />
        </div>

        {caricandoStorico && <p className="text-sm text-gray-500">Carico...</p>}

        {!caricandoStorico && vista === 'grafico' && (
          <BarTrend dati={storico.map((d) => ({ data: d.data, valore: d.passi }))} colore="#22c55e" />
        )}

        {!caricandoStorico && vista === 'tabella' && (
          <TabellaStorico
            righe={storico}
            colonne={[
              { chiave: 'passi', etichetta: 'passi' },
              { chiave: 'energia_attiva_kcal', etichetta: 'energia attiva', unita: ' kcal' },
            ]}
          />
        )}

        {!caricandoStorico && storico.length > 0 && (
          <dl className="grid grid-cols-2 gap-2 pt-1">
            <StatTile etichetta="media passi" valore={media(storico.map((d) => d.passi)) ?? '—'} />
            <StatTile etichetta="media energia attiva" valore={media(storico.map((d) => d.energia_attiva_kcal)) ?? '—'} unita=" kcal" />
          </dl>
        )}
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <h2 className="mb-2 text-sm font-medium text-gray-400">Peso — andamento</h2>
        {caricandoStorico && <p className="text-sm text-gray-500">Carico...</p>}
        {!caricandoStorico && (
          <LineTrend
            dati={[...pesoStorico].reverse().map((p) => ({ data: p.data.slice(0, 10), valore: p.valore }))}
            colore="#22c55e"
            unita=" kg"
          />
        )}
        {!caricandoStorico && pesoStorico.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">Nessuna rilevazione in questo periodo.</p>
        )}
        {!caricandoStorico && pesoStorico.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-gray-800 pt-3 text-sm">
            {pesoStorico.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-gray-800 py-1">
                <span className="text-gray-500">{formattaData(p.data.slice(0, 10))}</span>
                <span className="text-gray-200">{p.valore} kg</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
