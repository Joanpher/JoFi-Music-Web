import { useEffect } from 'react'
import { PlayerProvider, usePlayer } from './state/PlayerContext'
import HomeScreen from './ui/HomeScreen'
import SearchScreen from './ui/SearchScreen'
import LibraryScreen from './ui/LibraryScreen'
import MiniPlayer from './ui/MiniPlayer'
import BottomNav from './ui/BottomNav'
import PlayerScreen from './ui/PlayerScreen'
import LyricsOverlay from './ui/LyricsOverlay'
import ScreenLoader from './ui/ScreenLoader'
import Toasts from './ui/Toasts'
import Dialog from './ui/Dialog'
import useMediaQuery from './hooks/useMediaQuery'
import DesktopApp from './ui/desktop/DesktopApp'

const DESKTOP_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 1024px)'

function Screens() {
  const { state, actions, restored } = usePlayer()
  const desktop = useMediaQuery(DESKTOP_QUERY)

  useEffect(() => {
    if (!restored) actions.loadCharts('do')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (desktop) return <DesktopApp />

  const Tab = state.tab === 'inicio' ? HomeScreen : state.tab === 'buscar' ? SearchScreen : LibraryScreen

  return (
    <div className="app">
      <div className="viewport" key={state.tab}>
        <Tab />
      </div>
      <MiniPlayer />
      <BottomNav />
      {state.screen === 'player' && <PlayerScreen />}
      {state.lyrics && <LyricsOverlay />}
      <ScreenLoader />
      <Toasts />
      <Dialog />
    </div>
  )
}

export default function App() {
  return (
    <PlayerProvider>
      <Screens />
    </PlayerProvider>
  )
}