// Genera los iconos PNG de la PWA sin dependencias (ponder manual + zlib).
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
mkdirSync(outDir, { recursive: true })

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td), 0)
  return Buffer.concat([len, td, crc])
}

function encodePng(pixels, w, h) {
  const stride = w * 4
  const raw = Buffer.alloc((stride + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0
    Buffer.from(pixels.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => Math.min(1, Math.max(0, v))

function inRounded(x, y, r, size) {
  const cx = clamp01(x / size), cy = clamp01(y / size)
  const dx = Math.max(cx - 1, 0) - Math.max(0.5 - cx, 0) // not used; simpler:
  return true
}

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx, dy = y - cy
  return dx * dx + dy * dy <= r * r
}

function pointInTriangle(px, py, a, b, c) {
  const s1 = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0])
  const s2 = (c[0] - b[0]) * (py - b[1]) - (c[1] - b[1]) * (px - b[0])
  const s3 = (a[0] - c[0]) * (py - c[1]) - (a[1] - c[1]) * (px - c[0])
  const hasNeg = s1 < 0 || s2 < 0 || s3 < 0
  const hasPos = s1 > 0 || s2 > 0 || s3 > 0
  return !(hasNeg && hasPos)
}

function draw(size, { maskable = false } = {}) {
  const px = new Uint8Array(size * size * 4)
  const TEAL = { r: 34, g: 211, b: 238 }
  const VIOLET = { r: 168, g: 85, b: 247 }
  const bg = { r: 14, g: 16, b: 23 }
  const radius = size * (maskable ? 0 : 0.22)
  const cx = size / 2, cy = size / 2, cyc = size * (maskable ? 0.5 : 0.49)
  const cr = size * (maskable ? 0.42 : 0.345)
  // triángulo de play
  const ts = size * 0.16
  const tx = size * 0.42, ty = size * 0.5
  const tri = [
    [tx - ts * 0.45, ty - ts],
    [tx - ts * 0.45, ty + ts],
    [tx + ts * 0.75, ty]
  ]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      let r = bg.r, g = bg.g, b = bg.b, a = 255
      if (!maskable) {
        // esquinas redondeadas → transparentes
        const qx = x < radius && y < radius ? 1
          : x > size - radius && y < radius ? 2
          : x < radius && y > size - radius ? 3
          : x > size - radius && y > size - radius ? 4 : 0
        if (qx) {
          const ox = qx === 1 || qx === 3 ? radius : size - radius
          const oy = qx === 1 || qx === 2 ? radius : size - radius
          const dx = x - ox, dy = y - oy
          if (dx * dx + dy * dy > radius * radius) a = 0
        }
      }
      const t = clamp01((x + y) / (2 * size - 2))
      if (inCircle(x, y, cx, cy, cr)) {
        r = lerp(TEAL.r, VIOLET.r, t)
        g = lerp(TEAL.g, VIOLET.g, t)
        b = lerp(TEAL.b, VIOLET.b, t)
        if (pointInTriangle(x, y, tri[0], tri[1], tri[2])) {
          r = bg.r; g = bg.g; b = bg.b
        }
      }
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a
    }
  }
  return encodePng(px, size, size)
}

writeFileSync(join(outDir, 'icon-192.png'), draw(192))
writeFileSync(join(outDir, 'icon-512.png'), draw(512))
writeFileSync(join(outDir, 'icon-maskable-512.png'), draw(512, { maskable: true }))
console.log('iconos PWA generados en app/public')