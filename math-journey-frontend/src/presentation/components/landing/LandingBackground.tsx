export function LandingBackground() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
      style={{
        backgroundImage: 'url(/backgrounds/landing-math.png)',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        opacity: 0.08,
      }}
    />
  )
}
