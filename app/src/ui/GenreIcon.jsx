import { IconFlame, IconMic, IconMoon, IconMusic, IconVinyl, IconZap } from './icons'

const MAP = {
  dembow: IconZap,
  reggaeton: IconZap,
  'trap latino': IconZap,
  'hip hop': IconMic,
  perreo: IconFlame,
  rock: IconFlame,
  bachata: IconVinyl,
  merengue: IconVinyl,
  salsa: IconVinyl,
  cumbia: IconVinyl,
  lofi: IconMoon,
  chill: IconMoon,
  classical: IconMusic,
  jazz: IconMusic,
  electronic: IconZap,
  pop: IconZap
}

export default function GenreIcon({ g, ...p }) {
  const I = MAP[g] || IconMusic
  return <I {...p} />
}