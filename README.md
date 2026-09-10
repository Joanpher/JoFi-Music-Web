> **PlayTube** — Música completa desde YouTube Music (PWA)

## 🧱 Arquitectura en capas

```
┌────────────────────────────────────────────────────────────┐
│  app/   (React + Vite + PWA · diseño móvil 390×844)        │
│   ┌──────────────────────────────────────────────────────┐ │
│   │ ui/        HomeScreen (saludo+accesos+carruseles) ·  │ │
│   │            SearchScreen · LibraryScreen · MiniPlayer │ │
│   │            BottomNav · NowPlaying (PlayerScreen) ·   │ │
│   │            Dialog · ScreenLoader · Toasts · icons SVG│ │
│   │ state/     PlayerContext (reducer) + audio + MediaSession
│   │ services/  api.js · logger.js (laceado) · mediaSession.js
│   │ hooks/     useDominantColor (fondo = color de portada)
│   │ lib/       constants · format                        │ │
│   │ styles/    globals.css · animations.css              │ │
│   └──────────────────────────────────────────────────────┘ │
│         │  fetch JSON (misma capa de red)
│         ▼
│  server.py  (Python 3.12 · stdlib)   ← 2 servidores en 1   │
│   ├── API:  /api/charts · /api/search · /api/song         │
│   │          /api/lyrics · /api/audio (proxy range 206)   │
│   ├── Estáticos: sirve app/dist (PWA) con gzip            │
│   ├── Caché SQLite persistente (WAL, compartida entre PC y
│   │          teléfono, sobrevive reinicios)               │
│   └── /api/log  →  logs/error.log   (errores del cliente) │
└────────────────────────────────────────────────────────────┘
        │  ytmusicapi + yt-dlp
        ▼
   YouTube Music (audio completo m4a · ~3 s de resolución)
```

## 🧩 Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | **React 18 + Vite 5** (JavaScript) · estado con Context + useReducer |
| PWA | **vite-plugin-pwa** (manifest + Service Worker Workbox, precache) |
| Notificación/control | **MediaSession API**: play/pause, ⏭⏮, ⏪10s ⏩10s, seekto |
| Audio | `<audio>` nativo + proxy local `/api/audio` con Range (fallback automático si el directo falla) |
| Backend | **Python 3.12** · `ThreadingHTTPServer` (hilo por conexión → multidispositivo) |
| Backend libs | **ytmusicapi** (top por país, búsqueda, letras) · **yt-dlp** (audio completo) |
| Persistencia | **SQLite WAL** (caché en disco compartida, TTLs por tipo) + favoritos en `localStorage` |
| Logs de error | Cliente: sin `console.log` en prod, errores a `/api/log` → `logs/error.log` |
| Optimización | gzip en estáticos · thumbnails a medida (w256/w512) · lazy images · build minificado (≈57 KB gzip JS) |

## ✅ Pasos / Estado

- [x] **0. README + decisión de stack** — React+Vite (+PWA) en lugar del HTML puro
- [x] **1. Scaffold** — `app/` : Vite+React, capas (`ui/state/services/lib/styles`), 2 pantallas por estado (lista ⇄ reproductor), transición animada
- [x] **2. Servicios** — API (charts/search/resolve/lyrics + fallback lyrics.ovh), Logger (dev=consola, prod=silencioso + POST `/api/log`), MediaSession (notificación con controles)
- [x] **3. Shell móvil (spec 390×844)** — Inicio (saludo por hora + 3 acciones circulares + grid de accesos 2×3 con iconos + carruseles horizontales), Buscar (géneros con iconos + listado), Tu biblioteca (favoritas + tops por país con badges), **MiniPlayer fijo** sobre **BottomNav** de 3 pestañas, NowPlaying como overlay con fondo tomado del color de la portada (degradado), soltar cierre con gesto de arrastre, like persistente, repeat off→all→one, scrub arrastrable, share/clipboard
- [x] **4. Animaciones** — entrada del reproductor, heartPop, ecualizador del carrusel, shimmer skeleton, toasts/diálogos, `prefers-reduced-motion`
- [x] **5. Backend** — caché SQLite persistente compartida, `do_HEAD`, bind `0.0.0.0` (LAN), gzip estáticos, `/api/log`, ThreadingHTTPServer para N dispositivos, proxy audio 206 con Range
- [x] **6. PWA** — iconos 192/512/maskable autogenerados, manifest + Service Worker (precache), registro automático
- [x] **7. Optimización** — build minificado + gzip, miniaturas `=w256/h512`, lazy loading de imágenes
- [x] **8. Prueba funcional headless** — home (3 acciones, 6 accesos, 6 secciones, 60 cards), NowPlaying (portada, fondo degradado, play real con tiempo avanzando, like + toast + `localStorage`, cierre con chevron Y gesto swipe, reapertura desde MiniPlayer), Buscar 54 resultados "perreo", top por país 100, favoritos vía accesos, SW `activated`, 0 errores en consola
- [ ] **9. Empaquetado final** — `iniciar.bat`/`parar.bat` listos, túnel HTTPS corriendo; falta: probar en el teléfono real (PWA installable + MediaSession en background) y pulir detalles

## ▶ Cómo ejecutar

```bash
# 1. Doble clic en iniciar.bat  →  instala deps + compila la PWA + abre el navegador
#    o manualmente:
python -m pip install ytmusicapi yt-dlp requests
cd app && npm install && npm run build
cd .. && python server.py            # → http://localhost:8000
```

## 📱 Teléfono

- **Controles desde la notificación / pantalla bloqueada**: lo da MediaSession (pausa, ⏮⏭, ±10 s, seek). La música sigue sonando al apagar la pantalla o salir de la app (pestaña/pantalla sigue activa en segundo plano).
- **Instalar como app (PWA)**: necesita HTTPS. Hay túnel activo: `https://pubs-wrapping-vatican-editorial.trycloudflare.com` (cambia al reiniciar). En LAN sin túnel, `http://<IP-de-tu-PC>:8000` funciona igual sin instalación (se imprime la IP al arrancar el servidor).
- **Diseño**: shell móvil 390×844 — Inicio/Buscar/Tu biblioteca con MiniPlayer fijo y reproductor Now Playing a pantalla completa con fondo del color de la portada.

---
_Última actualización: 2026-09-10 · Estado: pasos 0-8 completados y probados + túnel HTTPS activo; falta prueba en teléfono real (paso 9)._