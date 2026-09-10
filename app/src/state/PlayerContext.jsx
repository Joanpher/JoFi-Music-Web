import React, {
  createContext, useCallback, useContext, useEffect, useReducer, useRef, useState
} from 'react'
import * as api from '../services/api'
import { logger } from '../services/logger'
import {
  initMediaSession, updateMediaSession, clearMediaSession
} from '../services/mediaSession'
import { countryInfo, RANDOM_POOL } from '../lib/constants'
import { thumbFor } from '../lib/format'

const Ctx = createContext(null)
export const usePlayer = () => useContext(Ctx)

const FAV_KEY = 'playtube.favs.v1'
const pick = (pool) => pool[Math.floor(Math.random() * pool.length)]

function loadFavs() {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* sin favoritos previos */ }
  return []
}

const initialState = {
  screen: 'list',          // 'list' = shell con tabs · 'player' = overlay Now Playing
  tab: 'inicio',           // 'inicio' | 'buscar' | 'biblioteca'
  cc: 'do',
  listTitle: 'Top República Dominicana',
  queue: [],
  current: -1,
  playing: false,
  shuffle: false,
  repeat: 'off',           // 'off' | 'all' | 'one'
  volume: 80,
  muted: false,
  busy: null,
  favs: loadFavs()
}

function reducer(s, a) {
  switch (a.type) {
    case 'SCREEN': return { ...s, screen: a.s }
    case 'TAB': return { ...s, tab: a.t }
    case 'CC': return { ...s, cc: a.c }
    case 'LOAD_SONGS': return { ...s, queue: a.songs, current: -1, playing: false, listTitle: a.title }
    case 'SET_CURRENT': return { ...s, current: a.i }
    case 'SET_PLAYING': return { ...s, playing: a.v }
    case 'SHUFFLE': return { ...s, shuffle: !s.shuffle }
    case 'REPEAT': {
      const next = s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off'
      return { ...s, repeat: next }
    }
    case 'VOLUME': return { ...s, volume: a.v, muted: false }
    case 'MUTE': return { ...s, muted: !s.muted }
    case 'BUSY': return { ...s, busy: a.text }
    case 'SET_FAVS': return { ...s, favs: a.favs }
    default: return s
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [tick, setTick] = useState({ current: 0, duration: 0 })
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)

  const audioRef = useRef(null)
  const streamCache = useRef(new Map())
  const proxyUsed = useRef(new Set())
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(state.favs))
    } catch { /* silencioso */ }
  }, [state.favs])

  const showDialog = useCallback((title, message, actions = [{ label: 'Cerrar' }], opts = {}) => {
    setDialog({ title, message, actions, ...opts })
  }, [])
  const closeDialog = useCallback(() => setDialog(null), [])
  const toast = useCallback((msg, { error = false, duration = 3200 } = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg, error }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
  }, [])

  const currentSong = useCallback(() => {
    const { queue, current } = stateRef.current
    return current >= 0 ? queue[current] : null
  }, [])

  const isLiked = useCallback((song) => {
    if (!song || !song.ytmId) return false
    return stateRef.current.favs.some((f) => f.ytmId === song.ytmId)
  }, [])

  const toggleLike = useCallback((song) => {
    if (!song || !song.ytmId) return false
    const { favs } = stateRef.current
    const exists = favs.some((f) => f.ytmId === song.ytmId)
    const next = exists ? favs.filter((f) => f.ytmId !== song.ytmId) : [...favs, song]
    dispatch({ type: 'SET_FAVS', favs: next })
    return !exists
  }, [])

  /* ---------- audio ---------- */
  useEffect(() => {
    const a = new Audio()
    a.preload = 'metadata'
    a.volume = stateRef.current.volume / 100
    audioRef.current = a

    const onTime = () => setTick({ current: a.currentTime || 0, duration: a.duration || 0 })
    const onPlay = () => {
      dispatch({ type: 'SET_PLAYING', v: true })
      const s = currentSong()
      if (s) updateMediaSession({ ...s, thumb: thumbFor(s.thumb, 512) }, a.duration || s.duration || 0, true)
    }
    const onPause = () => dispatch({ type: 'SET_PLAYING', v: false })

    a.addEventListener('timeupdate', onTime)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    return () => {
      a.pause()
      a.src = ''
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      clearMediaSession()
    }
  }, [currentSong])

  const playIndex = useCallback(async (index, opts = {}, qOverride = null) => {
    const q = qOverride || stateRef.current.queue
    if (!q[index]) return
    dispatch({ type: 'SET_CURRENT', i: index })
    if (opts.screen !== false) dispatch({ type: 'SCREEN', s: 'player' })
    const song = q[index]

    let url = song.ytmId ? streamCache.current.get(song.ytmId) : ''
    if (!url) {
      if (!song.ytmId) {
        showDialog('Sin audio', 'Esta canción no tiene audio disponible.', [{ label: 'Entendido' }])
        dispatch({ type: 'SET_PLAYING', v: false })
        return
      }
      dispatch({ type: 'BUSY', text: 'Cargando la canción completa…' })
      try {
        const d = await api.resolveSong(song.ytmId)
        url = d.url
        streamCache.current.set(song.ytmId, d.url)
      } catch (e) {
        logger.error('no se pudo resolver el stream', e)
        dispatch({ type: 'BUSY', text: null })
        dispatch({ type: 'SET_PLAYING', v: false })
        showDialog('No se pudo obtener el audio', String((e && e.message) || e), [{ label: 'Entendido' }])
        return
      }
      dispatch({ type: 'BUSY', text: null })
    }

    proxyUsed.current.delete(song.ytmId)
    const a = audioRef.current
    if (!a) return
    a.src = url
    a.play().catch(() => {
      logger.info('autoplay bloqueado, esperando clic')
      dispatch({ type: 'SET_PLAYING', v: false })
      toast('Toca el botón para reproducir', { error: true })
    })
  }, [showDialog, toast])

  const nextSong = useCallback(() => {
    const { queue, current, shuffle } = stateRef.current
    if (!queue.length) return
    const i = shuffle
      ? Math.floor(Math.random() * queue.length)
      : (current + 1) % queue.length
    playIndex(i)
  }, [playIndex])

  const prevSong = useCallback(() => {
    const a = audioRef.current
    if (a && a.currentTime > 3) {
      a.currentTime = 0
      setTick({ current: 0, duration: a.duration || 0 })
      return
    }
    const { queue, current } = stateRef.current
    if (!queue.length) return
    playIndex(((current - 1 + queue.length) % queue.length))
  }, [playIndex])

  const togglePlay = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (stateRef.current.current === -1) {
      if (stateRef.current.queue.length) playIndex(0)
      return
    }
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }, [playIndex])

  const seekTo = useCallback((t) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = Math.max(0, t)
    setTick({ current: a.currentTime, duration: a.duration || 0 })
  }, [])
  const seekBy = useCallback((delta) => {
    const a = audioRef.current
    if (!a || !a.duration) return
    seekTo(a.currentTime + delta)
  }, [seekTo])

  /* fin de canción según repeat */
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onEnded = () => {
      const { queue, current, shuffle, repeat } = stateRef.current
      if (repeat === 'one' && queue.length) {
        a.currentTime = 0
        a.play().catch(() => {})
        return
      }
      if (!queue.length) return
      if (queue.length === 1) {
        if (repeat === 'all') {
          a.currentTime = 0
          a.play().catch(() => {})
        }
        return
      }
      let i
      if (shuffle) {
        i = Math.floor(Math.random() * queue.length)
      } else if (current + 1 < queue.length) {
        i = current + 1
      } else if (repeat === 'all') {
        i = 0
      } else {
        a.currentTime = 0
        return
      }
      playIndex(i)
    }
    const onError = () => {
      const s = currentSong()
      if (s && s.ytmId && streamCache.current.has(s.ytmId)) {
        const u = streamCache.current.get(s.ytmId)
        if (u.startsWith('https://') && !proxyUsed.current.has(s.ytmId)) {
          proxyUsed.current.add(s.ytmId)
          logger.info('stream directo falló → proxy local')
          a.src = `/api/audio?u=${encodeURIComponent(u)}`
          a.play().catch(() => {})
          return
        }
      }
      logger.error(`error reproduciendo "${s ? s.title : ''}"`)
      toast(`No se pudo reproducir: ${s ? s.title : 'la canción'}`, { error: true })
    }
    a.addEventListener('ended', onEnded)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('error', onError)
    }
  }, [currentSong, playIndex, toast])

  /* carga y reproduce una cola en un solo paso (carruseles) */
  const playSongs = useCallback((songs, index, title = '') => {
    const list = songs && songs.length ? songs : stateRef.current.queue
    if (!list[index]) return
    dispatch({ type: 'LOAD_SONGS', songs: list, title })
    dispatch({ type: 'SET_PLAYING', v: false })
    playIndex(index, { screen: true }, list)
  }, [playIndex])

  /* ---------- MediaSession ---------- */
  useEffect(() => {
    const off = initMediaSession({
      onPlay: () => {
        const a = audioRef.current
        if (a && a.paused && stateRef.current.current >= 0) a.play().catch(() => {})
      },
      onPause: () => {
        const a = audioRef.current
        if (a && !a.paused) a.pause()
      },
      onNext: nextSong,
      onPrev: prevSong,
      seekBy,
      seekTo
    })
    return off
  }, [nextSong, prevSong, seekBy, seekTo])

  /* ---------- carga de listas ---------- */
  const loadCharts = useCallback(async (cc) => {
    dispatch({ type: 'BUSY', text: 'Cargando el top del momento…' })
    try {
      const d = await api.getCharts(cc)
      const songs = (d.songs || []).map(api.toSong)
      dispatch({ type: 'LOAD_SONGS', songs, title: `Top ${countryInfo(cc).name}` })
      if (!songs.length) toast('El top salió vacío', { error: true })
    } catch (e) {
      logger.error('no se pudo cargar el top', e)
      showDialog('Error de conexión', 'No se pudo conectar con el servidor. ¿Corriste iniciar.bat?', [{ label: 'Entendido' }])
    } finally {
      dispatch({ type: 'BUSY', text: null })
    }
  }, [showDialog, toast])

  const searchList = useCallback(async (q, opts = {}) => {
    dispatch({ type: 'BUSY', text: 'Buscando…' })
    try {
      const d = await api.searchSongs(q)
      const songs = (d.songs || []).map(api.toSong)
      dispatch({ type: 'LOAD_SONGS', songs, title: `“${q}”` })
      if (opts.tab) dispatch({ type: 'TAB', t: opts.tab })
      if (!songs.length) toast('Sin resultados para esa búsqueda', { error: true })
    } catch (e) {
      logger.error('no se pudo buscar', e)
      showDialog('Error de búsqueda', 'No se pudo contactar al servidor.', [{ label: 'Entendido' }])
    } finally {
      dispatch({ type: 'BUSY', text: null })
    }
  }, [showDialog, toast])

  const randomList = useCallback(async () => {
    const g = pick(RANDOM_POOL)
    dispatch({ type: 'BUSY', text: 'Escogiendo algo aleatorio…' })
    try {
      const d = await api.searchSongs(g)
      const songs = (d.songs || []).map(api.toSong)
      dispatch({ type: 'LOAD_SONGS', songs, title: `Aleatorio · ${g[0].toUpperCase()}${g.slice(1)}` })
      if (!songs.length) toast('Sin resultados', { error: true })
    } catch (e) {
      logger.error('fallo el aleatorio', e)
      showDialog('Error', 'No se pudo cargar la lista aleatoria.', [{ label: 'Entendido' }])
    } finally {
      dispatch({ type: 'BUSY', text: null })
    }
  }, [showDialog, toast])

  const openFavorites = useCallback(async () => {
    const favs = stateRef.current.favs
    if (!favs.length) {
      toast('Aún no tienes canciones guardadas', { error: true })
      return
    }
    dispatch({ type: 'LOAD_SONGS', songs: favs, title: 'Tus favoritas' })
    dispatch({ type: 'TAB', t: 'buscar' })
  }, [toast])

  /* ---------- letras ---------- */
  const openLyrics = useCallback(async (song) => {
    if (!song) return
    dispatch({ type: 'BUSY', text: 'Buscando letras…' })
    let text = null
    if (song.ytmId) text = await api.backendLyrics(song.ytmId)
    if (!text) text = await api.ovhLyrics(song.artist, song.title)
    dispatch({ type: 'BUSY', text: null })
    if (text) {
      showDialog(`Letras · ${song.title}`, text, [{ label: 'Cerrar' }], { lyrics: true })
    } else {
      toast(`Letras no encontradas para "${song.title}"`, { error: true })
    }
  }, [showDialog, toast])

  const controls = {
    togglePlay,
    next: nextSong,
    prev: prevSong,
    seekTo,
    seekBy,
    toggleShuffle: () => dispatch({ type: 'SHUFFLE' }),
    toggleRepeat: () => dispatch({ type: 'REPEAT' }),
    setVolume: (v) => {
      const a = audioRef.current
      if (a) a.volume = v / 100
      dispatch({ type: 'VOLUME', v })
    },
    toggleMute: () => {
      const a = audioRef.current
      const muted = !stateRef.current.muted
      if (a) a.muted = muted
      dispatch({ type: 'MUTE' })
    }
  }

  const value = {
    state,
    tick,
    toasts,
    dialog,
    favs: state.favs,
    showDialog,
    closeDialog,
    toast,
    currentSong,
    isLiked,
    toggleLike,
    actions: {
      showDialog,
      toast,
      loadCharts,
      searchList,
      randomList,
      openFavorites,
playIndex,
      playSongs,
      openLyrics,
      back: () => dispatch({ type: 'SCREEN', s: 'list' }),
      openPlayer: () => dispatch({ type: 'SCREEN', s: 'player' }),
      setTab: (t) => dispatch({ type: 'TAB', t }),
      setCc: (c) => dispatch({ type: 'CC', c }),
      controls
    }
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}