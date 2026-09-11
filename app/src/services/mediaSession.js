/* MediaSession → notificación del sistema:
   mantiene la música sonando con la pantalla bloqueada / app en segundo plano,
   muestra controles (pausar, ±10s, anterior, siguiente) y el progreso real.

   controls = { onPlay, onPause, onNext, onPrev, seekBy, seekTo }
   */

let supported = typeof navigator !== 'undefined' && 'mediaSession' in navigator

function guard(fn) {
  try {
    fn()
  } catch {
    /* acción no soportada en este navegador */
  }
}

export function initMediaSession(controls) {
  if (!supported) return () => {}

  const ms = navigator.mediaSession
  const handlers = {
    play: controls.onPlay,
    pause: controls.onPause,
    nexttrack: controls.onNext,
    previoustrack: controls.onPrev,
    seekbackward: (d) => controls.seekBy(-10, d && d.seekOffset),
    seekforward: (d) => controls.seekBy(10, d && d.seekOffset),
    seekto: (d) => {
      if (d && typeof d.seekTime === 'number') controls.seekTo(d.seekTime)
    }
  }

  for (const [action, fn] of Object.entries(handlers)) {
    guard(() => ms.setActionHandler(action, () => fn?.()))
  }

  return () => {
    for (const action of Object.keys(handlers)) {
      guard(() => ms.setActionHandler(action, null))
    }
  }
}

export function updateMediaSession(song, duration, playing, position = 0) {
  if (!supported) return
  const ms = navigator.mediaSession
  ms.playbackState = playing ? 'playing' : 'paused'

  if (song) {
    guard(() => {
      ms.metadata = new MediaMetadata({
        title: song.title || 'PlayTube',
        artist: song.artist || '',
        album: song.album || 'PlayTube',
        artwork: song.thumb ? [{ src: song.thumb, sizes: '512x512' }] : []
      })
    })
  }

  const d = Number(duration) || 0
  const p = Math.max(0, Number(position) || 0)
  if (d > 0 && Number.isFinite(d)) {
    guard(() => ms.setPositionState({ duration: d, playbackRate: 1.0, position: Math.min(p, d) }))
  }
}

export function updatePosition(position) {
  if (!supported || !navigator.mediaSession.setPositionState) return
  const d = Number(position && position.duration) || 0
  const p = Math.max(0, Number(position && position.current) || 0)
  if (d <= 0) return
  guard(() => navigator.mediaSession.setPositionState({ duration: d, playbackRate: 1.0, position: Math.min(p, d) }))
}

export function clearMediaSession() {
  if (!supported) return
  guard(() => {
    navigator.mediaSession.metadata = null
  })
}