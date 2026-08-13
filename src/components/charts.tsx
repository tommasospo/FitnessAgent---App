import { useId, useState } from 'react'

// Grafici minimi per gli andamenti (kcal, passi, peso...). Segue le regole della
// skill dataviz: barre con solo l'angolo superiore arrotondato e gap di 2px tra loro,
// linee da 2px con marker cerchiati da un anello nel colore della superficie, un solo
// hue per serie (nessuna legenda: il titolo della sezione dice già cosa si guarda),
// tooltip al tocco/hover che non nasconde nulla che non sia già nella lista sotto.

export interface PuntoTrend {
  data: string // YYYY-MM-DD
  valore: number | null
}

export function formattaGiorno(data: string): string {
  return new Date(`${data}T00:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

export const PRESET_GIORNI = [7, 14, 30, 90] as const

/** Filtro periodo — una riga sopra i grafici, i preset scopano tutto quello che sta sotto
 *  (grafici, statistiche e tabella insieme), mai un filtro diverso per ogni singolo grafico. */
export function PeriodoFiltro({ valore, onCambia }: { valore: number; onCambia: (giorni: number) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {PRESET_GIORNI.map((g) => (
        <button
          key={g}
          onClick={() => onCambia(g)}
          className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
            valore === g ? 'border-green-600 bg-green-950 text-green-400' : 'border-gray-800 text-gray-500'
          }`}
        >
          {g} giorni
        </button>
      ))}
    </div>
  )
}

export type Vista = 'grafico' | 'tabella'

export function VistaToggle({ vista, onCambia }: { vista: Vista; onCambia: (v: Vista) => void }) {
  return (
    <div className="flex shrink-0 gap-1 text-xs">
      <button
        onClick={() => onCambia('grafico')}
        className={`rounded px-2 py-1 ${vista === 'grafico' ? 'bg-gray-800 text-gray-100' : 'text-gray-500'}`}
      >
        Grafico
      </button>
      <button
        onClick={() => onCambia('tabella')}
        className={`rounded px-2 py-1 ${vista === 'tabella' ? 'bg-gray-800 text-gray-100' : 'text-gray-500'}`}
      >
        Tabella
      </button>
    </div>
  )
}

interface ColonnaTabella<T> {
  chiave: keyof T
  etichetta: string
  unita?: string
}

/** Vista tabellare — sempre raggiungibile in alternativa al grafico, stessi dati, riga più
 *  recente in cima. Nessun valore mostrato nel grafico che non sia anche qui. */
export function TabellaStorico<T extends { data: string }>({
  righe,
  colonne,
}: {
  righe: T[]
  colonne: ColonnaTabella<T>[]
}) {
  if (righe.length === 0) {
    return <p className="text-sm text-gray-500">Nessun dato nel periodo selezionato.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <thead>
          <tr className="border-b border-gray-800 text-gray-500">
            <th className="py-1.5 pr-3 font-medium">Data</th>
            {colonne.map((c) => (
              <th key={String(c.chiave)} className="py-1.5 pr-3 font-medium">
                {c.etichetta}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...righe].reverse().map((r) => (
            <tr key={r.data} className="border-b border-gray-900 text-gray-300">
              <td className="py-1.5 pr-3 whitespace-nowrap text-gray-500">{formattaGiorno(r.data)}</td>
              {colonne.map((c) => {
                const v = r[c.chiave]
                return (
                  <td key={String(c.chiave)} className="py-1.5 pr-3 whitespace-nowrap">
                    {v !== null && v !== undefined ? `${v}${c.unita ?? ''}` : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function scalaY(valori: number[], target?: number): { min: number; max: number } {
  const tutti = target !== undefined ? [...valori, target] : valori
  const max = Math.max(...tutti, 1)
  return { min: 0, max: max * 1.15 }
}

export function BarTrend({
  dati,
  target,
  colore,
  unita = '',
}: {
  dati: PuntoTrend[]
  target?: number
  colore: string
  unita?: string
}) {
  const [selezionato, setSelezionato] = useState<number | null>(null)
  const valoriValidi = dati.map((d) => d.valore).filter((v): v is number => v !== null)

  if (valoriValidi.length === 0) {
    return <p className="text-sm text-gray-500">Nessun dato ancora per questo periodo.</p>
  }

  const larghezza = 320
  const altezza = 120
  const padSotto = 18
  const alteChart = altezza - padSotto
  const { max } = scalaY(valoriValidi, target)
  const bandLarghezza = larghezza / dati.length
  const barLarghezza = Math.min(24, bandLarghezza - 2)

  const idx = selezionato ?? dati.length - 1
  const evidenziato = dati[idx]

  return (
    <div>
      <svg viewBox={`0 0 ${larghezza} ${altezza}`} className="w-full touch-none" role="img" aria-label={`Andamento, valore più recente ${evidenziato.valore ?? '—'}${unita}`}>
        {target !== undefined && (
          <>
            <line
              x1={0}
              x2={larghezza}
              y1={alteChart - (target / max) * alteChart}
              y2={alteChart - (target / max) * alteChart}
              stroke="#4b5563"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          </>
        )}
        {dati.map((d, i) => {
          if (d.valore === null) return null
          const h = Math.max(2, (d.valore / max) * alteChart)
          const x = i * bandLarghezza + (bandLarghezza - barLarghezza) / 2
          const y = alteChart - h
          const r = Math.min(4, h / 2)
          const attivo = i === idx
          return (
            <path
              key={d.data}
              d={`M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barLarghezza - r},${y} Q${x + barLarghezza},${y} ${x + barLarghezza},${y + r} L${x + barLarghezza},${alteChart} L${x},${alteChart} Z`}
              fill={colore}
              opacity={attivo ? 1 : 0.55}
              onPointerDown={() => setSelezionato(i)}
              style={{ cursor: 'pointer' }}
            />
          )
        })}
        {/* hit target invisibile, più largo della barra per il tocco */}
        {dati.map((d, i) => (
          <rect
            key={`hit-${d.data}`}
            x={i * bandLarghezza}
            y={0}
            width={bandLarghezza}
            height={altezza}
            fill="transparent"
            onPointerDown={() => setSelezionato(i)}
            style={{ cursor: 'pointer' }}
          />
        ))}
        <text x={0} y={altezza} className="fill-gray-500" fontSize={9}>
          {formattaGiorno(dati[0].data)}
        </text>
        <text x={larghezza} y={altezza} textAnchor="end" className="fill-gray-500" fontSize={9}>
          {formattaGiorno(dati[dati.length - 1].data)}
        </text>
      </svg>
      <p className="mt-1 text-center text-xs text-gray-400">
        {formattaGiorno(evidenziato.data)}: <span className="text-gray-200">{evidenziato.valore ?? '—'}{unita}</span>
        {target !== undefined && <span className="text-gray-500"> (target {target}{unita})</span>}
      </p>
    </div>
  )
}

export function LineTrend({ dati, colore, unita = '' }: { dati: PuntoTrend[]; colore: string; unita?: string }) {
  const gradId = useId()
  const [selezionato, setSelezionato] = useState<number | null>(null)
  const punti = dati.filter((d): d is { data: string; valore: number } => d.valore !== null)

  if (punti.length < 2) {
    return <p className="text-sm text-gray-500">Servono almeno due rilevazioni per un grafico d'andamento.</p>
  }

  const larghezza = 320
  const altezza = 120
  const padSotto = 18
  const alteChart = altezza - padSotto
  const valori = punti.map((p) => p.valore)
  const minV = Math.min(...valori)
  const maxV = Math.max(...valori)
  const range = maxV - minV || 1
  const passo = larghezza / (punti.length - 1)

  const coordX = (i: number) => i * passo
  const coordY = (v: number) => alteChart - ((v - minV) / range) * (alteChart - 8) - 4

  const linePath = punti.map((p, i) => `${i === 0 ? 'M' : 'L'}${coordX(i)},${coordY(p.valore)}`).join(' ')
  const areaPath = `${linePath} L${coordX(punti.length - 1)},${alteChart} L0,${alteChart} Z`

  const idx = selezionato ?? punti.length - 1
  const evidenziato = punti[idx]

  return (
    <div>
      <svg viewBox={`0 0 ${larghezza} ${altezza}`} className="w-full touch-none" role="img" aria-label={`Andamento, ultima rilevazione ${evidenziato.valore}${unita}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colore} stopOpacity={0.1} />
            <stop offset="100%" stopColor={colore} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={colore} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {punti.map((p, i) => (
          <g key={p.data}>
            <circle cx={coordX(i)} cy={coordY(p.valore)} r={5} fill="#111827" />
            <circle
              cx={coordX(i)}
              cy={coordY(p.valore)}
              r={i === idx ? 4 : 3}
              fill={colore}
            />
            <circle
              cx={coordX(i)}
              cy={coordY(p.valore)}
              r={12}
              fill="transparent"
              onPointerDown={() => setSelezionato(i)}
              style={{ cursor: 'pointer' }}
            />
          </g>
        ))}
        <text x={0} y={altezza} className="fill-gray-500" fontSize={9}>
          {formattaGiorno(punti[0].data)}
        </text>
        <text x={larghezza} y={altezza} textAnchor="end" className="fill-gray-500" fontSize={9}>
          {formattaGiorno(punti[punti.length - 1].data)}
        </text>
      </svg>
      <p className="mt-1 text-center text-xs text-gray-400">
        {formattaGiorno(evidenziato.data)}: <span className="text-gray-200">{evidenziato.valore}{unita}</span>
      </p>
    </div>
  )
}

export function StatTile({ etichetta, valore, unita = '' }: { etichetta: string; valore: number | string; unita?: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-2.5">
      <dt className="text-xs text-gray-500">{etichetta}</dt>
      <dd className="text-lg font-semibold text-gray-100">
        {valore}
        <span className="text-sm font-normal text-gray-400">{unita}</span>
      </dd>
    </div>
  )
}

export function media(valori: (number | null)[]): number | null {
  const validi = valori.filter((v): v is number => v !== null)
  if (validi.length === 0) return null
  return Math.round((validi.reduce((a, b) => a + b, 0) / validi.length) * 10) / 10
}
