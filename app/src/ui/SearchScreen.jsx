import { useState } from 'react'
import { usePlayer } from '../state/PlayerContext'
import { GENRES, countryInfo } from '../lib/constants'
import { formatDuration, thumbFor } from '../lib/format'
import { IconMic, IconMusic, IconSearch, IconShuffle, IconTrophy } from './icons'
import GenreIcon from './GenreIcon'

function SongCard({ song, index }) {
  const { state, actions } = usePlayer()
  const active = state.current === index
  const playing = active && state.playing

  const open = () => {
    if (active) actions.openPlayer()
    else actions.playIndex(index)
  }

  return (
    <div
      className={`card ${active ? 'active' : ''}`}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
    >
      <span className="card-idx">{playing ? '♪' : active ? '−' : index + 1}</span>
      <span className="card-art">
        {song.thumb ? (
          <img src={thumbFor(song.thumb, 256)} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="card-art-empty"><IconMusic width={22} height={22} /></span>
        )}
      </span>
      <span className="card-body">
        <span className="card-name" title={song.title}>{song.title}</span>
        <span className="card-artist" title={song.artist}>{song.artist}</span>
      </span>
      <span className="card-dur">{formatDuration(song.duration)}</span>
      <button
        className="card-lyrics"
        title="Ver letras"
        onClick={(e) => {
          e.stopPropagation()
          actions.openLyrics(song)
        }}
      >
        <IconMic width={15} height={15} />
      </button>
    </div>
  )
}

export default function SearchScreen() {
  const { state, actions } = usePlayer()
  const [q, setQ] = useState('')

  const submit = () => {
    const v = q.trim()
    if (v) actions.searchList(v)
  }

  return (
    <div className="screen search">
      <header className="sub-head">
        <h1>Buscar</h1>
      </header>

      <div className="search-row">
        <div className="search-box">
          <button className="icon-btn" onClick={submit} aria-label="Buscar">
            <IconSearch width={19} height={19} />
          </button>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Canciones, artistas, géneros…"
            type="search"
          />
        </div>
        <button className="btn ghost ghost-icon" onClick={actions.randomList} aria-label="Aleatorio">
          <IconShuffle width={18} height={18} />
        </button>
      </div>

      <div className="gen-grid big">
        {GENRES.map((g) => (
          <button key={g} className="gen-chip" onClick={() => actions.searchList(g)}>
            <GenreIcon g={g} width={18} height={18} />
            <span>{g}</span>
          </button>
        ))}
        <button className="gen-chip" onClick={() => actions.loadCharts(state.cc)}>
          <IconTrophy width={18} height={18} />
          <span>Top {countryInfo(state.cc).name}</span>
        </button>
      </div>

      <div className="list-head">
        <h2>{state.listTitle}</h2>
        <span className="count">{state.queue.length} canciones</span>
      </div>

      {state.queue.length ? (
        <div className="card-list">
          {state.queue.map((s, i) => <SongCard key={s.ytmId || i} song={s} index={i} />)}
        </div>
      ) : (
        <div className="empty">
          <span className="empty-icon"><IconMusic width={38} height={38} /></span>
          <p>Busca una canción, toca un género o un país para comenzar</p>
        </div>
      )}
    </div>
  )
}