// Numero di settimana ISO-8601 (lunedì primo giorno, settimana 1 = quella che contiene il primo giovedì dell'anno).
export function numeroSettimanaISO(data: Date): number {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()))
  const giornoSettimana = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - giornoSettimana)
  const inizioAnno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - inizioAnno.getTime()) / 86400000 + 1) / 7)
}

// Lunedì e domenica (incluso) della settimana ISO che contiene `data`, come stringhe YYYY-MM-DD.
export function confiniSettimanaISO(data: Date): { inizio: string; fine: string } {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()))
  const giornoSettimana = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - giornoSettimana + 1)
  const inizio = d.toISOString().slice(0, 10)
  d.setUTCDate(d.getUTCDate() + 6)
  const fine = d.toISOString().slice(0, 10)
  return { inizio, fine }
}

function scadenzaPiano(dataAttivazione: string, durataSettimane: number): Date {
  const scadenza = new Date(dataAttivazione)
  scadenza.setUTCDate(scadenza.getUTCDate() + durataSettimane * 7)
  return scadenza
}

// True se un piano con questa attivazione e durata ha superato la scadenza. Un piano senza
// durata_settimane o mai attivato non scade mai (torna sempre false).
export function pianoScaduto(dataAttivazione: string | null, durataSettimane: number | null): boolean {
  if (!dataAttivazione || !durataSettimane) return false
  return Date.now() > scadenzaPiano(dataAttivazione, durataSettimane).getTime()
}

// Settimane mancanti alla scadenza (arrotondate per eccesso, minimo 0 se già scaduto).
export function settimaneRimanenti(dataAttivazione: string, durataSettimane: number): number {
  const msRimanenti = scadenzaPiano(dataAttivazione, durataSettimane).getTime() - Date.now()
  if (msRimanenti <= 0) return 0
  return Math.ceil(msRimanenti / (7 * 24 * 60 * 60 * 1000))
}

// Settimana corrente dall'attivazione del piano (1-based, es. "settimana 3").
export function settimanaCorrenteDelPiano(dataAttivazione: string): number {
  const msTrascorsi = Date.now() - new Date(dataAttivazione).getTime()
  return Math.max(1, Math.floor(msTrascorsi / (7 * 24 * 60 * 60 * 1000)) + 1)
}
