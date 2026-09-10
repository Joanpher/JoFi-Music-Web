import { usePlayer } from '../state/PlayerContext'

export default function Toasts() {
  const { toasts } = usePlayer()
  if (!toasts.length) return null
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.error ? 'err' : ''}`} role="status">
          {t.msg}
        </div>
      ))}
    </div>
  )
}