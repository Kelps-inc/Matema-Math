export function GameBackground() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
      style={{
        backgroundImage: 'url(/backgrounds/game-bedroom.png)',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        height: 'clamp(260px, 55vh, 480px)',
        opacity: 0.12,
      }}
    />
  )
}
