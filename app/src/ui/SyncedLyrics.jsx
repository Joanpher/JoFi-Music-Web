import { useCallback, useEffect, useRef, useState } from 'react'

/* Motor de letras sincronizadas tipo karaoke.
   El reloj SIEMPRE es el audio real (getPosition → ms).
   rAF solo actualiza el índice activo cuando cambia; el relleno por
   palabra usa una CSS variable sobre el elemento activo (sin re-render). */

function findIndex(lines, ms) {
  let lo = 0, hi = lines.length - 1, ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (lines[mid].startTimeMs <= ms) { ans = mid; lo = mid + 1 }
    else hi = mid - 1
  }
  return ans
}

export default function SyncedLyrics({ lines, timed, getPosition, onLineClick }) {
  const viewportRef = useRef(null)
  const blockRef = useRef(null)
  const lineElsRef = useRef([])
  const topsRef = useRef([])
  const activeIdxRef = useRef(-1)
  const lastFollowIdxRef = useRef(-1)
  const followRef = useRef(true)
  const baseRef = useRef(0)
  const offsetRef = useRef(0)
  const ptrRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [follow, setFollow] = useState(true)

  const measure = useCallback(() => {
    const el = blockRef.current
    if (!el) return
    const tops = []
    for (const child of el.children) tops.push(child.offsetTop)
    topsRef.current = tops
  }, [])

  const paint = useCallback(() => {
    const el = blockRef.current
    if (!el) return
    el.style.transform = `translate3d(0, ${baseRef.current + offsetRef.current}px, 0)`
  }, [])

  const scrollToActive = useCallback((i) => {
    const vp = viewportRef.current
    const tops = topsRef.current
    if (!vp || tops[i] == null) return
    baseRef.current = -(tops[i] - vp.clientHeight * 0.4)
    offsetRef.current = 0
    paint()
    followRef.current = true
    setFollow(true)
  }, [paint])

  const resumeFollow = useCallback(() => {
    const active = activeIdxRef.current
    if (active >= 0) scrollToActive(active)
  }, [scrollToActive])

  /* reset al cambiar de canción / líneas */
  useEffect(() => {
    baseRef.current = 0
    offsetRef.current = 0
    activeIdxRef.current = -1
    followRef.current = true
    setActiveIndex(-1)
    setFollow(true)
    measure()
    paint()
  }, [lines, measure, paint])

  /* sincronización → posición real del audio (fuente de verdad) */
  useEffect(() => {
    if (!timed || !lines.length) return
    let raf
    const loop = () => {
      const ms = getPosition()
      const idx = findIndex(lines, ms)
      if (idx !== activeIdxRef.current) {
        activeIdxRef.current = idx
        setActiveIndex(idx)
      }

      /* la línea que suena SIEMPRE queda visible: se re-centra en vivo
         si cambió el índice o si se salió de la banda segura del visor */
      if (followRef.current && idx >= 0) {
        const vp = viewportRef.current
        const lineEl = lineElsRef.current[idx]
        if (vp && lineEl) {
          const vpr = vp.getBoundingClientRect()
          const lr = lineEl.getBoundingClientRect()
          const top = lr.top - vpr.top
          const bottom = lr.bottom - vpr.top
          const lo = vpr.height * 0.18
          const hi = vpr.height * 0.62
          if (idx !== lastFollowIdxRef.current || top < lo || bottom > hi) {
            measure()
            const tops = topsRef.current
            if (tops[idx] != null) {
              baseRef.current = -(tops[idx] - vpr.height * 0.4)
              offsetRef.current = 0
              paint()
            }
            lastFollowIdxRef.current = idx
          }
        }
      }

      const line = idx >= 0 ? lines[idx] : null
      if (line && line.words && line.words.length) {
        const t = ms - (line.startTimeMs || 0)
        const span = (line.endTimeMs || 0) - (line.startTimeMs || 0)
        const p = span > 0 ? Math.min(1, Math.max(0, t / span)) : 0
        const el = lineElsRef.current[idx]
        if (el) el.style.setProperty('--prog', `${p * 100}%`)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [lines, timed, getPosition, paint, measure])

  /* re-centrar cuando las fuentes terminan de cargar (cambian las alturas) */
  useEffect(() => {
    if (!timed) return
    const fix = () => {
      measure()
      if (followRef.current && activeIdxRef.current >= 0) scrollToActive(activeIdxRef.current)
    }
    if (document.fonts) {
      document.fonts.ready.then(fix)
      document.fonts.addEventListener('loadingdone', fix)
    }
    return () => {
      if (document.fonts) document.fonts.removeEventListener('loadingdone', fix)
    }
  }, [timed, measure, scrollToActive])

  /* scroll manual → apagar auto-follow; no pelear con el usuario */
  useEffect(() => {
    if (!timed) return
    const vp = viewportRef.current
    if (!vp) return
    const disable = () => {
      if (followRef.current) { followRef.current = false; setFollow(false) }
    }
    const onWheel = (e) => {
      e.preventDefault()
      disable()
      offsetRef.current += e.deltaY
      paint()
    }
    const down = (e) => { ptrRef.current = { y: e.clientY } }
    const move = (e) => {
      if (!ptrRef.current) return
      disable()
      const d = e.clientY - ptrRef.current.y
      ptrRef.current = { y: e.clientY }
      offsetRef.current += d
      paint()
    }
    const up = () => { ptrRef.current = null }

    vp.addEventListener('wheel', onWheel, { passive: false })
    vp.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      vp.removeEventListener('wheel', onWheel)
      vp.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [timed, paint])

  /* re-medir al redimensionar (títulos largos que envuelven) */
  useEffect(() => {
    if (!timed) return
    const onResize = () => {
      measure()
      if (followRef.current && activeIdxRef.current >= 0) scrollToActive(activeIdxRef.current)
    }
    const ro = new ResizeObserver(() => onResize())
    if (viewportRef.current) ro.observe(viewportRef.current)
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [timed, measure, scrollToActive])

  return (
    <div className={`sl-viewport ${timed ? 'timed' : 'plain'}`} ref={viewportRef}>
      <div className="sl-block" ref={blockRef}>
        {lines.map((l, i) => {
          const cls = timed
            ? i === activeIndex ? 'active' : i < activeIndex ? 'before' : 'next'
            : 'plain'
          return (
            <div
              key={i}
              ref={(el) => { lineElsRef.current[i] = el }}
              className={`sl-line ${cls}${l.words && l.words.length ? ' words' : ''}`}
              onClick={timed && onLineClick && l.startTimeMs != null
                ? () => { onLineClick(l.startTimeMs); resumeFollow() }
                : undefined}
            >
              {l.text}
            </div>
          )
        })}
      </div>
      {timed && !follow && (
        <button className="sl-follow" onClick={resumeFollow}>Volver a la letra actual</button>
      )}
    </div>
  )
}