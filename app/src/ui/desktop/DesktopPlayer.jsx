import { useState } from 'react'
import { usePlayer } from '../../state/PlayerContext'
import { formatDuration, thumbFor } from '../../lib/format'
import {
  IconClose, IconDevice, IconHeart, IconHeartFill, IconMic,
  IconMute, IconMusic, IconNext, IconPause, IconPlay, IconPrev, IconQueue,
  IconRepeat, IconShuffle, IconVolume
} from '../icons'

export default function DesktopPlayer() {
  const { state, tick, actions, currentSong, isLiked, toggleLike } = usePlayer()
  const song = currentSong()
  const c = actions.controls
  const [expanded, setExpanded] = useState(false)
  const [volDrag, setVolDrag] = useState(false)

  const dur = tick.duration > 0 ? tick.duration : (song && song.duration) || 0
  const pct = dur > 0 ? Math.min(100, (tick.current / dur) * 100) : 0
  const liked = song ? isLiked(song) : false

  const like = () => {
    if (!song) return
    const added = toggleLike(song)
    actions.toast(added ? 'Guardada en favoritas' : 'Eliminada de favoritas')
  }

  if (!song) return null

  return (
    <>
      <footer className="d-player">
        {/* izquierda: canción actual */}
        <div className="d-now">
          <button className="d-now-art" onClick={() => setExpanded(true)} aria-label="Abrir vista ampliada">
            {song.thumb ? (
              <img src={thumbFor(song.thumb, 256)} alt="" />
            ) : (
              <span className="d-now-art-empty"><IconMusic width={20} height={20} /></span>
            )}
          </button>
          <div className="d-now-meta">
            <span className="d-now-title" title={song.title}>{song.title}</span>
            <span className="d-now-artist" title={song.artist}>{song.artist}</span>
          </div>
          <button className={`d-now-like ${liked ? 'liked' : ''}`} onClick={like} aria-label="Me gusta">
            {liked ? <IconHeartFill width={18} height={18} /> : <IconHeart width={18} height={18} />}
          </button>
        </div>

        {/* centro: controles + progreso */}
        <div className="d-center">
          <div className="d-ctlrow">
            <button className={`d-ctl ${state.shuffle ? 'on' : ''}`} onClick={c.toggleShuffle} aria-label="Aleatorio" title="Aleatorio">
              <IconShuffle width={18} height={18} />
            </button>
            <button className="d-ctl nav" onClick={c.prev} aria-label="Anterior" title="Anterior">
              <IconPrev width={22} height={22} />
            </button>
            <button className="d-play-circle" onClick={c.togglePlay} aria-label={state.playing ? 'Pausar' : 'Reproducir'}>
              {state.playing ? <IconPause width={16} height={16} /> : <IconPlay width={16} height={16} />}
            </button>
            <button className="d-ctl nav" onClick={c.next} aria-label="Siguiente" title="Siguiente">
              <IconNext width={22} height={22} />
            </button>
            <button className={`d-ctl ${state.repeat !== 'off' ? 'on' : ''}`} onClick={c.toggleRepeat} aria-label="Repetir" title="Repetir">
              <IconRepeat width={18} height={18} />
            </button>
          </div>
          <div className="d-progress">
            <span className="d-time">{formatDuration(tick.current)}</span>
            <input
              className="d-range d-seek"
              type="range"
              min={0}
              max={dur || 1}
              step={0.1}
              value={Math.min(tick.current, dur || 1)}
              style={{ '--p': `${pct}%` }}
              onChange={(e) => c.seekTo(Number(e.target.value))}
              aria-label="Progreso"
            />
            <span className="d-time">−{formatDuration(Math.max(0, dur - tick.current))}</span>
          </div>
        </div>

        {/* derecha: herramientas + volumen */}
        <div className="d-right">
          <button className="d-ctl icon" onClick={() => actions.openLyrics(song)} aria-label="Letras" title="Letras">
            <IconMic width={17} height={17} />
          </button>
          <button className="d-ctl icon" onClick={() => actions.toast('Cola (demo)')} aria-label="Cola" title="Cola">
            <IconQueue width={17} height={17} />
          </button>
          <button className="d-ctl icon" onClick={() => actions.toast('Este teléfono')} aria-label="Dispositivo" title="Dispositivo">
            <IconDevice width={17} height={17} />
          </button>
          <div className={`d-vol ${volDrag || state.muted ? 'active' : ''}`}>
            <button className="d-ctl icon" onClick={c.toggleMute} aria-label={state.muted ? 'Activar sonido' : 'Silenciar'}>
              {state.muted || state.volume === 0 ? <IconMute width={17} height={17} /> : <IconVolume width={17} height={17} />}
            </button>
            <input
              className="d-range d-volrange"
              type="range"
              min={0}
              max={100}
              step={1}
              value={state.muted ? 0 : state.volume}
              onFocus={() => setVolDrag(true)}
              onBlur={() => setVolDrag(false)}
              onMouseDown={() => setVolDrag(true)}
              onMouseUp={() => setVolDrag(false)}
              onTouchStart={() => setVolDrag(true)}
              onTouchEnd={() => setVolDrag(false)}
              onChange={(e) => c.setVolume(Number(e.target.value))}
              style={{ '--p': `${state.muted ? 0 : state.volume}%` }}
              aria-label="Volumen"
            />
          </div>
        </div>
      </footer>

      {expanded && <NowPlayingModal song={song} onClose={() => setExpanded(false)} />}
    </>
  )
}

function NowPlayingModal({ song, onClose }) {
  const { state, tick, actions, isLiked, toggleLike } = usePlayer()
  const c = actions.controls
  const dur = tick.duration > 0 ? tick.duration : song.duration || 0
  const pct = dur > 0 ? Math.min(100, (tick.current / dur) * 100) : 0
  const liked = isLiked(song)

  const like = () => {
    const added = toggleLike(song)
    actions.toast(added ? 'Guardada en favoritas' : 'Eliminada de favoritas')
  }

  const showQueue = () => {
    actions.showDialog(
      'En la cola',
      state.queue.length
        ? state.queue.map((s, i) => `${i + 1}. ${s.title} — ${s.artist}`).join('\n')
        : 'Cola vacía',
      [{ label: 'Cerrar' }]
    )
  }

  return (
    <div className="d-modal" onClick={onClose}>
      <div className="d-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="d-modal-close" onClick={onClose} aria-label="Cerrar">
          <IconClose width={20} height={20} />
        </button>

        <div className="d-modal-cover">
          {song.thumb ? (
            <img src={thumbFor(song.thumb, 640)} alt="" />
          ) : (
            <span className="d-modal-cover-empty"><IconMusic width={64} height={64} /></span>
          )}
        </div>

        <div className="d-modal-info">
          <span className="d-modal-type">REPRODUCIENDO DESDE {state.listTitle ? state.listTitle.toUpperCase() : 'PLAYLIST'}</span>
          <h2 className="d-modal-title" title={song.title}>{song.title}</h2>
          <p className="d-modal-artist" title={song.artist}>{song.artist}</p>

          <div className="d-modal-actions">
            <button className={`d-modal-like ${liked ? 'liked' : ''}`} onClick={like} aria-label="Me gusta">
              {liked ? <IconHeartFill width={20} height={20} /> : <IconHeart width={20} height={20} />}
            </button>
            <button className="d-modal-btn" onClick={() => actions.openLyrics(song)}>
              <IconMic width={17} height={17} /> Letras
            </button>
            <button className="d-modal-btn" onClick={showQueue}>
              <IconQueue width={17} height={17} /> Cola
            </button>
          </div>

          <div className="d-modal-progress">
            <div className="d-modal-bar"><div className="d-modal-fill" style={{ width: `${pct}%` }} /></div>
            <div className="d-modal-times">
              <span>{formatDuration(tick.current)}</span>
              <span>{formatDuration(dur)}</span>
            </div>
          </div>

          <div className="d-modal-ctlrow">
            <button className={`d-ctl ${state.shuffle ? 'on' : ''}`} onClick={c.toggleShuffle} aria-label="Aleatorio">
              <IconShuffle width={18} height={18} />
            </button>
            <button className="d-ctl nav" onClick={c.prev} aria-label="Anterior">
              <IconPrev width={24} height={24} />
            </button>
            <button className="d-modplay" onClick={c.togglePlay} aria-label={state.playing ? 'Pausar' : 'Reproducir'}>
              {state.playing ? <IconPause width={20} height={20} /> : <IconPlay width={20} height={20} />}
            </button>
            <button className="d-ctl nav" onClick={c.next} aria-label="Siguiente">
              <IconNext width={24} height={24} />
            </button>
            <button className={`d-ctl ${state.repeat !== 'off' ? 'on' : ''}`} onClick={c.toggleRepeat} aria-label="Repetir">
              <IconRepeat width={18} height={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}