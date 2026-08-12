// Forme concettuali del contenuto JSON dei piani/sessioni — PRD §8.
// Non tipizzate a livello di database: i campi sono opzionali perché gli agenti
// che scrivono i piani potrebbero non popolarli tutti.

export interface EsercizioPrescritto {
  nome: string
  serie: number
  ripetizioni?: number // uno dei due: esercizio a ripetizioni...
  secondi?: number // ...o a tempo (plank, corsa a tempo, ...)
  carico?: number
  recupero_secondi?: number
  note?: string
}

export interface MacroTarget {
  kcal?: number
  proteine_g?: number
  carboidrati_g?: number
  grassi_g?: number
  note?: string
}

export interface PianoContenutoNutrizione {
  macro?: MacroTarget
  note?: string
}

export type StatoSerie = 'fatto' | 'cedimento' | 'skip'

export interface SerieEseguita {
  serie_n: number
  ripetizioni_target?: number
  ripetizioni_fatte?: number | null
  secondi_target?: number
  secondi_fatti?: number | null
  carico?: number
  stato: StatoSerie
}

export interface EsercizioEseguito {
  nome: string
  serie: SerieEseguita[]
  nota?: string // max 50 caratteri, per esercizio, letta dagli agenti
}

export function isEsercizioArray(value: unknown): value is EsercizioPrescritto[] {
  return Array.isArray(value)
}

export function isEsercizioEseguitoArray(value: unknown): value is EsercizioEseguito[] {
  return Array.isArray(value)
}
