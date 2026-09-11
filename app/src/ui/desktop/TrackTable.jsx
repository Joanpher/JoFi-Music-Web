import { usePlayer } from '../../state/PlayerContext'
import { formatDuration, thumbFor } from '../../lib/format'
import { IconMusic, IconPlay, IconHeart, IconHeartFill } from '../icons'

export default function TrackTable({ songs, title }) {
  const { state, actions, isLiked, toggleLike } = usePlayer()
  const isQueue = state.queue === songs

  if (!songs || !songs.length) {
    return (
      <div className="d-empty">
        <span className="d-empty-icon"><IconMusic width={40} height={40} /></span>
        <p>No hay canciones en esta lista.</p>
      </div>
    )
  }

  return (
    <div className="d-table" role="table" aria-label="Lista de canciones">
      <div className="d-table-head" role="row">
        <span className="d-th idx">#</span>
        <span className="d-th title">Título</span>
        <span className="d-th album">Álbum</span>
        <span className="d-th dur">Duración</span>
      </div>

      {songs.map((s, i) => {
        const active = isQueue && state.current === i
        const playing = active && state.playing
        const liked = isLiked(s)
        return (
          <div
            key={s.ytmId || i}
            className={`d-tr ${active ? 'active' : ''}`}
            role="row"
            onClick={() => !active && actions.playSongs(songs, i, title ?? state.listTitle)}
          >
            <span className="d-td idx">
              <span className="d-idx-num">{playing ? '♪' : active ? '−' : i + 1}</span>
              <span className="d-idx-play"><IconPlay width={15} height={15} /></span>
            </span>
            <span className="d-td title">
              {s.thumb ? (
                <img className="d-tr-art" src={thumbFor(s.thumb, 128)} alt="" loading="lazy" decoding="async" />
              ) : (
                <span className="d-tr-art d-tr-art-empty"><IconMusic width={18} height={18} /></span>
              )}
              <span className="d-tr-body">
                <span className="d-tr-title" title={s.title}>{s.title}</span>
                <span className="d-tr-artist" title={s.artist}>{s.artist}</span>
              </span>
            </span>
            <span className="d-td album">{s.album || '—'}</span>
            <span className="d-td dur">
              <button
                className={`d-row-like ${liked ? 'liked' : ''}`}
                aria-label={liked ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                onClick={(e) => {
                  e.stopPropagation()
                  const added = toggleLike(s)
                  actions.toast(added ? 'Guardada en favoritas' : 'Eliminada de favoritas')
                }}
              >
                {liked ? <IconHeartFill width={15} height={15} /> : <IconHeart width={15} height={15} />}
              </button>
              <span className="d-dur">{formatDuration(s.duration)}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}