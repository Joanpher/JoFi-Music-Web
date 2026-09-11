export default function TurtleLogo({ size = 36, ...p }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-label="JoFi Music" role="img" {...p}>
      <defs>
        <linearGradient id="dpl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#5fe9c1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0e1017" />
      <g fill="#124a3d">
        <rect x="7" y="30" width="10" height="16" rx="5" />
        <rect x="47" y="30" width="10" height="16" rx="5" />
        <rect x="11" y="44" width="11" height="12" rx="5.5" />
        <rect x="42" y="44" width="11" height="12" rx="5.5" />
      </g>
      <circle cx="32" cy="16" r="10" fill="#124a3d" />
      <circle cx="28" cy="13.4" r="2.5" fill="#fff" />
      <circle cx="36" cy="13.4" r="2.5" fill="#fff" />
      <circle cx="28.8" cy="13.6" r="1.25" fill="#0b1512" />
      <circle cx="35.2" cy="13.6" r="1.25" fill="#0b1512" />
      <path d="M27.6 19.6c2 1.4 6.8 1.4 8.8 0" stroke="#0b1512" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="M32 19c14.5 0 24 10 24 20 0 5.7-4.3 11-10.5 11h-27C12.3 50 8 44.7 8 39 8 29 17.5 19 32 19z" fill="url(#dpl)" />
      <path d="M32 27.5L44.5 34 32 40.5 19.5 34z" fill="none" stroke="#0b1512" strokeWidth="1.6" strokeLinejoin="round" opacity=".55" />
      <path d="M22 45.5c2.6 1.9 5.4 2.9 10 2.9 4.6 0 7.4-1 10-2.9" fill="none" stroke="#0b1512" strokeWidth="1.6" strokeLinecap="round" opacity=".5" />
      <path
        d="M29.5 40a3 3 0 1 0 1.6-.9l1.1-6.1 4.3.8-.7 3.9a3 3 0 1 0 1.5-1.1l.9-4.6-6.8-1.3-2 8.3z"
        fill="#0e1017"
      />
    </svg>
  )
}