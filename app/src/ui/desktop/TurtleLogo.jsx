export default function TurtleLogo({ size = 36, ...p }) {
  return (
    <img
      src="/logo-jofi.png"
      width={size}
      height={size}
      alt="JoFi Music"
      draggable="false"
      {...p}
    />
  )
}
