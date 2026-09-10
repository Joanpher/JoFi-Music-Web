export const LYRICS_API = 'https://api.lyrics.ovh/v1'

export const COUNTRIES = [
  { code: 'do', name: 'República Dominicana' },
  { code: 'us', name: 'EE. UU.' },
  { code: 'mx', name: 'México' },
  { code: 'es', name: 'España' },
  { code: 'co', name: 'Colombia' },
  { code: 'pr', name: 'Puerto Rico' },
  { code: 'ar', name: 'Argentina' },
  { code: 've', name: 'Venezuela' },
  { code: 'pe', name: 'Perú' },
]

export const GENRES = [
  'dembow', 'reggaeton', 'bachata', 'merengue', 'perreo',
  'trap latino', 'salsa', 'cumbia', 'lofi', 'electronic',
  'rock', 'classical', 'hip hop', 'jazz'
]

export const RANDOM_POOL = [
  'dembow', 'reggaeton', 'bachata', 'merengue', 'perreo',
  'trap latino', 'salsa', 'cumbia', 'vallenato', 'urbano',
  'lofi', 'chill', 'jazz', 'electronic', 'rock', 'classical',
  'reggae', 'hip hop', 'pop'
]

export function countryInfo(code) {
  return COUNTRIES.find((c) => c.code === code) || { code, name: code.toUpperCase() }
}