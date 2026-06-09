/** Huidige tijd in ms. Geïsoleerd zodat de domeinlaag puur blijft. */
export function nu(): number {
  return Date.now()
}

/** Genereert een uniek id (voor spelers e.d.). */
export function maakId(): string {
  return crypto.randomUUID()
}
