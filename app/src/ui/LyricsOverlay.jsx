import { usePlayer } from '../state/PlayerContext'
import { formatDuration, thumbFor } from '../lib/format'
import useDominantColor from '../hooks/useDominantColor'
import SyncedLyrics from './SyncedLyrics'
import { IconChevronDown, IconMusic, IconPause, IconPlay } from './icons'

export default function LyricsOverlay() {
  const { state, tick, actions, currentSong, getPlaybackPosition, seekMs } = usePlayer()
  const ly = state.lyrics
  const song = ly ? ly.song : currentSong()
  const color = useDominantColor(song && song.thumb ? thumbFor(song.thumb, 512) : null)
  const cur = currentSong()

  const lines = ly && !ly.busy ? ly.lines : []
  const timed = !!ly && !!ly.lines.length && !ly.busy && ly.timed && cur && cur.ytmId === ly.songId

  const dur = tick.duration > 0 ? tick.duration : (song && song.duration) || 0
  const pct = dur > 0 ? Math.min(100, (tick.current / dur) * 100) : 0
  const bg = color
    ? `linear-gradient(180deg, rgba(${color},0.92) 0%, rgba(${color},0.5) 34%, #191e1c 62%, #090909 100%)`
    : `linear-gradient(180deg, #2c3a37 0%, #242b29 40%, #161a19 70%, #090909 100%)`

  return (
    <div className="lyrics-overlay" style={{ background: bg }}>
      <header className="ly-head">
        <button className="icon-btn" onClick={actions.closeLyrics} aria-label="Cerrar letras">
          <IconChevronDown width={22} height={22} />
        </button>
        <span className="ly-headtitle">
          <span className="ly-eyebrow">LETRAS</span>
          <span className="ly-song" title={song && song.title}>{song ? song.title : ''}</span>
        </span>
        <button className="icon-btn" onClick={actions.controls.togglePlay} aria-label={state.playing ? 'Pausar' : 'Reproducir'}>
          {state.playing ? <IconPause width={20} height={20} /> : <IconPlay width={20} height={20} />}
        </button>
      </header>

      <div className="ly-body">
        {ly && ly.busy ? (
          <div className="ly-loading"><span className="ly-spin" /></div>
        ) : lines.length ? (
          <SyncedLyrics lines={lines} timed={timed} getPosition={getPlaybackPosition} onLineClick={seekMs} />
        ) : (
          <div className="ly-empty">
            <IconMusic width={40} height={40} />
            <p>{ly && ly.plain ? ly.plain : 'No hay letras para esta canción.'}</p>
          </div>
        )}
      </div>

      <div className="ly-bar"><div className="ly-barfill" style={{ width: `${pct}%` }} /></div>
      <div className="ly-times">
        <span>{formatDuration(tick.current)}</span>
        <span>−{formatDuration(Math.max(0, dur - tick.current))}</span>
      </div>
    </div>
  )
}