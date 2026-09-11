import { usePlayer } from '../../state/PlayerContext'
import { IconDownload } from '../icons'

export default function DesktopHeader({ scrolled }) {
  const { actions } = usePlayer()

  return (
    <header className={`d-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="d-header-right">
        <button className="d-pill-icon" aria-label="Instalar app" onClick={() => actions.toast('Instala la app desde el navegador (demo)')}>
          <IconDownload width={18} height={18} />
        </button>
      </div>
    </header>
  )
}
