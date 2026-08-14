import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'
import { isEsercizioArray, type PianoContenutoNutrizione } from '../lib/domain'
import { pianoScaduto, settimaneRimanenti } from '../lib/date'

type Piano = Tables<'piano'>
type SessionePrescritta = Tables<'sessione_prescritta'>

export function SchedaDettaglio() {
  const { id } = useParams<{ id: string }>()
  const [piano, setPiano] = useState<Piano | null>(null)
  const [sessioni, setSessioni] = useState<SessionePrescritta[]>([])
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)

  useEffect(() => {
    async function carica() {
      if (!id) return
      setLoading(true)

      const { data: p, error: errPiano } = await supabase.from('piano').select('*').eq('id', id).single()
      if (errPiano) {
        setErrore(errPiano.message)
        setLoading(false)
        return
      }
      setPiano(p)

      if (p.tipo === 'allenamento') {
        const { data: s, error: errSessioni } = await supabase
          .from('sessione_prescritta')
          .select('*')
          .eq('piano_id', p.id)
          .order('giorno_numero', { ascending: true })
        if (!errSessioni) setSessioni(s)
      }

      setLoading(false)
    }

    carica()
  }, [id])

  if (loading) {
    return <p className="p-4 text-gray-400">Carico...</p>
  }

  if (errore || !piano) {
    return <p className="p-4 text-sm text-red-400">{errore ?? 'Scheda non trovata.'}</p>
  }

  const contenutoNutrizione = piano.contenuto as PianoContenutoNutrizione | null
  const macro = contenutoNutrizione?.macro
  const noteNutrizione = contenutoNutrizione?.note

  return (
    <div className="space-y-4 p-4 pb-20">
      <Link to="/schede" className="text-sm text-gray-500">
        ← Schede
      </Link>
      <h1 className="text-lg font-semibold capitalize text-gray-100">
        {piano.tipo} v{piano.versione}
      </h1>
      <p className={piano.stato === 'attivo' ? 'text-sm text-green-400' : 'text-sm text-gray-500'}>{piano.stato}</p>
      {piano.motivazione && <p className="text-sm text-gray-400">{piano.motivazione}</p>}
      <InfoDurata piano={piano} />

      {piano.stato === 'proposta' && (
        <div className="space-y-2">
          <AttivaPiano piano={piano} etichetta="Approva questa proposta" onCambiato={setPiano} />
          <DeclinaProposta piano={piano} onCambiato={setPiano} />
        </div>
      )}

      {piano.stato === 'archiviato' && <AttivaPiano piano={piano} etichetta="Riattiva questa scheda" onCambiato={setPiano} />}

      {piano.tipo === 'allenamento' && (
        <section className="space-y-3">
          {sessioni.length === 0 && <p className="text-sm text-gray-500">Nessuna sessione prescritta.</p>}
          {sessioni.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <h2 className="mb-2 text-sm font-medium text-gray-400">
                Giorno {s.giorno_numero} · {s.tipo}
              </h2>
              {isEsercizioArray(s.esercizi) && s.esercizi.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-300">
                  {s.esercizi.map((es, i) => (
                    <li key={i} className="flex justify-between border-b border-gray-800 py-1">
                      <span>{es.nome}</span>
                      <span className="text-gray-500">
                        {es.serie}×{es.ripetizioni ? `${es.ripetizioni} rip` : `${es.secondi}s`}
                        {es.carico ? ` @ ${es.carico}kg` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nessun dettaglio esercizi.</p>
              )}
            </div>
          ))}
        </section>
      )}

      {piano.tipo === 'nutrizione' && (
        <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
          {!macro && <p className="text-sm text-gray-500">Nessun macro definito.</p>}
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
          {macro?.note && <p className="text-sm text-gray-400">{macro.note}</p>}
          {noteNutrizione && (
            <div className="border-t border-gray-800 pt-3">
              <h2 className="mb-1 text-sm font-medium text-gray-400">Note della nutrizionista</h2>
              <p className="text-sm text-gray-300">{noteNutrizione}</p>
            </div>
          )}
        </section>
      )}

      {piano.tipo === 'nutrizione' && (
        <section className="space-y-1 rounded-xl border border-dashed border-gray-800 p-4">
          <h2 className="text-sm font-medium text-gray-400">Diario alimentare reale</h2>
          <p className="text-sm text-gray-500">
            Non ancora collegato. Quando l'app avrà accesso al diario alimentare da Apple Health, qui vedrai il confronto
            giorno per giorno tra calorie/macro effettivi e questo target.
          </p>
        </section>
      )}

      <FeedbackScheda pianoId={piano.id} valoreIniziale={piano.feedback_utente ?? ''} />
    </div>
  )
}

/** Durata del piano e, se attivo, quanto manca alla scadenza — o l'etichetta "Scaduta". Solo
 *  informativo: la scadenza non cambia mai da sola lo stato del piano (vedi AttivaPiano). */
function InfoDurata({ piano }: { piano: Piano }) {
  if (!piano.durata_settimane) return null

  if (piano.stato !== 'attivo' || !piano.data_attivazione) {
    return <p className="text-sm text-gray-500">Durata prevista: {piano.durata_settimane} settimane</p>
  }

  if (pianoScaduto(piano.data_attivazione, piano.durata_settimane)) {
    return <p className="text-sm font-medium text-red-400">Scaduta</p>
  }

  const rimanenti = settimaneRimanenti(piano.data_attivazione, piano.durata_settimane)
  return (
    <p className="text-sm text-gray-500">
      {rimanenti} settiman{rimanenti === 1 ? 'a' : 'e'} rimanent{rimanenti === 1 ? 'e' : 'i'} di {piano.durata_settimane}
    </p>
  )
}

/** Attiva un piano (una proposta da approvare, o una versione archiviata da riattivare): lo rende
 *  attivo e archivia la versione attualmente attiva dello stesso tipo, se c'è. Unico punto in cui un
 *  piano cambia stato — mai dagli agenti (PRD §10.2: "mai desumibile da un 'ok va bene' in linguaggio
 *  naturale"), per questo qui e non in chat, con una conferma esplicita in due tap per restare
 *  "deliberato e inequivocabile" anche fuori da Buzz. */
function AttivaPiano({ piano, etichetta, onCambiato }: { piano: Piano; etichetta: string; onCambiato: (piano: Piano) => void }) {
  const [confermaRichiesta, setConfermaRichiesta] = useState(false)
  const [salvataggio, setSalvataggio] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  async function attiva() {
    setSalvataggio(true)
    setErrore(null)

    const { data: attivoPrecedente, error: errAttivo } = await supabase
      .from('piano')
      .select('id')
      .eq('tipo', piano.tipo)
      .eq('stato', 'attivo')
      .maybeSingle()
    if (errAttivo) {
      setErrore(errAttivo.message)
      setSalvataggio(false)
      return
    }

    if (attivoPrecedente) {
      const { error: errArchivia } = await supabase.from('piano').update({ stato: 'archiviato' }).eq('id', attivoPrecedente.id)
      if (errArchivia) {
        setErrore(errArchivia.message)
        setSalvataggio(false)
        return
      }
    }

    const { data: pianoAttivato, error: errAttiva } = await supabase
      .from('piano')
      .update({ stato: 'attivo', data_attivazione: new Date().toISOString() })
      .eq('id', piano.id)
      .select('*')
      .single()

    setSalvataggio(false)
    if (errAttiva) {
      setErrore(errAttiva.message)
      return
    }

    onCambiato(pianoAttivato)
  }

  return (
    <section className="space-y-2 rounded-xl border border-green-800 bg-green-950/30 p-4">
      {errore && <p className="text-sm text-red-400">{errore}</p>}
      {!confermaRichiesta ? (
        <button
          onClick={() => setConfermaRichiesta(true)}
          className="w-full rounded-lg bg-green-600 py-2 font-medium text-white"
        >
          {etichetta}
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            Conferma: questa scheda diventa attiva, la versione attualmente attiva (se c'è) viene archiviata. Sei sicuro?
          </p>
          <div className="flex gap-2">
            <button
              onClick={attiva}
              disabled={salvataggio}
              className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {salvataggio ? 'Attivo...' : 'Conferma'}
            </button>
            <button
              onClick={() => setConfermaRichiesta(false)}
              disabled={salvataggio}
              className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

/** Rifiuta una proposta (PRD §10.2, /rifiuta): la archivia senza toccare il piano attivo — non c'è
 *  nulla da attivare, solo da scartare. Il motivo dato dall'agente resta leggibile in `motivazione`. */
function DeclinaProposta({ piano, onCambiato }: { piano: Piano; onCambiato: (piano: Piano) => void }) {
  const [confermaRichiesta, setConfermaRichiesta] = useState(false)
  const [salvataggio, setSalvataggio] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  async function declina() {
    setSalvataggio(true)
    setErrore(null)

    const { data: pianoDeclinato, error } = await supabase
      .from('piano')
      .update({ stato: 'archiviato' })
      .eq('id', piano.id)
      .select('*')
      .single()

    setSalvataggio(false)
    if (error) {
      setErrore(error.message)
      return
    }

    onCambiato(pianoDeclinato)
  }

  return (
    <section className="space-y-2 rounded-xl border border-gray-800 bg-gray-900 p-4">
      {errore && <p className="text-sm text-red-400">{errore}</p>}
      {!confermaRichiesta ? (
        <button
          onClick={() => setConfermaRichiesta(true)}
          className="w-full rounded-lg border border-red-800 py-2 text-sm font-medium text-red-400"
        >
          Declina questa proposta
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">Conferma: questa proposta viene archiviata (potrai comunque riattivarla in seguito da qui, se ripensi). Sei sicuro?</p>
          <div className="flex gap-2">
            <button
              onClick={declina}
              disabled={salvataggio}
              className="flex-1 rounded-lg bg-red-700 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {salvataggio ? 'Declino...' : 'Conferma'}
            </button>
            <button
              onClick={() => setConfermaRichiesta(false)}
              disabled={salvataggio}
              className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function FeedbackScheda({ pianoId, valoreIniziale }: { pianoId: string; valoreIniziale: string }) {
  const [testo, setTesto] = useState(valoreIniziale)
  const [salvataggio, setSalvataggio] = useState(false)
  const [salvato, setSalvato] = useState(false)

  async function salva() {
    setSalvataggio(true)
    const { error } = await supabase.from('piano').update({ feedback_utente: testo || null }).eq('id', pianoId)
    setSalvataggio(false)
    if (!error) {
      setSalvato(true)
      setTimeout(() => setSalvato(false), 1500)
    }
  }

  return (
    <section className="space-y-2 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h2 className="text-sm font-medium text-gray-400">Il tuo feedback su questa scheda</h2>
      <textarea
        value={testo}
        onChange={(e) => setTesto(e.target.value)}
        placeholder="cosa ne pensi di questa scheda? (letto dagli agenti)"
        rows={3}
        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
      />
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
