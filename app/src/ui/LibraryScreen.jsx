import { usePlayer } from '../state/PlayerContext'
import { COUNTRIES } from '../lib/constants'
import { formatDuration, thumbFor } from '../lib/format'
import { IconGlobe, IconHeartFill, IconMic, IconMusic, IconShuffle } from './icons'

function FavCard({ song, index }) {
  const { state, actions } = usePlayer()
  const active = state.current === index
  const playing = active && state.playing

  return (
    <div
      className={`card ${active ? 'active' : ''}`}
      onClick={() => (active ? actions.openPlayer() : actions.playIndex(index))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          actions.playIndex(index)
        }
      }}
    >
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

export default function LibraryScreen() {
  const { state, favs, actions } = usePlayer()

  return (
    <div className="screen library">
      <header className="sub-head">
        <h1>Tu biblioteca</h1>
      </header>

      <section className="lib-block">
        <h3><IconHeartFill className="h3-icon" width={17} height={17} />Canciones que te gustan</h3>
        {favs.length ? (
          <div className="card-list">
            {favs.map((s, i) => <FavCard key={s.ytmId || i} song={s} index={i} />)}
          </div>
        ) : (
          <p className="lib-empty">
            Cuando guardes una canción (toca el corazon) aparecerá aquí.
          </p>
        )}
      </section>

      <section className="lib-block">
        <h3><IconGlobe className="h3-icon" width={17} height={17} />Tops por país</h3>
        <div className="country-grid">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              className={`country-card ${state.cc === c.code ? 'active' : ''}`}
              onClick={() => {
                actions.loadCharts(c.code)
                actions.setTab('buscar')
              }}
              title={c.name}
            >
              <span className="country-badge">{c.code.toUpperCase()}</span>
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="btn ghost lib-random" onClick={actions.randomList}>
        <IconShuffle width={18} height={18} /> Escuchar algo aleatorio
      </button>
    </div>
  )
}