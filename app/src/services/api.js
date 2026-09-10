import { LYRICS_API } from '../lib/constants'

/* Capa de red → backend local (server.py). Mismo origen en producción. */

async function request(url, opts) {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getCharts(cc) {
  const d = await request(`/api/charts?cc=${cc}`)
  if (!d || d.ok === false) throw new Error((d && d.error) || 'Sin datos de charts')
  return d
}

export async function searchSongs(q) {
  const d = await request(`/api/search?q=${encodeURIComponent(q)}`)
  if (!d || d.ok === false) throw new Error((d && d.error) || 'Sin datos de búsqueda')
  return d
}

export async function resolveSong(id) {
  const d = await request(`/api/song?id=${encodeURIComponent(id)}`)
  if (!d || d.ok === false) throw new Error((d && d.error) || 'Sin url de audio')
  return d
}

export async function backendLyrics(id) {
  try {
    const d = await request(`/api/lyrics?id=${encodeURIComponent(id)}`)
    return d.ok && d.lyrics ? d.lyrics : null
  } catch {
    return null
  }
}

export async function ovhLyrics(artist, title) {
  try {
    const res = await fetch(
      `${LYRICS_API}/${encodeURIComponent(artist)}/${encodeURIComponent(title.split('(')[0].trim())}`
    )
    if (!res.ok) return null
    const d = await res.json()
    return d.lyrics || null
  } catch {
    return null
  }
}

export function toSong(s) {
  return {
    title: s.title,
    artist: s.artist,
    album: s.album || '',
    ytmId: s.videoId,
    duration: s.duration || 0,
    thumb: s.thumb || ''
  }
}