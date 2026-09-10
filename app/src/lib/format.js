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
  if (/=\s*w\d+-h\d+/.test(url)) return url.replace(/=w\d+-h\d+(?:-l[^=&]*)?/, `=w${size}-h${size}`)
  return url.includes('=') ? `${url}&w=${size}` : `${url}=w${size}-h${size}`
}

export function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n))
}