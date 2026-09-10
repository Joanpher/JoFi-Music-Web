import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../state/PlayerContext'
import * as api from '../services/api'
import { thumbFor } from '../lib/format'
import { GENRES, countryInfo } from '../lib/constants'
import { IconBell, IconClock, IconGear, IconHeartFill, IconMoon, IconFlame, IconMusic, IconVinyl, IconZap } from './icons'
import GenreIcon from './GenreIcon'

const QUICK = [
  { label: 'Favoritos', Icon: IconHeartFill, fav: true, action: 'favs' },
  { label: 'Dembow', Icon: IconZap, q: 'dembow' },
  { label: 'Perreo', Icon: IconFlame, q: 'perreo' },
  { label: 'Bachata', Icon: IconMusic, q: 'bachata' },
  { label: 'Lofi', Icon: IconMoon, q: 'lofi' },
  { label: 'Salsa', Icon: IconVinyl, q: 'salsa' }
]

const SECTIONS = [
  { id: 'parati', title: 'Para ti hoy', fn: (cc, api_) => api_.getCharts(cc).then((d) => (d.songs || []).map(api_.toSong)) },
  { id: 'dembow', title: 'Lo que suena', fn: (_cc, api_) => api_.searchSongs('dembow').then((d) => (d.songs || []).map(api_.toSong)) },
  { id: 'perreo', title: 'Bailables', fn: (_cc, api_) => api_.searchSongs('perreo').then((d) => (d.songs || []).map(api_.toSong)) },
  { id: 'lofi', title: 'Para relajarte', fn: (_cc, api_) => api_.searchSongs('lofi').then((d) => (d.songs || []).map(api_.toSong)) },
  { id: 'bachata', title: 'Románticas', fn: (_cc, api_) => api_.searchSongs('bachata').then((d) => (d.songs || []).map(api_.toSong)) }
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function RailCard({ songs, index, playing, song, onPlay }) {
  return (
    <button className="rail-card" onClick={() => onPlay(index)} aria-label={`Reproducir ${song.title}`}>
      <span className={`rail-art ${playing ? 'playing' : ''}`}>
        {song.thumb ? (
          <img src={thumbFor(song.thumb, 150)} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="rail-empty"><IconMusic width={40} height={40} /></span>
        )}
        {playing && <span className="rail-eq"><i /><i /><i /></span>}
      </span>
      <span className="rail-name" title={song.title}>{song.title}</span>
      <span className="rail-sub" title={song.artist}>{song.artist}</span>
    </button>
  )
}

export default function HomeScreen() {
  const { state, actions, currentSong } = usePlayer()
  const [sections, setSections] = useState(() =>
    SECTIONS.map((s) => ({ id: s.id, title: s.title, songs: null }))
  )
  const cacheRef = useRef(new Map())

  const doSearch = (q) => actions.searchList(q, { tab: 'buscar' })

  const runGrid = (item) => {
    if (item.action === 'favs') actions.openFavorites()
    else if (item.q) doSearch(item.q)
  }

  useEffect(() => {
    let alive = true
    SECTIONS.forEach((s) => {
      const key = `${s.id}:${s.id === 'parati' ? state.cc : 'x'}`
      if (cacheRef.current.has(key)) {
        if (alive) {
          setSections((prev) => prev.map((p) => (p.id === s.id ? { ...p, songs: cacheRef.current.get(key) } : p)))
        }
        return
      }
      s.fn(state.cc, api)
        .then((songs) => {
          cacheRef.current.set(key, songs)
          if (alive) {
            setSections((prev) => prev.map((p) => (p.id === s.id ? { ...p, songs } : p)))
          }
        })
        .catch(() => {
          if (alive) setSections((prev) => prev.map((p) => (p.id === s.id ? { ...p, songs: [] } : p)))
        })
    })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.cc])

  const openSettings = () => {
    actions.showDialog('Ajustes', [
      `Aleatorio: ${state.shuffle ? 'ON' : 'OFF'}`,
      `Repetir: ${state.repeat === 'off' ? 'sin repetición' : state.repeat === 'all' ? 'repite la lista' : 'repite una'}`,
      `Volumen: ${state.muted ? 'silenciado' : state.volume + '%'}`,
      'PlayTube - música completa v2'
    ].join('\n'), [{ label: 'Cerrar' }])
  }

  const allLoaded = sections.some((s) => s.songs !== null)
  const cur = currentSong()
  const curId = cur ? cur.ytmId : null
  const cc = countryInfo(state.cc)

  return (
    <div className="screen home">
      <div className="home-topbg" />

      <header className="home-head">
        <div className="hh-text">
          <h1>{greeting()}</h1>
          <span><span className="cc-badge">{state.cc.toUpperCase()}</span>{cc.name}</span>
        </div>
        <div className="hh-actions">
          <button className="hh-btn" onClick={actions.randomList} aria-label="Sorpresa del día" title="Sorpresa del día">
            <IconBell width={18} height={18} />
          </button>
          <button className="hh-btn" onClick={actions.openFavorites} aria-label="Tus favoritas" title="Tus favoritas">
            <IconClock width={18} height={18} />
          </button>
          <button className="hh-btn" onClick={openSettings} aria-label="Ajustes" title="Ajustes">
            <IconGear width={18} height={18} />
          </button>
        </div>
      </header>

      <section className="quickgrid" aria-label="Accesos rápidos">
        {QUICK.map((q) => {
          const I = q.Icon
          return (
            <button key={q.label} className="qg-card" onClick={() => runGrid(q)}>
              <span className={`qg-img ${q.fav ? 'fav' : ''}`}><I width={22} height={22} /></span>
              <span className="qg-label">{q.label}</span>
            </button>
          )
        })}
      </section>

      {!allLoaded && (
        <div className="home-loading" aria-hidden="true">
          <div className="rail-skel" />
          <div className="rail-skel" />
        </div>
      )}

      {sections.map((sec) => {
        if (!sec.songs) return null
        const playingHere = state.queue === sec.songs
        return (
          <section key={sec.id} className="hsec" aria-label={sec.title}>
            <h3>{sec.title}</h3>
            <div className="rail">
              {sec.songs.slice(0, 12).map((song, i) => (
                <RailCard
                  key={song.ytmId || `${sec.id}-${i}`}
                  songs={sec.songs}
                  index={i}
                  song={song}
                  playing={playingHere && state.current === i && !!curId}
                  onPlay={(idx) => actions.playSongs(sec.songs, idx, sec.title)}
                />
              ))}
            </div>
          </section>
        )
      })}

      <div className="hsec genres">
        <h3>Explora por género</h3>
        <div className="gen-grid">
          {GENRES.map((g) => (
            <button key={g} className="gen-chip" onClick={() => doSearch(g)}>
              <GenreIcon g={g} width={16} height={16} />
              <span>{g}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}