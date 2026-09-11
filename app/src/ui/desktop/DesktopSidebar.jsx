import { useState } from 'react'
import { usePlayer } from '../../state/PlayerContext'
import { SECTIONS, fetchSection, gradFor } from './data'
import { IconHeartFill, IconHome, IconLibrary, IconPlus, IconSearch, IconMaximize } from '../icons'
import TurtleLogo from './TurtleLogo'

const FILTERS = ['Playlists', 'Artistas', 'Álbumes']

export default function DesktopSidebar() {
  const { state, actions, favs } = usePlayer()
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('Playlists')
  const [q, setQ] = useState('')

  const go = (tab) => actions.setTab(tab)

  const openSection = async (sec) => {
    if (busyId) return
    setBusyId(sec.id)
    try {
      const songs = await fetchSection(sec, state.cc)
      if (songs.length) {
        actions.playSongs(songs, 0, sec.title)
        actions.setTab('lista')
      } else {
        actions.toast('Esa lista salió vacía', { error: true })
      }
    } catch {
      actions.toast('No se pudo cargar la lista', { error: true })
    } finally {
      setBusyId(null)
    }
  }

  const openFavs = () => {
    if (!favs.length) {
      actions.toast('Aún no tienes canciones guardadas', { error: true })
      return
    }
    actions.openFavorites()
    actions.setTab('lista')
  }

  const sidebarList = [
    favs.length ? { key: 'favs', title: 'Canciones que te gustan', sub: `Playlist • ${favs.length} canciones`, onOpen: openFavs } : null,
    ...SECTIONS.map((s) => ({
      key: s.id,
      title: s.title,
      sub: 'Playlist • JoFi Music',
      onOpen: () => openSection(s),
      busy: busyId === s.id
    }))
  ].filter(Boolean)

  const filtered = sidebarList.filter((it) =>
    filter === 'Todos' ? true : filter === 'Playlists' ? true : true
  )
  const visible = filtered.filter((it) =>
    !q || it.title.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <aside className="d-sidebar" aria-label="Barra lateral">
      <div className="d-navcard">
        <div className="d-logo">
          <TurtleLogo size={32} />
          <span className="d-logo-text">JoFi Music</span>
        </div>
        <button className={`d-nav ${state.tab === 'inicio' ? 'active' : ''}`} onClick={() => go('inicio')}>
          <IconHome width={24} height={24} />
          <span>Inicio</span>
        </button>
        <button className={`d-nav ${state.tab === 'buscar' ? 'active' : ''}`} onClick={() => go('buscar')}>
          <IconSearch width={24} height={24} />
          <span>Buscar</span>
        </button>
      </div>

      <div className="d-navcard d-libcard">
        <div className="d-libcard-inner">
          <div className="d-lib-head">
            <button className="d-lib-home" onClick={() => go('biblioteca')} aria-label="Tu biblioteca">
              <IconLibrary width={24} height={24} />
              <span>Tu biblioteca</span>
            </button>
            <div className="d-lib-headbtns">
              <button className="d-icon-btn" aria-label="Nueva playlist" onClick={() => actions.toast('Playlist nueva (demo)')}>
                <IconPlus width={16} height={16} />
              </button>
              <button className="d-icon-btn" aria-label="Expandir" onClick={() => actions.toast('Expander (demo)')}>
                <IconMaximize width={16} height={16} />
              </button>
            </div>
          </div>

          <div className="d-lib-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`d-chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="d-lib-search">
            <IconSearch width={18} height={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en tu biblioteca"
              aria-label="Buscar en tu biblioteca"
            />
            <span className="d-lib-recent">Recientes</span>
          </div>

          <div className="d-lib-list">
            {visible.map((it) => (
              <button key={it.key} className="d-lib-item" onClick={it.onOpen} title={it.title}>
                <span className="d-lib-art" style={{ background: it.key === 'favs' ? 'linear-gradient(135deg,#5fe9c1,#0d5c73)' : gradFor(it.title) }}>
                  {it.key === 'favs' ? <IconHeartFill width={20} height={20} /> : <IconMusicThumb />}
                </span>
                <span className="d-lib-meta">
                  <span className="d-lib-name">{it.title}</span>
                  <span className="d-lib-sub">{it.busy ? 'Cargando…' : it.sub}</span>
                </span>
              </button>
            ))}
            {!visible.length && <p className="d-lib-empty">No hay listas que coincidan</p>}
          </div>
        </div>
      </div>
    </aside>
  )
}

function IconMusicThumb() {
  return (
    <span className="d-lib-note" aria-hidden="true">♪</span>
  )
}