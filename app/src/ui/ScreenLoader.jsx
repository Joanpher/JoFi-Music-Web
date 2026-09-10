import { usePlayer } from '../state/PlayerContext'

export default function ScreenLoader() {
  const { state } = usePlayer()
  if (!state.busy) return null
  return (
    <div className="screen-loader" role="status" aria-live="polite">
      <div className="loader-disc"><span /></div>
      <p>{state.busy}</p>
    </div>
  )
}