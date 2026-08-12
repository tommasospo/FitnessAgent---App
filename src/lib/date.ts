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
