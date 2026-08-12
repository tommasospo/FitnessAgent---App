import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'
import {
  isEsercizioArray,
  type EsercizioEseguito,
  type EsercizioPrescritto,
  type PianoContenutoNutrizione,
  type SerieEseguita,
  type StatoSerie,
} from '../lib/domain'
import { confiniSettimanaISO, numeroSettimanaISO } from '../lib/date'

type Piano = Tables<'piano'>
type SessionePrescritta = Tables<'sessione_prescritta'>
type SessioneEseguita = Tables<'sessione_eseguita'>

const oggi = new Date().toISOString().slice(0, 10)
const settimana = numeroSettimanaISO(new Date())
const { inizio: inizioSettimana, fine: fineSettimana } = confiniSettimanaISO(new Date())

type Fase = 'riepilogo' | 'setup_libero' | 'in_corso' | 'nota_esercizio' | 'fine'

export function AllenamentoDelGiorno() {
  const [pianoAllenamento, setPianoAllenamento] = useState<Piano | null>(null)
  const [sessioneOggi, setSessioneOggi] = useState<SessionePrescritta | null>(null)
  const [sessioniSettimana, setSessioniSettimana] = useState<SessionePrescritta[]>([])
  const [logOggi, setLogOggi] = useState<SessioneEseguita | null>(null)
  const [pianoNutrizione, setPianoNutrizione] = useState<Piano | null>(null)
  const [proposteInAttesa, setProposteInAttesa] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)
  const [mostraSkip, setMostraSkip] = useState(false)
  const [notaSkip, setNotaSkip] = useState('')
  const [salvandoSkip, setSalvandoSkip] = useState(false)

  const [esercizi, setEsercizi] = useState<EsercizioPrescritto[]>([])
  const [fase, setFase] = useState<Fase>('riepilogo')
  const [risultati, setRisultati] = useState<EsercizioEseguito[]>([])
  const [esercizioIdx, setEsercizioIdx] = useState(0)
  const [serieIdx, setSerieIdx] = useState(0)
  const [serieCorrente, setSerieCorrente] = useState<SerieEseguita[]>([])
  const [espansoIdx, setEspansoIdx] = useState<number | null>(null)
  const [noteEsercizio, setNoteEsercizio] = useState('')
  const [noteSessione, setNoteSessione] = useState('')
  const [rpe, setRpe] = useState('')
  const [durataInizio, setDurataInizio] = useState<number | null>(null)
  const [salvataggio, setSalvataggio] = useState(false)
  const [erroreSalvataggio, setErroreSalvataggio] = useState<string | null>(null)

  useEffect(() => {
    async function carica() {
      setLoading(true)
      setErrore(null)

      const [allenamentoRes, nutrizioneRes, proposteRes, logOggiRes] = await Promise.all([
        supabase.from('piano').select('*').eq('tipo', 'allenamento').eq('stato', 'attivo').maybeSingle(),
        supabase.from('piano').select('*').eq('tipo', 'nutrizione').eq('stato', 'attivo').maybeSingle(),
        supabase.from('piano').select('id', { count: 'exact', head: true }).eq('stato', 'proposta'),
        supabase.from('sessione_eseguita').select('*').eq('data_effettiva', oggi).maybeSingle(),
      ])

      if (allenamentoRes.error || nutrizioneRes.error || proposteRes.error || logOggiRes.error) {
        setErrore(
          allenamentoRes.error?.message ??
            nutrizioneRes.error?.message ??
            proposteRes.error?.message ??
            logOggiRes.error?.message ??
            'Errore',
        )
        setLoading(false)
        return
      }

      setPianoAllenamento(allenamentoRes.data)
      setPianoNutrizione(nutrizioneRes.data)
      setProposteInAttesa(proposteRes.count ?? 0)
      setLogOggi(logOggiRes.data)

      if (allenamentoRes.data) {
        const [{ data: sessione }, { data: settimanaData }] = await Promise.all([
          supabase
            .from('sessione_prescritta')
            .select('*')
            .eq('piano_id', allenamentoRes.data.id)
            .eq('data_prevista', oggi)
            .maybeSingle(),
          supabase
            .from('sessione_prescritta')
            .select('*')
            .eq('piano_id', allenamentoRes.data.id)
            .gte('data_prevista', inizioSettimana)
            .lte('data_prevista', fineSettimana)
            .order('data_prevista', { ascending: true }),
        ])
        setSessioneOggi(sessione)
        setEsercizi(sessione && isEsercizioArray(sessione.esercizi) ? sessione.esercizi : [])
        setSessioniSettimana(settimanaData ?? [])
      }

      setLoading(false)
    }

    carica()
  }, [])

  async function confermaSkip() {
    setSalvandoSkip(true)
    const { data, error } = await supabase
      .from('sessione_eseguita')
      .insert({
        sessione_prescritta_id: sessioneOggi?.id ?? null,
        data_effettiva: oggi,
        saltata: true,
        note_libere: notaSkip || null,
        serie_eseguite: [],
      })
      .select('*')
      .single()
    setSalvandoSkip(false)
    if (!error) {
      setLogOggi(data)
      setMostraSkip(false)
    }
  }

  function iniziaAllenamento() {
    if (esercizi.length === 0) return
    setRisultati([])
    setEsercizioIdx(0)
    setSerieIdx(0)
    setSerieCorrente([])
    setEspansoIdx(null)
    setDurataInizio(Date.now())
    setFase('in_corso')
  }

  function registraSerie(stato: StatoSerie) {
    const esercizio = esercizi[esercizioIdx]
    const serie: SerieEseguita = {
      serie_n: serieIdx + 1,
      ripetizioni_target: esercizio.ripetizioni,
      ripetizioni_fatte: stato === 'fatto' ? (esercizio.ripetizioni ?? null) : null,
      secondi_target: esercizio.secondi,
      secondi_fatti: stato === 'fatto' ? (esercizio.secondi ?? null) : null,
      carico: esercizio.carico,
      stato,
    }
    const nuoveSerie = [...serieCorrente, serie]

    if (serieIdx + 1 < esercizio.serie) {
      setSerieCorrente(nuoveSerie)
      setSerieIdx((i) => i + 1)
      return
    }

    setRisultati((prev) => [...prev, { nome: esercizio.nome, serie: nuoveSerie }])
    setSerieCorrente([])
    setNoteEsercizio('')
    setFase('nota_esercizio')
  }

  function continuaDopoNota() {
    if (noteEsercizio.trim()) {
      const nota = noteEsercizio.trim().slice(0, 50)
      setRisultati((prev) => prev.map((r, i) => (i === prev.length - 1 ? { ...r, nota } : r)))
    }

    if (esercizioIdx + 1 < esercizi.length) {
      setEsercizioIdx((i) => i + 1)
      setSerieIdx(0)
      setFase('in_corso')
    } else {
      setFase('fine')
    }
  }

  async function termina() {
    setSalvataggio(true)
    setErroreSalvataggio(null)

    const { data, error } = await supabase
      .from('sessione_eseguita')
      .insert({
        sessione_prescritta_id: sessioneOggi?.id ?? null,
        data_effettiva: oggi,
        durata_minuti: durataInizio ? Math.round((Date.now() - durataInizio) / 60000) : null,
        rpe_sessione: rpe ? Number(rpe) : null,
        note_libere: noteSessione || null,
        serie_eseguite: risultati as unknown as Tables<'sessione_eseguita'>['serie_eseguite'],
      })
      .select('*')
      .single()

    setSalvataggio(false)

    if (error) {
      setErroreSalvataggio(error.message)
      return
    }

    setLogOggi(data)
    setFase('riepilogo')
  }

  if (loading) {
    return <p className="p-4 text-gray-400">Carico...</p>
  }

  const macro = (pianoNutrizione?.contenuto as PianoContenutoNutrizione | null)?.macro
  const inFlusso = fase !== 'riepilogo'
  const giornoNumero = sessioneOggi ? sessioniSettimana.findIndex((s) => s.id === sessioneOggi.id) + 1 : 0
  const giornoTotale = sessioniSettimana.length

  return (
    <div className="space-y-4 p-4 pb-20">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Allenamento del giorno</h1>
        <p className="text-sm text-gray-500">Settimana {settimana}</p>
      </div>

      {errore && <p className="text-sm text-red-400">{errore}</p>}

      {inFlusso && fase !== 'setup_libero' && (
        <ProgressoEsercizi
          esercizi={esercizi}
          risultati={risultati}
          serieCorrente={serieCorrente}
          esercizioIdxCorrente={esercizioIdx}
          espansoIdx={espansoIdx}
          onToggleEspanso={(i) => setEspansoIdx((prev) => (prev === i ? null : i))}
        />
      )}

      {fase === 'riepilogo' && (
        <>
          {proposteInAttesa > 0 && (
            <div className="rounded-lg border border-yellow-700 bg-yellow-950 p-3 text-sm text-yellow-300">
              {proposteInAttesa} proposta{proposteInAttesa > 1 ? 'e' : ''} in attesa — approva o rifiuta in Buzz.
            </div>
          )}

          <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="mb-2 text-sm font-medium text-gray-400">Sessione di oggi</h2>

            {logOggi ? (
              logOggi.saltata ? (
                <div className="space-y-1">
                  <p className="text-gray-400">Sessione saltata.</p>
                  {logOggi.note_libere && <p className="text-sm text-gray-500">{logOggi.note_libere}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-green-400">Allenamento registrato.</p>
                  <Link to={`/storico/${logOggi.id}`} className="text-sm text-gray-400 underline">
                    Vedi dettaglio
                  </Link>
                </div>
              )
            ) : (
              <>
                {!pianoAllenamento && <p className="text-gray-500">Nessun piano di allenamento attivo.</p>}
                {pianoAllenamento && !sessioneOggi && <p className="text-gray-500">Nessuna sessione prevista per oggi.</p>}
                {sessioneOggi && (
                  <div className="space-y-2">
                    <p className="text-gray-200 capitalize">
                      {sessioneOggi.tipo}
                      {giornoTotale > 0 && (
                        <span className="ml-2 text-sm text-gray-500 normal-case">
                          · Giorno {giornoNumero}/{giornoTotale} della settimana
                        </span>
                      )}
                    </p>
                    {esercizi.length > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-300">
                        {esercizi.map((es, i) => (
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
                      <p className="text-gray-500 text-sm">Nessun dettaglio esercizi.</p>
                    )}
                  </div>
                )}

                {pianoAllenamento && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => (sessioneOggi ? iniziaAllenamento() : setFase('setup_libero'))}
                      disabled={sessioneOggi ? esercizi.length === 0 : false}
                      className="w-full rounded-lg bg-green-600 py-2 text-center font-medium text-white disabled:opacity-50"
                    >
                      Inizia allenamento
                    </button>

                    {!mostraSkip && (
                      <button
                        onClick={() => setMostraSkip(true)}
                        className="w-full rounded-lg border border-dashed border-gray-700 py-2 text-sm text-gray-400"
                      >
                        Salta oggi
                      </button>
                    )}

                    {mostraSkip && (
                      <div className="space-y-2 rounded-lg border border-gray-800 bg-gray-950 p-3">
                        <textarea
                          value={notaSkip}
                          onChange={(e) => setNotaSkip(e.target.value)}
                          placeholder="perché salti oggi? (opzionale)"
                          rows={2}
                          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={confermaSkip}
                            disabled={salvandoSkip}
                            className="flex-1 rounded-lg bg-gray-700 py-2 text-sm text-gray-100 disabled:opacity-50"
                          >
                            Conferma skip
                          </button>
                          <button
                            onClick={() => setMostraSkip(false)}
                            className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="mb-2 text-sm font-medium text-gray-400">Macro di oggi</h2>
            {!pianoNutrizione && <p className="text-gray-500">Nessun piano di nutrizione attivo.</p>}
            {pianoNutrizione && !macro && <p className="text-gray-500 text-sm">Piano attivo senza macro definiti.</p>}
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
          </section>
        </>
      )}

      {fase === 'setup_libero' && <AdHocBuilder esercizi={esercizi} onCambia={setEsercizi} onInizia={iniziaAllenamento} />}

      {fase === 'in_corso' && (
        <GuidedRunner
          esercizio={esercizi[esercizioIdx]}
          esercizioNumero={esercizioIdx + 1}
          esercizioTotale={esercizi.length}
          serieNumero={serieIdx + 1}
          onEsito={registraSerie}
        />
      )}

      {fase === 'nota_esercizio' && (
        <EsercizioNotePrompt
          nomeEsercizio={esercizi[esercizioIdx].nome}
          nota={noteEsercizio}
          onCambiaNota={setNoteEsercizio}
          onContinua={continuaDopoNota}
        />
      )}

      {fase === 'fine' && (
        <FineAllenamentoPrompt
          note={noteSessione}
          onCambiaNote={setNoteSessione}
          rpe={rpe}
          onCambiaRpe={setRpe}
          salvataggio={salvataggio}
          errore={erroreSalvataggio}
          onTermina={termina}
        />
      )}
    </div>
  )
}

function simboloSerie(serie: SerieEseguita | undefined): string {
  if (!serie) return '○'
  if (serie.stato === 'fatto') return '✓'
  if (serie.stato === 'cedimento') return '△'
  return '–'
}

function ProgressoEsercizi({
  esercizi,
  risultati,
  serieCorrente,
  esercizioIdxCorrente,
  espansoIdx,
  onToggleEspanso,
}: {
  esercizi: EsercizioPrescritto[]
  risultati: EsercizioEseguito[]
  serieCorrente: SerieEseguita[]
  esercizioIdxCorrente: number
  espansoIdx: number | null
  onToggleEspanso: (i: number) => void
}) {
  const righe = esercizi.map((es, i) => {
    const stato = i < esercizioIdxCorrente ? 'completato' : i === esercizioIdxCorrente ? 'in_corso' : 'da_fare'
    const serie = i < esercizioIdxCorrente ? (risultati[i]?.serie ?? []) : i === esercizioIdxCorrente ? serieCorrente : []
    return { esercizio: es, stato, serie }
  })

  const rigaEspansa = espansoIdx !== null ? righe[espansoIdx] : null

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {righe.map((r, i) => (
          <button
            key={i}
            onClick={() => onToggleEspanso(i)}
            className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs ${
              r.stato === 'in_corso'
                ? 'border-green-600 bg-green-950'
                : r.stato === 'completato'
                  ? 'border-gray-700 bg-gray-900'
                  : 'border-dashed border-gray-800 bg-gray-950 text-gray-500'
            }`}
          >
            <div className="font-medium text-gray-200">{r.esercizio.nome}</div>
            <div className="mt-1 flex gap-0.5 text-gray-400">
              {Array.from({ length: r.esercizio.serie }, (_, s) => (
                <span key={s}>{simboloSerie(r.serie[s])}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {rigaEspansa && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm">
          <p className="font-medium text-gray-200">{rigaEspansa.esercizio.nome}</p>
          <p className="text-gray-500">
            {rigaEspansa.esercizio.serie}×
            {rigaEspansa.esercizio.ripetizioni ? `${rigaEspansa.esercizio.ripetizioni} rip` : `${rigaEspansa.esercizio.secondi}s`}
            {rigaEspansa.esercizio.carico ? ` @ ${rigaEspansa.esercizio.carico}kg` : ''}
          </p>
          {rigaEspansa.serie.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-gray-400">
              {rigaEspansa.serie.map((s, i) => (
                <li key={i}>
                  Serie {s.serie_n}: {simboloSerie(s)} {s.stato}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function AdHocBuilder({
  esercizi,
  onCambia,
  onInizia,
}: {
  esercizi: EsercizioPrescritto[]
  onCambia: (esercizi: EsercizioPrescritto[]) => void
  onInizia: () => void
}) {
  function aggiungi() {
    onCambia([...esercizi, { nome: '', serie: 3, ripetizioni: 10 }])
  }

  function aggiorna(i: number, cambio: Partial<EsercizioPrescritto>) {
    onCambia(esercizi.map((e, idx) => (idx === i ? { ...e, ...cambio } : e)))
  }

  function rimuovi(i: number) {
    onCambia(esercizi.filter((_, idx) => idx !== i))
  }

  const pronto = esercizi.length > 0 && esercizi.every((e) => e.nome && (e.ripetizioni || e.secondi))

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Nessuna sessione prevista per oggi — costruisci un allenamento libero.</p>

      <div className="space-y-2">
        {esercizi.map((es, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-gray-800 bg-gray-900 p-3">
            <div className="flex items-center gap-2">
              <input
                placeholder="esercizio"
                value={es.nome}
                onChange={(e) => aggiorna(i, { nome: e.target.value })}
                className="flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
              />
              <button onClick={() => rimuovi(i)} className="text-xs text-gray-500">
                rimuovi
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="serie"
                value={es.serie || ''}
                onChange={(e) => aggiorna(i, { serie: Number(e.target.value) })}
                className="w-1/4 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
              />
              <input
                type="number"
                placeholder="ripetizioni"
                value={es.ripetizioni ?? ''}
                onChange={(e) =>
                  aggiorna(i, {
                    ripetizioni: e.target.value ? Number(e.target.value) : undefined,
                    secondi: e.target.value ? undefined : es.secondi,
                  })
                }
                className="w-1/4 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
              />
              <input
                type="number"
                placeholder="o secondi"
                value={es.secondi ?? ''}
                onChange={(e) =>
                  aggiorna(i, {
                    secondi: e.target.value ? Number(e.target.value) : undefined,
                    ripetizioni: e.target.value ? undefined : es.ripetizioni,
                  })
                }
                className="w-1/4 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
              />
              <input
                type="number"
                placeholder="carico kg"
                value={es.carico ?? ''}
                onChange={(e) => aggiorna(i, { carico: e.target.value ? Number(e.target.value) : undefined })}
                className="w-1/4 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
              />
            </div>
          </div>
        ))}

        <button
          onClick={aggiungi}
          className="w-full rounded-lg border border-dashed border-gray-700 py-2 text-sm text-gray-400"
        >
          + aggiungi esercizio
        </button>
      </div>

      <button
        onClick={onInizia}
        disabled={!pronto}
        className="w-full rounded-lg bg-green-600 py-2 font-medium text-white disabled:opacity-50"
      >
        Inizia allenamento
      </button>
    </div>
  )
}

function GuidedRunner({
  esercizio,
  esercizioNumero,
  esercizioTotale,
  serieNumero,
  onEsito,
}: {
  esercizio: EsercizioPrescritto
  esercizioNumero: number
  esercizioTotale: number
  serieNumero: number
  onEsito: (stato: StatoSerie) => void
}) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="text-sm text-gray-500">
        Esercizio {esercizioNumero} di {esercizioTotale}
      </p>
      <h2 className="text-xl font-semibold text-gray-100">{esercizio.nome}</h2>
      <p className="text-sm text-gray-500">
        Serie {serieNumero} di {esercizio.serie}
      </p>
      <p className="text-2xl text-gray-200">
        {esercizio.ripetizioni ? `${esercizio.ripetizioni} ripetizioni` : `${esercizio.secondi} secondi`}
        {esercizio.carico ? ` @ ${esercizio.carico}kg` : ''}
      </p>

      <div className="grid grid-cols-1 gap-2 pt-2">
        <button onClick={() => onEsito('fatto')} className="w-full rounded-lg bg-green-600 py-3 font-medium text-white">
          Fatto
        </button>
        <button
          onClick={() => onEsito('cedimento')}
          className="w-full rounded-lg border border-yellow-700 py-3 font-medium text-yellow-400"
        >
          Cedimento
        </button>
        <button
          onClick={() => onEsito('skip')}
          className="w-full rounded-lg border border-dashed border-gray-700 py-3 text-gray-400"
        >
          Skip
        </button>
      </div>
    </section>
  )
}

function EsercizioNotePrompt({
  nomeEsercizio,
  nota,
  onCambiaNota,
  onContinua,
}: {
  nomeEsercizio: string
  nota: string
  onCambiaNota: (nota: string) => void
  onContinua: () => void
}) {
  return (
    <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h2 className="text-sm font-medium text-gray-400">{nomeEsercizio} completato</h2>
      <div>
        <textarea
          placeholder="nota per l'agente (opzionale)"
          value={nota}
          onChange={(e) => onCambiaNota(e.target.value.slice(0, 50))}
          maxLength={50}
          rows={2}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
        />
        <p className="text-right text-xs text-gray-500">{nota.length}/50</p>
      </div>
      <button onClick={onContinua} className="w-full rounded-lg bg-green-600 py-2 font-medium text-white">
        Continua
      </button>
    </section>
  )
}

function FineAllenamentoPrompt({
  note,
  onCambiaNote,
  rpe,
  onCambiaRpe,
  salvataggio,
  errore,
  onTermina,
}: {
  note: string
  onCambiaNote: (note: string) => void
  rpe: string
  onCambiaRpe: (rpe: string) => void
  salvataggio: boolean
  errore: string | null
  onTermina: () => void
}) {
  return (
    <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h2 className="text-sm font-medium text-gray-400">Allenamento completato</h2>
      <textarea
        placeholder="note libere sulla sessione (opzionale)"
        value={note}
        onChange={(e) => onCambiaNote(e.target.value)}
        rows={3}
        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
      />
      <input
        type="number"
        placeholder="RPE (1-10, opzionale)"
        min={1}
        max={10}
        value={rpe}
        onChange={(e) => onCambiaRpe(e.target.value)}
        className="w-1/2 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100"
      />
      {errore && <p className="text-sm text-red-400">{errore}</p>}
      <button
        onClick={onTermina}
        disabled={salvataggio}
        className="w-full rounded-lg bg-green-600 py-2 font-medium text-white disabled:opacity-50"
      >
        Termina allenamento
      </button>
    </section>
  )
}
