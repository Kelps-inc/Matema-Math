interface NinjaIconProps {
  className?: string
  strokeWidth?: number
}

/** Ninja face icon — cabeça com faixa e olhos acima da máscara. */
export function NinjaIcon({ className, strokeWidth = 1.75 }: NinjaIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="12" cy="9.5" r="5.5" />
      {/* Headband */}
      <path d="M6.5 9.5 H17.5" />
      {/* Eyes above band */}
      <line x1="9" y1="7.5" x2="10.2" y2="7.5" strokeWidth={strokeWidth + 0.5} />
      <line x1="13.8" y1="7.5" x2="15" y2="7.5" strokeWidth={strokeWidth + 0.5} />
      {/* Mask / scarf draping down */}
      <path d="M7.5 13.5 Q12 16 16.5 13.5 L15.5 20 Q12 21.5 8.5 20 Z" />
    </svg>
  )
}
