import { usePlayer } from '../../state/PlayerContext'
import { COUNTRIES, countryInfo } from '../../lib/constants'
import { IconGlobe, IconHeartFill, IconShuffle } from '../icons'
import TrackTable from './TrackTable'

export default function DesktopLibrary() {
  const { state, actions, favs } = usePlayer()
  const cc = countryInfo(state.cc)

  return (
    <div className="d-library">
      <h1 className="d-h1">Tu biblioteca</h1>

      <section className="d-libsec">
        <div className="d-sec-head">
          <h2><IconHeartFill className="d-h3-icon" width={18} height={18} /> Canciones que te gustan</h2>
        </div>
        {favs.length ? (
          <TrackTable songs={favs} title="Tus favoritas" />
        ) : (
          <p className="d-lib-empty">
            Cuando guardes una canción (toca el corazón) aparecerá aquí.
          </p>
        )}
      </section>

      <section className="d-libsec">
        <div className="d-sec-head">
          <h2><IconGlobe className="d-h3-icon" width={18} height={18} /> Tops por país</h2>
        </div>
        <div className="d-countrygrid">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              className={`d-country ${state.cc === c.code ? 'active' : ''}`}
              onClick={() => {
                actions.loadCharts(c.code)
                actions.setTab('lista')
              }}
              title={c.name}
            >
              <span className="d-country-badge">{c.code.toUpperCase()}</span>
              <span>{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="d-ghost d-random-big" onClick={actions.randomList}>
        <IconShuffle width={18} height={18} /> Escuchar algo aleatorio
      </button>

      <p className="d-subfoot">{cc.name} · JoFi Music</p>
    </div>
  )
}