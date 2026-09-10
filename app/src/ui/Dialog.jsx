import { usePlayer } from '../state/PlayerContext'

export default function Dialog() {
  const { dialog, closeDialog } = usePlayer()
  if (!dialog) return null
  return (
    <div
      className={`overlay ${dialog.lyrics ? 'lyrics' : ''}`}
      onClick={closeDialog}
    >
      <div className="dlg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3 className="dlg-title">{dialog.title}</h3>
        {dialog.lyrics ? (
          <pre className="dlg-lyrics">{dialog.message}</pre>
        ) : (
          <p className="dlg-msg">{dialog.message}</p>
        )}
        <div className="dlg-actions">
          {dialog.actions.map((a, i) => (
            <button
              key={i}
              className={`dlg-btn ${a.primary ? 'primary' : ''}`}
              onClick={() => {
                if (a.onClick) a.onClick()
                closeDialog()
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}