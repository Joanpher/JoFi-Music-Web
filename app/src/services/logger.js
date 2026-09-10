/* Sistema de logs en capas:
   - dev: consola del navegador
   - prod: silencioso (nada queda expuesto) y los errores se envían a /api/log
     del servidor (aparecen en logs/error.log del backend). */

const isDev = import.meta.env.DEV

function sendToServer(level, msg, meta) {
  try {
    const payload = {
      level,
      msg: String(msg).slice(0, 2000),
      meta: meta || {},
      url: location.href,
      ua: navigator.userAgent,
      at: new Date().toISOString()
    }
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {})
  } catch {
    /* sin red → se descarta */
  }
}

export const logger = {
  info(msg) {
    if (isDev) console.info('[PlayTube]', msg)
  },
  warn(msg) {
    if (isDev) {
      console.warn('[PlayTube]', msg)
    } else {
      sendToServer('warn', msg)
    }
  },
  error(msg, meta) {
    if (isDev) {
      console.error('[PlayTube]', msg, meta || '')
    } else {
      sendToServer('error', msg, meta)
    }
    return false
  }
}

if (isDev) {
  window.addEventListener('error', (e) => {
    logger.error(e.message, { file: e.filename, line: e.lineno, col: e.colno })
  })
  window.addEventListener('unhandledrejection', (e) => {
    logger.error(String(e.reason && e.reason.stack ? e.reason.stack : e.reason))
  })
}