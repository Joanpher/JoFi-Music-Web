const S = (p) => ({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...p })
const F = (p) => ({ viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true, ...p })

/* fill icons */
export const IconPlay = (p) => (
  <svg {...F(p)}><path d="M8 5.14v13.72c0 .8.87 1.3 1.56.9l10.9-6.86c.62-.39.62-1.29 0-1.68L9.56 4.24c-.69-.4-1.56.1-1.56.9z" /></svg>
)
export const IconPause = (p) => (
  <svg {...F(p)}><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" /></svg>
)
export const IconNext = (p) => (
  <svg {...F(p)}><path d="M5 6.14v11.72c0 .8.87 1.3 1.56.9l9-5.86c.63-.41.63-1.4 0-1.8l-9-5.86A1.05 1.05 0 0 0 5 6.14z" /><rect x="17.5" y="5" width="2.6" height="14" rx=".8" /></svg>
)
export const IconPrev = (p) => (
  <svg {...F(p)}><path d="M19 6.14v11.72c0 .8-.87 1.3-1.56.9l-9-5.86a1.05 1.05 0 0 1 0-1.8l9-5.86c.69-.4 1.56.1 1.56.9z" /><rect x="3.9" y="5" width="2.6" height="14" rx=".8" /></svg>
)
export const IconMic = (p) => (
  <svg {...F(p)}><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm-4.8 9.55a.75.75 0 0 1 1.5.2 3.55 3.55 0 0 0 7.1 0 .75.75 0 0 1 1.5-.2A5.1 5.1 0 0 1 12.75 17.6v.9a.75.75 0 0 1-1.5 0v-.9a5.1 5.1 0 0 1-4.05-5.05z" /></svg>
)
export const IconMusic = (p) => (
  <svg {...F(p)}><path d="M9 3v10.55a3.5 3.5 0 1 0 2 3.16V8.4l8-1.7v5.85a3.5 3.5 0 1 0 2 3.16V4.1L9 3z" /></svg>
)

/* outline icons */
export const IconShuffle = (p) => (
  <svg {...S(p)}><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.8-1.1 2-1.7 3.3-1.7H22" /><path d="m18 2 4 4-4 4" /><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" /><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.7" /><path d="m18 14 4 4-4 4" /></svg>
)
export const IconRepeat = (p) => (
  <svg {...S(p)}><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
)
export const IconArrowLeft = (p) => (
  <svg {...S(p)}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
)
export const IconChevronDown = (p) => (
  <svg {...S(p)}><path d="m6 9 6 6 6-6" /></svg>
)
export const IconSearch = (p) => (
  <svg {...S(p)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
)
export const IconHome = (p) => (
  <svg {...S(p)}><path d="m3 9.5 9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
)
export const IconLibrary = (p) => (
  <svg {...S(p)}><path d="M4 21V4" /><path d="M9 21V9" /><path d="M14 21V6" /><path d="M19 21V12" /></svg>
)
export const IconBell = (p) => (
  <svg {...S(p)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
)
export const IconClock = (p) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
)
export const IconGear = (p) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
)
export const IconHeart = (p) => (
  <svg {...S(p)}><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" /></svg>
)
export const IconHeartFill = (p) => (
  <svg {...F(p)}><path d="M19 14.3c1.4-1.4 3-3.1 3-5.4A5.5 5.5 0 0 0 16.5 3.5c-1.8 0-3.1.6-4.5 2.1-1.4-1.5-2.7-2.1-4.5-2.1A5.5 5.5 0 0 0 2 8.9c0 2.3 1.6 4 3 5.4l7 7z" /></svg>
)
export const IconDots = (p) => (
  <svg {...F(p)}><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
)
export const IconDevice = (p) => (
  <svg {...S(p)}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /><path d="M12 16v4" /></svg>
)
export const IconShare = (p) => (
  <svg {...S(p)}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4" /><path d="m15.4 6.5-6.8 4" /></svg>
)
export const IconQueue = (p) => (
  <svg {...S(p)}><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></svg>
)
export const IconVolume = (p) => (
  <svg {...S(p)}><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.4 5.6a9 9 0 0 1 0 12.8" /></svg>
)
export const IconMute = (p) => (
  <svg {...S(p)}><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="m23 9-6 6" /><path d="m17 9 6 6" /></svg>
)
export const IconLiked = (p) => <IconHeartFill {...p} />

export const IconPlus10 = (p) => (
  <svg {...F(p)}><path d="M11 5v11a1.5 1.5 0 1 1-3 0V5a1.5 1.5 0 1 1 3 0z" /><path d="M19 5v11a1.5 1.5 0 1 1-3 0V5a1.5 1.5 0 1 1 3 0z" /></svg>
)

/* iconos para accesos y géneros (reemplazan emojis) */
export const IconZap = (p) => (
  <svg {...S(p)}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
)
export const IconFlame = (p) => (
  <svg {...S(p)}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
)
export const IconMoon = (p) => (
  <svg {...S(p)}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
)
export const IconVinyl = (p) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3.2" /><path d="M4.5 12a7.5 7.5 0 0 1 15 0" /></svg>
)
export const IconGlobe = (p) => (
  <svg {...S(p)}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
)
export const IconTrophy = (p) => (
  <svg {...S(p)}><path d="M6 9a6 6 0 0 0 12 0V3H6v6z" /><path d="M6 3h12" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M8 3v2h8V3" /></svg>
)