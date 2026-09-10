import { usePlayer } from '../state/PlayerContext'
import { IconHome, IconLibrary, IconSearch } from './icons'

const TABS = [
  { id: 'inicio', label: 'Inicio', Icon: IconHome },
  { id: 'buscar', label: 'Buscar', Icon: IconSearch },
  { id: 'biblioteca', label: 'Tu biblioteca', Icon: IconLibrary }
]

export default function BottomNav() {
  const { state, actions } = usePlayer()
  return (
    <nav className="bottomnav" aria-label="Navegación principal">
      {TABS.map(({ id, label, Icon }) => {
        const active = state.tab === id
        return (
          <button
            key={id}
            className={`bn-item ${active ? 'active' : ''}`}
            onClick={() => actions.setTab(id)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon width={24} height={24} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}