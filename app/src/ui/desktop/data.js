import * as api from '../../services/api'
import { IconFlame, IconHeartFill, IconMoon, IconMusic, IconVinyl, IconZap } from '../icons'

export const QUICK = [
  { label: 'Favoritos', Icon: IconHeartFill, fav: true, action: 'favs' },
  { label: 'Dembow', Icon: IconZap, q: 'dembow' },
  { label: 'Perreo', Icon: IconFlame, q: 'perreo' },
  { label: 'Bachata', Icon: IconMusic, q: 'bachata' },
  { label: 'Lofi', Icon: IconMoon, q: 'lofi' },
  { label: 'Salsa', Icon: IconVinyl, q: 'salsa' }
]

export const SECTIONS = [
  { id: 'parati', title: 'Para ti hoy', fn: (cc, api_) => api_.getCharts(cc).then((d) => (d.songs || []).map(api_.toSong)) },
  { id: 'dembow', title: 'Lo que suena', fn: (_cc, api_) => api_.searchSongs('dembow').then((d) => (d.songs || []).map(api_.toSong)) },
  { id: 'perreo', title: 'Bailables', fn: (_cc, api_) => api_.searchSongs('perreo').then((d) => (d.songs || []).map(api_.toSong)) },
  { id: 'lofi', title: 'Para relajarte', fn: (_cc, api_) => api_.searchSongs('lofi').then((d) => (d.songs || []).map(api_.toSong)) },
  { id: 'bachata', title: 'Románticas', fn: (_cc, api_) => api_.searchSongs('bachata').then((d) => (d.songs || []).map(api_.toSong)) }
]

const GRADS = [
  'linear-gradient(135deg,#14532d,#0d5c73)',
  'linear-gradient(135deg,#4a1d96,#6d28d9)',
  'linear-gradient(135deg,#9a3412,#b91c1c)',
  'linear-gradient(135deg,#0e7490,#155e75)',
  'linear-gradient(135deg,#7c2d12,#92400e)',
  'linear-gradient(135deg,#14532d,#374151)',
  'linear-gradient(135deg,#0f766e,#134e4a)',
  'linear-gradient(135deg,#6b21a8,#7e22ce)'
]

export const gradFor = (seed) => {
  const code = String(seed || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADS[code % GRADS.length]
}

export async function fetchSection(sec, cc) {
  const list = await sec.fn(cc, api)
  return list
}