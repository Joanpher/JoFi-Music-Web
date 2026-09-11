import { usePlayer } from '../../state/PlayerContext'
import { formatDuration, thumbFor } from '../../lib/format'
import useDominantColor from '../../hooks/useDominantColor'
import TrackTable from './TrackTable'
import { IconHeart, IconHeartFill, IconMusic, IconPlay, IconDots } from '../icons'

export default function DesktopPlaylist() {
  const { state, actions, currentSong, isLiked, toggleLike } = usePlayer()
  const songs = state.queue
  const first = songs[0]
  const color = useDominantColor(first && first.thumb ? thumbFor(first.thumb, 512) : null)
  const cur = currentSong()
  const total = songs.reduce((a, s) => a + (s.duration || 0), 0)

  const gradient = color
    ? `linear-gradient(180deg, rgba(${color},0.85) 0%, rgba(${color},0.35) 40%, rgba(18,18,18,0) 100%)`
    : `linear-gradient(180deg, rgba(13,92,115,0.85) 0%, rgba(13,92,115,0.3) 45%, rgba(18,18,18,0) 100%)`

  const liked = cur ? isLiked(cur) : false

  const toggleCurLike = () => {
    if (!cur) return
    const added = toggleLike(cur)
    actions.toast(added ? 'Guardada en favoritas' : 'Eliminada de favoritas')
  }

  return (
    <div className="d-pl">
      <div className="d-pl-hero" style={{ background: gradient }}>
        <div className="d-pl-cover">
          {first && first.thumb ? (
            <img src={thumbFor(first.thumb, 512)} alt="" loading="lazy" decoding="async" />
          ) : (
            <span className="d-pl-cover-empty"><IconMusic width={56} height={56} /></span>
          )}
        </div>
        <div className="d-pl-meta">
          <span className="d-pl-type">PLAYLIST</span>
          <h1 className="d-pl-title" title={state.listTitle}>{state.listTitle || 'Tu lista'}</h1>
          <p className="d-pl-desc">
            {cur ? `Reproduciendo "${cur.title}" de ${cur.artist}.` : 'Lista creada con JoFi Music.'}
          </p>
          <p className="d-pl-owner">JoFi Music • {songs.length} canciones{songs.length ? `, ${formatDuration(total)}` : ''}</p>
        </div>
      </div>

      <div className="d-pl-actions">
        <button
          className={`d-playbig ${songs.length ? '' : 'dim'}`}
          aria-label="Reproducir"
          onClick={() => songs.length && actions.playSongs(songs, 0, state.listTitle)}
        >
          <IconPlay width={22} height={22} />
        </button>
        <button className={`d-icon-btn lg ${liked ? 'liked' : ''}`} aria-label="Me gusta" onClick={toggleCurLike}>
          {liked ? <IconHeartFill width={22} height={22} /> : <IconHeart width={22} height={22} />}
        </button>
        <button className="d-icon-btn lg" aria-label="Más opciones" onClick={() => actions.toast('Opciones (demo)')}>
          <IconDots width={22} height={22} />
        </button>
      </div>

      <TrackTable songs={songs} />
    </div>
  )
}