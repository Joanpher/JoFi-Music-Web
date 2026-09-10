/* MediaSession → notificación del sistema:
   mantiene la música sonando con la pantalla bloqueada / app cerrada
   y muestra controles: pausar, ±10s, anterior y siguiente.

   controls = { onPlay, onPause, onNext, onPrev, seekBy }
   */

let supported = typeof navigator !== 'undefined' && 'mediaSession' in navigator

export function initMediaSession(controls) {
  if (!supported) return () => {}
  const ms = navigator.mediaSession

  const map = [
    ['play', controls.onPlay],
    ['pause', controls.onPause],
    ['nexttrack', controls.onNext],
    ['previoustrack', controls.onPrev]
  ]
  for (const [action, fn] of map) {
    try {
      ms.setActionHandler(action, () => fn?.())
    } catch {
      /* ignorado */
    }
  }
  try {
    ms.setActionHandler('seekbackward', (d) => controls.seekBy(-10, d && d.seekOffset))
    ms.setActionHandler('seekforward', (d) => controls.seekBy(10, d && d.seekOffset))
    ms.setActionHandler('seekto', (d) => {
      if (d && typeof d.seekTime === 'number') controls.seekTo(d.seekTime)
    })
  } catch {
    /* ignorado */
  }
  return () => {
    for (const [action] of map) {
      try {
        ms.setActionHandler(action, null)
      } catch {
        /* ignorado */
      }
    }
  }
}

export function updateMediaSession(song, duration, playing) {
  if (!supported) return
  const ms = navigator.mediaSession
  ms.playbackState = playing ? 'playing' : 'paused'
  try {
    ms.metadata = new MediaMetadata({
      title: song.title || 'PlayTube',
      artist: song.artist || '',
      album: song.album || 'PlayTube',
      artwork: song.thumb
        ? [
            { src: song.thumb, sizes: '512x512', type: 'image/jpeg' },
            { src: song.thumb, sizes: '256x256', type: 'image/jpeg' }
          ]
        : []
    })
  } catch {
    /* sin soporte de MediaMetadata */
  }
  if (duration > 0 && !Number.isNaN(duration)) {
    try {
      ms.setPositionState({
        duration,
        playbackRate: 1.0,
        position: 0
      })
    } catch {
      /* setPositionState no soportado */
    }
  }
}

export function updatePosition(position) {
  if (!supported || !navigator.mediaSession.setPositionState) return
  try {
    navigator.mediaSession.setPositionState({ duration: position.duration || 0, playbackRate: 1.0, position: position.current || 0 })
  } catch {
    /* ignorado */
  }
}

export function clearMediaSession() {
  if (!supported) return
  try {
    navigator.mediaSession.metadata = null
  } catch {
    /* ignorado */
  }
}