import { usePlayer } from '../state/PlayerContext'
import { artworkFallback, thumbFor } from '../lib/format'
import { IconHeart, IconHeartFill, IconMusic, IconPause, IconPlay } from './icons'

export default function MiniPlayer() {
  const { state, tick, actions, currentSong, isLiked, toggleLike } = usePlayer()
  const song = currentSong()
  if (!song) return null

  const dur = tick.duration > 0 ? tick.duration : song.duration || 0
  const pct = dur > 0 ? Math.min(100, (tick.current / dur) * 100) : 0

  return (
    <div className="miniplayer" onClick={actions.openPlayer}>
      <button
        className="mp-open"
        onClick={(e) => { e.stopPropagation(); actions.openPlayer() }}
        aria-label="Abrir el reproductor"
      >
        {song.thumb ? (
          <img src={thumbFor(song.thumb, 144)} alt="" loading="lazy" decoding="async" onError={artworkFallback} />
        ) : (
          <span className="mp-empty"><IconMusic width={22} height={22} /></span>
        )}
        <span className="mp-info">
          <span className="mp-title">{song.title}</span>
          <span className="mp-artist">{song.artist}</span>
        </span>
      </button>

      <div className="mp-side">
        <button
          className={`icon-btn mp-like ${isLiked(song) ? 'liked' : ''}`}
          aria-label={isLiked(song) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onClick={(e) => {
            e.stopPropagation()
            const added = toggleLike(song)
            actions.toast(added ? 'Guardada en favoritas' : 'Eliminada de favoritas')
          }}
        >
          {isLiked(song) ? <IconHeartFill width={17} height={17} /> : <IconHeart width={17} height={17} />}
        </button>
        <button
          className="mp-play"
          aria-label={state.playing ? 'Pausar' : 'Reproducir'}
          onClick={(e) => { e.stopPropagation(); actions.controls.togglePlay() }}
        >
          {state.playing ? <IconPause width={16} height={16} /> : <IconPlay width={16} height={16} />}
        </button>
      </div>

      <span className="mp-progress" style={{ width: `${pct}%` }} />
    </div>
  )
}
