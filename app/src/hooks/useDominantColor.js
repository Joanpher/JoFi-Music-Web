import { useEffect, useState } from 'react'

/* Extrae el color dominante de una portada para
   el fondo degradado del reproductor NOW PLAYING. */
export default function useDominantColor(src, darken = 0.62) {
  const [rgb, setRgb] = useState(null)

  useEffect(() => {
    if (!src) {
      setRgb(null)
      return
    }
    let alive = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = 40
        c.height = 40
        const x = c.getContext('2d')
        x.drawImage(img, 0, 0, 40, 40)
        const d = x.getImageData(0, 0, 40, 40).data
        let r = 0, g = 0, b = 0, n = 0
        for (let i = 0; i < d.length; i += 4) {
          r += d[i]; g += d[i + 1]; b += d[i + 2]; n++
        }
        r = Math.round((r / n) * darken)
        g = Math.round((g / n) * darken)
        b = Math.round((b / n) * darken)
        if (alive) setRgb(`${r},${g},${b}`)
      } catch {
        if (alive) setRgb(null)
      }
    }
    img.onerror = () => alive && setRgb(null)
    img.src = src
    return () => { alive = false }
  }, [src, darken])

  return rgb
}