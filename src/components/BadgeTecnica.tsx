import type { TecnicaEsercizio } from '../lib/domain'

const STILI: Record<TecnicaEsercizio, { etichetta: string; classe: string }> = {
  superset: { etichetta: 'Superset', classe: 'border-blue-700 bg-blue-950 text-blue-300' },
  piramidale: { etichetta: 'Piramidale', classe: 'border-purple-700 bg-purple-950 text-purple-300' },
  stripping: { etichetta: 'Stripping', classe: 'border-orange-700 bg-orange-950 text-orange-300' },
  cedimento: { etichetta: 'A cedimento', classe: 'border-red-700 bg-red-950 text-red-300' },
}

export function BadgeTecnica({ tecnica }: { tecnica: TecnicaEsercizio | undefined }) {
  if (!tecnica) return null
  const stile = STILI[tecnica]
  return <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${stile.classe}`}>{stile.etichetta}</span>
}
