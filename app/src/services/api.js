import { LYRICS_API } from '../lib/constants'

/* Capa de red → backend local (server.py). Mismo origen en producción. */

async function request(url, opts) {
  const res = await fetch(url, opts)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`)
  return data
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

export async function resolveSong(id, { refresh = false } = {}) {
  const qs = `/api/song?id=${encodeURIComponent(id)}${refresh ? '&refresh=1' : ''}`
  const d = await request(qs)
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

export async function timedLyrics(song) {
  try {
    const d = await request(
      `/api/lyrics/timed?artist=${encodeURIComponent(song.artist || '')}&title=${encodeURIComponent(song.title || '')}`
    )
    return d.ok && d.lines ? d : null
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
