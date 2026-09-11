import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../../state/PlayerContext'
import ScreenLoader from '../ScreenLoader'
import Toasts from '../Toasts'
import Dialog from '../Dialog'
import DesktopSidebar from './DesktopSidebar'
import DesktopHeader from './DesktopHeader'
import DesktopHome from './DesktopHome'
import DesktopSearch from './DesktopSearch'
import DesktopLibrary from './DesktopLibrary'
import DesktopPlaylist from './DesktopPlaylist'
import DesktopLyrics from './DesktopLyrics'
import DesktopPlayer from './DesktopPlayer'

export default function DesktopApp() {
  const { state, actions, restored } = usePlayer()
  const scrollRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!restored) actions.loadCharts('do')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = () => {
    const el = scrollRef.current
    if (el) setScrolled(el.scrollTop > 8)
  }

  let page
  if (state.lyrics) page = <DesktopLyrics />
  else if (state.tab === 'buscar') page = <DesktopSearch scrolled={scrolled} />
  else if (state.tab === 'biblioteca') page = <DesktopLibrary />
  else if (state.tab === 'lista') page = <DesktopPlaylist />
  else page = <DesktopHome />

  return (
    <div className="d-shell">
      <DesktopSidebar />
      <main className="d-main">
        <div className="d-main-scroll" ref={scrollRef} onScroll={onScroll}>
          <DesktopHeader scrolled={scrolled} />
          <div className="d-content" key={state.lyrics ? 'lyrics' : state.tab}>
            {page}
          </div>
        </div>
      </main>
      <DesktopPlayer />
      <ScreenLoader />
      <Toasts />
      <Dialog />
    </div>
  )
}