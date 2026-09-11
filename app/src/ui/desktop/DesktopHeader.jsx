import { usePlayer } from '../../state/PlayerContext'
import { IconArrowLeft, IconArrowRight, IconBell, IconDownload, IconUser } from '../icons'

export default function DesktopHeader({ scrolled }) {
  const { actions } = usePlayer()

  return (
    <header className={`d-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="d-header-left">
        <button className="d-round" aria-label="Atrás" onClick={() => actions.toast('Atrás (demo)')}>
          <IconArrowLeft width={18} height={18} />
        </button>
        <button className="d-round" aria-label="Adelante" onClick={() => actions.toast('Adelante (demo)')}>
          <IconArrowRight width={18} height={18} />
        </button>
      </div>

      <div className="d-header-right">
        <button className="d-pill" onClick={() => actions.toast('Premium pronto (demo)')}>
          Mejora a Premium
        </button>
        <button className="d-pill-icon" aria-label="Instalar app" onClick={() => actions.toast('Instala la app desde el navegador (demo)')}>
          <IconDownload width={18} height={18} />
        </button>
        <button className="d-pill-icon" aria-label="Notificaciones" onClick={() => actions.toast('Sin notificaciones nuevas')}>
          <IconBell width={18} height={18} />
        </button>
        <button className="d-profile" aria-label="Perfil" onClick={() => actions.toast('Perfil: JoFi Music')}>
          <IconUser width={20} height={20} />
        </button>
      </div>
    </header>
  )
}