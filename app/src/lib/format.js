export function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds) || seconds <= 0) return '--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/* Reemplaza el tamaño de una miniatura de YouTube Music (u otras). */
export function thumbFor(url, size = 256) {
  if (!url) return ''
  const clean = String(url).trim()
  const canProxy = /^https?:\/\/[^/]*(?:googleusercontent\.com|ggpht\.com|ytimg\.com)\//i.test(clean)
  if (!canProxy) return clean

  const queryAt = clean.indexOf('?')
  const base = queryAt >= 0 ? clean.slice(0, queryAt) : clean
  const query = queryAt >= 0 ? clean.slice(queryAt) : ''
  const supportsSize = /(?:googleusercontent\.com|ggpht\.com)\//i.test(clean)
  let resized = base
  if (supportsSize) {
    const suffix = `=w${size}-h${size}-l90-rj`
    resized = /=(?:w\d+-h\d+|s\d+)(?:-[^/?#]*)?$/i.test(base)
      ? base.replace(/=(?:w\d+-h\d+|s\d+)(?:-[^/?#]*)?$/i, suffix)
      : `${base}${suffix}`
  }

  return `/api/image?u=${encodeURIComponent(`${resized}${query}`)}`
}

/* Evita el icono roto si una portada remota caduca o responde con error. */
export function artworkFallback(event) {
  const image = event.currentTarget
  if (image.src.startsWith('data:image/svg+xml')) return
  image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23181818'/%3E%3Cpath d='M39 14v28.5a8 8 0 1 1-4-7V20l17-4v22.5a8 8 0 1 1-4-7V10z' fill='%238b8b8b'/%3E%3C/svg%3E"
  image.alt = 'Carátula no disponible'
}

export function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n))
}
