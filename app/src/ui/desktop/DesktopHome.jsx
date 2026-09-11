import { useEffect, useState } from 'react'
import { usePlayer } from '../../state/PlayerContext'
import { QUICK, SECTIONS } from './data'
import * as api from '../../services/api'
import { countryInfo, GENRES } from '../../lib/constants'
import { artworkFallback, thumbFor } from '../../lib/format'
import GenreIcon from '../GenreIcon'
import { IconMusic, IconPlay } from '../icons'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function Card({ song, index, playing, onPlay }) {
  return (
    <button className={`d-card ${playing ? 'playing' : ''}`} onClick={() => onPlay(index)}>
      <span className="d-card-art">
        {song.thumb ? (
          <img src={thumbFor(song.thumb, 300)} alt="" loading="lazy" decoding="async" onError={artworkFallback} />
        ) : (
          <span className="d-card-empty"><IconMusic width={34} height={34} /></span>
        )}
        <span className="d-card-play"><IconPlay width={20} height={20} /></span>
      </span>
      <span className="d-card-name" title={song.title}>{song.title}</span>
      <span className="d-card-sub" title={song.artist}>{song.artist}</span>
    </button>
  )
}

export default function DesktopHome() {
  const { state, actions, currentSong } = usePlayer()
  const [sections, setSections] = useState(() =>
    SECTIONS.map((s) => ({ ...s, songs: null }))
  )

  useEffect(() => {
    let alive = true
    SECTIONS.forEach((sec) => {
      sec.fn(state.cc, api)
        .then((songs) => {
          if (alive) setSections((prev) => prev.map((p) => (p.id === sec.id ? { ...p, songs } : p)))
        })
        .catch(() => {
          if (alive) setSections((prev) => prev.map((p) => (p.id === sec.id ? { ...p, songs: [] } : p)))
        })
    })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.cc])

  const cur = currentSong()
  const curId = cur ? cur.ytmId : null

  const runGrid = (item) => {
    if (item.action === 'favs') {
      if (!state.favs.length) {
        actions.toast('Aún no tienes canciones guardadas', { error: true })
        return
      }
      actions.openFavorites()
      actions.setTab('lista')
    } else if (item.q) {
      actions.searchList(item.q, { tab: 'lista' })
    }
  }

  const playSection = (sec, idx) => {
    actions.playSongs(sec.songs, idx, sec.title)
  }

  return (
    <div className="d-home">
      <h1 className="d-h1">
        {greeting()}
        <span className="d-h1-sub">{countryInfo(state.cc).name}</span>
      </h1>

      <div className="d-quickgrid" aria-label="Accesos rápidos">
        {QUICK.map((q, i) => {
          const I = q.Icon
          return (
            <button key={q.label} className="d-qg" onClick={() => runGrid(q)}>
              <span className={`d-qg-img g${i}`}>{q.fav ? <I width={20} height={20} /> : <I width={22} height={22} />}</span>
              <span className="d-qg-label">{q.label}</span>
              <span className={`d-qg-play ${q.fav ? 'fav' : ''}`}><IconPlay width={16} height={16} /></span>
            </button>
          )
        })}
      </div>

      {sections.map((sec) => {
        if (!sec.songs) return null
        const playingHere = state.queue === sec.songs
        return (
          <section key={sec.id} className="d-sec" aria-label={sec.title}>
            <div className="d-sec-head">
              <h2>{sec.title}</h2>
              <button className="d-showall" onClick={() => sec.songs.length && actions.playSongs(sec.songs, 0, sec.title)}>
                Ver todo
              </button>
            </div>
            <div className="d-cardgrid">
              {sec.songs.slice(0, 10).map((song, i) => (
                <Card
                  key={song.ytmId || `${sec.id}-${i}`}
                  song={song}
                  index={i}
                  playing={playingHere && state.current === i && !!curId}
                  onPlay={(idx) => playSection(sec, idx)}
                />
              ))}
            </div>
          </section>
        )
      })}

      <section className="d-sec" aria-label="Explora por género">
        <div className="d-sec-head">
          <h2>Explora por género</h2>
        </div>
        <div className="d-genres">
          {GENRES.map((g) => (
            <button key={g} className="d-gen" onClick={() => actions.searchList(g, { tab: 'lista' })}>
              <GenreIcon g={g} width={16} height={16} />
              <span>{g}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
