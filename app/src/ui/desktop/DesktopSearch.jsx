import { useState } from 'react'
import { usePlayer } from '../../state/PlayerContext'
import { countryInfo } from '../../lib/constants'
import { IconSearch, IconShuffle, IconTrophy } from '../icons'
import GenreIcon from '../GenreIcon'
import TrackTable from './TrackTable'

export default function DesktopSearch() {
  const { state, actions } = usePlayer()
  const [q, setQ] = useState('')

  const submit = () => {
    const v = q.trim()
    if (v) actions.searchList(v, { tab: 'buscar' })
  }

  return (
    <div className="d-search">
      <div className="d-searchbar">
        <IconSearch width={19} height={19} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="¿Qué quieres escuchar?"
          type="search"
          aria-label="Buscar"
        />
        <button className="d-search-go" onClick={submit} disabled={!q.trim()}>Buscar</button>
      </div>

      <h2 className="d-subh">Explora por género</h2>
      <div className="d-gengrid">
        {['dembow', 'reggaeton', 'bachata', 'merengue', 'perreo', 'trap latino', 'salsa', 'lofi', 'jazz', 'rock', 'hip hop', 'classical'].map((g) => (
          <button key={g} className="d-chip lg" onClick={() => actions.searchList(g, { tab: 'buscar' })}>
            <GenreIcon g={g} width={18} height={18} />
            <span>{g}</span>
          </button>
        ))}
        <button className="d-chip lg trophy" onClick={() => actions.loadCharts(state.cc)}>
          <IconTrophy width={18} height={18} />
          <span>Top {countryInfo(state.cc).name}</span>
        </button>
      </div>

      <div className="d-list-head">
        <h2>{state.listTitle || 'Resultados'}</h2>
        <span className="d-count">{state.queue.length} canciones</span>
        <button className="d-random" onClick={actions.randomList}>
          <IconShuffle width={16} height={16} /> Aleatorio
        </button>
      </div>

      <TrackTable songs={state.queue} />

      {!state.queue.length && (
        <div className="d-empty">
          <span className="d-empty-icon"><IconSearch width={40} height={40} /></span>
          <p>Busca canciones, artistas o géneros para comenzar.</p>
        </div>
      )}
    </div>
  )
}