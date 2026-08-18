import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'

type ProfiloUtente = Tables<'profilo_utente'>
type MetricaCorporea = Tables<'metrica_corporea'>

const oggi = new Date().toISOString().slice(0, 10)

export function Profilo() {
  const [profilo, setProfilo] = useState<ProfiloUtente | null>(null)
  const [ultimoPeso, setUltimoPeso] = useState<MetricaCorporea | null>(null)
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)

  useEffect(() => {
    async function carica() {
      setLoading(true)
      const [profiloRes, pesoRes] = await Promise.all([
        supabase.from('profilo_utente').select('*').maybeSingle(),
        supabase.from('metrica_corporea').select('*').eq('tipo', 'peso').order('data', { ascending: false }).limit(1).maybeSingle(),
      ])
      if (profiloRes.error) setErrore(profiloRes.error.message)
      setProfilo(profiloRes.data)
      setUltimoPeso(pesoRes.data)
      setLoading(false)
    }
    carica()
  }, [])

  if (loading) {
    return <p className="p-4 text-gray-400">Carico...</p>
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      <h1 className="text-lg font-semibold text-gray-100">Profilo</h1>
      <p className="text-sm text-gray-500">
        Info generali lette dagli agenti prima di chiedertele in chat — compilale una volta, non serve ripeterle.
      </p>
      {errore && <p className="text-sm text-red-400">{errore}</p>}

      <SezionePeso ultimoPeso={ultimoPeso} onCambiato={setUltimoPeso} />
      <SezioneDatiGenerali profilo={profilo} onCambiato={setProfilo} />
    </div>
  )
}

function SezionePeso({
  ultimoPeso,
  onCambiato,
}: {
  ultimoPeso: MetricaCorporea | null
  onCambiato: (m: MetricaCorporea) => void
}) {
  const [valore, setValore] = useState('')
  const [salvataggio, setSalvataggio] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  async function salva() {
    if (!valore) return
    setSalvataggio(true)
    setErrore(null)
    const { data, error } = await supabase
      .from('metrica_corporea')
      .insert({ tipo: 'peso', valore: Number(valore), data: oggi, fonte: 'app' })
      .select('*')
      .single()
    setSalvataggio(false)
    if (error) {
      setErrore(error.message)
      return
    }
    onCambiato(data)
    setValore('')
  }

  return (
    <section className="space-y-2 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h2 className="text-sm font-medium text-gray-400">Peso</h2>
      <p className="text-sm text-gray-300">
        {ultimoPeso ? `Ultimo: ${ultimoPeso.valore} kg (${ultimoPeso.data})` : 'Nessuna registrazione ancora.'}
      </p>
      <p className="text-xs text-gray-500">Storico completo, letto dagli agenti — questo aggiunge solo un nuovo punto, non sostituisce quello precedente.</p>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.1"
          placeholder="peso di oggi (kg)"
          value={valore}
          onChange={(e) => setValore(e.target.value)}
          className="flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
        />
        <button
          onClick={salva}
          disabled={salvataggio || !valore}
          className="rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          Aggiungi
        </button>
      </div>
      {errore && <p className="text-sm text-red-400">{errore}</p>}
    </section>
  )
}

function SezioneDatiGenerali({
  profilo,
  onCambiato,
}: {
  profilo: ProfiloUtente | null
  onCambiato: (p: ProfiloUtente) => void
}) {
  const [altezza, setAltezza] = useState(profilo?.altezza_cm?.toString() ?? '')
  const [dataNascita, setDataNascita] = useState(profilo?.data_nascita ?? '')
  const [sesso, setSesso] = useState(profilo?.sesso ?? '')
  const [livelloEsperienza, setLivelloEsperienza] = useState(profilo?.livello_esperienza ?? '')
  const [allergie, setAllergie] = useState(profilo?.allergie_intolleranze ?? '')
  const [infortuni, setInfortuni] = useState(profilo?.infortuni_pregressi ?? '')
  const [note, setNote] = useState(profilo?.note ?? '')
  const [salvataggio, setSalvataggio] = useState(false)
  const [salvato, setSalvato] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  async function salva() {
    setSalvataggio(true)
    setErrore(null)

    const campi = {
      altezza_cm: altezza ? Number(altezza) : null,
      data_nascita: dataNascita || null,
      sesso: sesso || null,
      livello_esperienza: livelloEsperienza || null,
      allergie_intolleranze: allergie || null,
      infortuni_pregressi: infortuni || null,
      note: note || null,
      updated_at: new Date().toISOString(),
    }

    const query = profilo
      ? supabase.from('profilo_utente').update(campi).eq('id', profilo.id)
      : supabase.from('profilo_utente').insert(campi)

    const { data, error } = await query.select('*').single()
    setSalvataggio(false)
    if (error) {
      setErrore(error.message)
      return
    }
    onCambiato(data)
    setSalvato(true)
    setTimeout(() => setSalvato(false), 1500)
  }

  return (
    <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h2 className="text-sm font-medium text-gray-400">Dati generali</h2>

      <div className="flex gap-2">
        <label className="flex-1 text-xs text-gray-500">
          altezza (cm)
          <input
            type="number"
            value={altezza}
            onChange={(e) => setAltezza(e.target.value)}
            className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
          />
        </label>
        <label className="flex-1 text-xs text-gray-500">
          data di nascita
          <input
            type="date"
            value={dataNascita}
            onChange={(e) => setDataNascita(e.target.value)}
            className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
          />
        </label>
      </div>

      <label className="block text-xs text-gray-500">
        sesso
        <input
          type="text"
          value={sesso}
          onChange={(e) => setSesso(e.target.value)}
          className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
        />
      </label>

      <label className="block text-xs text-gray-500">
        livello di esperienza (allenamento, sport praticati, da quanto tempo)
        <textarea
          value={livelloEsperienza}
          onChange={(e) => setLivelloEsperienza(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
        />
      </label>

      <label className="block text-xs text-gray-500">
        allergie / intolleranze
        <textarea
          value={allergie}
          onChange={(e) => setAllergie(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
        />
      </label>

      <label className="block text-xs text-gray-500">
        infortuni pregressi
        <textarea
          value={infortuni}
          onChange={(e) => setInfortuni(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
        />
      </label>

      <label className="block text-xs text-gray-500">
        altro (qualunque cosa gli agenti ti chiedano spesso e non rientri sopra)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
        />
      </label>

      {errore && <p className="text-sm text-red-400">{errore}</p>}
      <button
        onClick={salva}
        disabled={salvataggio}
        className="rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        {salvato ? '✓ Salvato' : 'Salva'}
      </button>
    </section>
  )
}
