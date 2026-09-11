import { usePlayer } from '../../state/PlayerContext'
import { thumbFor } from '../../lib/format'
import useDominantColor from '../../hooks/useDominantColor'
import SyncedLyrics from '../SyncedLyrics'
import { IconClose, IconMusic } from '../icons'

export default function DesktopLyrics() {
  const { state, actions, currentSong, getPlaybackPosition, seekMs } = usePlayer()
  const ly = state.lyrics
  const song = ly ? ly.song : currentSong()
  const cur = currentSong()
  const lines = ly && !ly.busy ? ly.lines : []
  const timed = !!ly && !!ly.lines.length && !ly.busy && ly.timed && cur && cur.ytmId === ly.songId

  const color = useDominantColor(song && song.thumb ? thumbFor(song.thumb, 512) : null)
  const bg = color
    ? `linear-gradient(165deg, rgba(${color},0.5) 0%, rgba(${color},0.18) 40%, transparent 100%)`
    : ''

  return (
    <div className="d-lyrics" style={{ backgroundImage: bg }}>
      <div className="d-lyrics-head">
        <div className="d-lyrics-meta">
          <span className="d-lyrics-eyebrow">LETRAS</span>
          <h1 className="d-lyrics-title" title={song && song.title}>{song ? song.title : ''}</h1>
          <p className="d-lyrics-artist">{song ? song.artist : ''}</p>
        </div>
        <button className="d-icon-btn lg" onClick={actions.closeLyrics} aria-label="Cerrar letras">
          <IconClose width={20} height={20} />
        </button>
      </div>

      <div className="d-lyrics-body">
        {ly && ly.busy ? (
          <div className="ly-loading"><span className="ly-spin" /></div>
        ) : lines.length ? (
          <SyncedLyrics lines={lines} timed={timed} getPosition={getPlaybackPosition} onLineClick={seekMs} />
        ) : (
          <div className="ly-empty">
            <IconMusic width={48} height={48} />
            <p>{ly && ly.plain ? ly.plain : 'No hay letras para esta canción.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}