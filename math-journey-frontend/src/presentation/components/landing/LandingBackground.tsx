export function LandingBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
      style={{
        backgroundImage: 'url(/backgrounds/matema_background_melhorada.png)',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        opacity: 0.55,
      }}
    />
  )
}
