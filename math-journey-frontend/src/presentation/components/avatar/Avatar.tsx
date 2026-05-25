'use client'

export interface AvatarProps {
  ownedItemNames: string[]
  size?: number
  className?: string
}

const SKIN = '#FDBCB4'
const HAIR = '#4A2C2A'

export function Avatar({ ownedItemNames, size = 200, className }: AvatarProps) {
  const owned = new Set(ownedItemNames.map((n) => n.toLowerCase()))

  const isNinja      = owned.has('ninja da matemática')
  const isMage       = owned.has('mago dos números')
  const isAstronaut  = owned.has('astronauta')
  const isScientist  = owned.has('cientista')

  const hasGlasses   = owned.has('óculos estilosos')
  const hasCrown     = owned.has('coroa')
  const hasCapelo    = owned.has('capelo')
  const hasCartola   = owned.has('cartola')

  // Body color by avatar type (priority: mago > astronauta > cientista > ninja > default)
  const bodyColor = isMage ? '#8B7CC4'
    : isAstronaut           ? '#DADADA'
    : isScientist           ? '#6B9E7A'
    : isNinja               ? '#2C3333'
    : '#D4845A'

  // Only one hat shown at a time
  const hat = hasCrown ? 'crown' : hasCapelo ? 'capelo' : hasCartola ? 'cartola' : null

  return (
    <svg
      width={size}
      height={Math.round(size * 1.45)}
      viewBox="0 0 200 290"
      className={className}
      aria-hidden
    >
      {/* Ground shadow */}
      <ellipse cx="100" cy="286" rx="52" ry="7" fill="#00000012" />

      {/* ── BODY ── */}
      <rect x="47" y="160" width="106" height="118" rx="28" fill={bodyColor} />

      {isAstronaut && <>
        <ellipse cx="100" cy="163" rx="30" ry="7" fill="#BBB" opacity="0.55" />
        <rect x="78" y="176" width="44" height="26" rx="9" fill="white" opacity="0.22" />
        <circle cx="100" cy="222" r="13" fill="white" opacity="0.18" />
      </>}
      {isScientist && <>
        <path d="M 73 160 L 100 195 L 127 160" fill="white" opacity="0.5" />
        <rect x="83" y="218" width="34" height="38" rx="5" fill="white" opacity="0.16" />
      </>}
      {isMage && <>
        <text x="54" y="208" fontSize="17" opacity="0.9">⭐</text>
        <text x="124" y="230" fontSize="13" opacity="0.75">✨</text>
        <text x="74" y="258" fontSize="11" opacity="0.6">✦</text>
      </>}
      {isNinja && <>
        <rect x="47" y="202" width="106" height="10" rx="4" fill="#8B0000" opacity="0.85" />
        <rect x="84" y="192" width="32" height="14" rx="4" fill="#111" opacity="0.55" />
      </>}

      {/* ── NECK ── */}
      <rect x="83" y="150" width="34" height="18" rx="7" fill={SKIN} />

      {/* ── HEAD ── */}
      <circle cx="100" cy="100" r="70" fill={SKIN} />

      {/* ── EARS ── */}
      <circle cx="30" cy="100" r="17" fill={SKIN} />
      <circle cx="170" cy="100" r="17" fill={SKIN} />
      <circle cx="30" cy="100" r="10" fill="#F5A898" opacity="0.5" />
      <circle cx="170" cy="100" r="10" fill="#F5A898" opacity="0.5" />

      {/* ── HAIR ── */}
      {!isNinja && <>
        <ellipse cx="100" cy="38" rx="60" ry="28" fill={HAIR} />
        <ellipse cx="100" cy="32" rx="52" ry="22" fill={HAIR} />
        <ellipse cx="37" cy="74" rx="13" ry="24" fill={HAIR} />
        <ellipse cx="163" cy="74" rx="13" ry="24" fill={HAIR} />
      </>}
      {isNinja && <>
        <ellipse cx="100" cy="44" rx="62" ry="28" fill="#1E2424" />
        <rect x="34" y="108" width="132" height="20" rx="6" fill="#1E2424" />
      </>}

      {/* ── CHEEKS ── */}
      <ellipse cx="60" cy="118" rx="17" ry="12" fill="#FFB3A7" opacity="0.5" />
      <ellipse cx="140" cy="118" rx="17" ry="12" fill="#FFB3A7" opacity="0.5" />

      {/* ── EYES: whites ── */}
      <ellipse cx="75" cy="97" rx="15" ry="17" fill="white" />
      <ellipse cx="125" cy="97" rx="15" ry="17" fill="white" />

      {/* ── EYES: irises ── */}
      <circle cx="77" cy="99" r="10" fill="#3B5A9A" />
      <circle cx="127" cy="99" r="10" fill="#3B5A9A" />

      {/* ── EYES: pupils ── */}
      <circle cx="78" cy="100" r="6" fill="#111" />
      <circle cx="128" cy="100" r="6" fill="#111" />

      {/* ── EYES: shine ── */}
      <circle cx="82" cy="95" r="3" fill="white" />
      <circle cx="132" cy="95" r="3" fill="white" />

      {/* ── EYEBROWS ── */}
      <path d="M 62 80 Q 75 73 89 80" stroke={isNinja ? '#DDD' : HAIR} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 111 80 Q 125 73 138 80" stroke={isNinja ? '#DDD' : HAIR} strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* ── MOUTH ── */}
      <path d="M 80 122 Q 100 140 120 122" stroke="#C47070" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* ── GLASSES ── */}
      {hasGlasses && <>
        <circle cx="75" cy="97" r="19" fill="none" stroke="#222" strokeWidth="3" opacity="0.82" />
        <circle cx="125" cy="97" r="19" fill="none" stroke="#222" strokeWidth="3" opacity="0.82" />
        <path d="M 94 97 L 106 97" stroke="#222" strokeWidth="2.5" />
        <path d="M 30 97 L 56 97" stroke="#222" strokeWidth="2.5" />
        <path d="M 144 97 L 170 97" stroke="#222" strokeWidth="2.5" />
      </>}

      {/* ── CROWN ── */}
      {hat === 'crown' && <>
        <rect x="56" y="32" width="88" height="14" rx="4" fill="#F0B429" />
        <polygon points="56,32 70,8 84,28 100,6 116,28 130,8 144,32" fill="#F0B429" />
        <circle cx="100" cy="15" r="5.5" fill="#E53E3E" />
        <circle cx="75" cy="26" r="4" fill="#38A169" />
        <circle cx="125" cy="26" r="4" fill="#3182CE" />
        <path d="M 66 20 L 70 15 L 74 20" stroke="white" strokeWidth="1.5" fill="none" opacity="0.55" />
      </>}

      {/* ── CAPELO ── */}
      {hat === 'capelo' && <>
        <ellipse cx="100" cy="32" rx="68" ry="14" fill="#2C2418" />
        <rect x="75" y="12" width="50" height="22" rx="6" fill="#2C2418" />
        <line x1="158" y1="32" x2="164" y2="58" stroke="#F0B429" strokeWidth="3" />
        <circle cx="164" cy="62" r="5" fill="#F0B429" />
        <line x1="164" y1="62" x2="160" y2="76" stroke="#F0B429" strokeWidth="2" />
        <line x1="164" y1="62" x2="168" y2="76" stroke="#F0B429" strokeWidth="2" />
      </>}

      {/* ── CARTOLA ── */}
      {hat === 'cartola' && <>
        <rect x="64" y="0" width="72" height="56" rx="8" fill="#1A1A2E" />
        <rect x="46" y="50" width="108" height="14" rx="6" fill="#1A1A2E" />
        <rect x="64" y="45" width="72" height="10" rx="3" fill="#D4845A" opacity="0.7" />
      </>}
    </svg>
  )
}
