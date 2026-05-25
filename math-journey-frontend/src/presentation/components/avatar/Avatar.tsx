'use client'

import { SKIN_HEX, EYE_HEX, DEFAULT_AVATAR_CONFIG } from './AvatarConfig'
import type {
  AvatarConfig,
  EyeColor,
  EyeStyle,
  NoseStyle,
  BrowStyle,
  MouthStyle,
  BodyType,
  HeightType,
} from './AvatarConfig'

export interface AvatarProps {
  config?: AvatarConfig
  ownedItemNames?: string[]
  size?: number
  className?: string
}

// ─── Color helpers ───────────────────────────────────────────

function darken(hex: string, factor = 0.82): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`
}

function hairColor(skin: string): string {
  const r = parseInt(skin.slice(1, 3), 16)
  if (r > 230) return '#5C3A1E'
  if (r > 200) return '#3A2010'
  if (r > 160) return '#251508'
  return '#100805'
}

// ─── Dimension tables ────────────────────────────────────────

const HEAD_W:   Record<BodyType, number> = { slim: 108, normal: 122, athletic: 116, chubby: 134 }
const HEAD_H:   Record<BodyType, number> = { slim:  96, normal: 108, athletic: 104, chubby: 120 }
const BODY_W:   Record<BodyType, number> = { slim:  46, normal:  62, athletic:  72, chubby:  84 }
const BODY_H:   Record<BodyType, number> = { slim:  58, normal:  68, athletic:  66, chubby:  80 }
const ARM_W:    Record<BodyType, number> = { slim:  18, normal:  22, athletic:  27, chubby:  25 }
const ARM_H:    Record<BodyType, number> = { slim:  60, normal:  64, athletic:  62, chubby:  68 }
const LEG_W:    Record<BodyType, number> = { slim:  16, normal:  20, athletic:  22, chubby:  26 }
const FOOT_RX:  Record<BodyType, number> = { slim:  18, normal:  22, athletic:  24, chubby:  28 }
const LEG_H:    Record<HeightType, number> = { short: 46, medium: 64, tall: 86 }

const STROKE = '#111'
const SW = 3

// ─── Eyes ────────────────────────────────────────────────────

function Eyes({
  style, color, lx, rx, ey,
}: { style: EyeStyle; color: EyeColor; lx: number; rx: number; ey: number }) {
  const c = EYE_HEX[color]
  const shapes: Record<EyeStyle, { erx: number; ery: number }> = {
    round:  { erx: 22, ery: 18 },
    almond: { erx: 23, ery: 14 },
    narrow: { erx: 24, ery: 10 },
    large:  { erx: 26, ery: 24 },
  }
  const { erx, ery } = shapes[style]
  const ir = Math.round(ery * 0.72)
  const pr = Math.round(ery * 0.44)
  const sr = Math.max(2, Math.round(ery * 0.22))
  const shineOX = Math.round(ery * 0.22)
  const shineOY = Math.round(ery * 0.18)

  return (
    <>
      {/* Left */}
      <ellipse cx={lx} cy={ey} rx={erx} ry={ery} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <circle cx={lx} cy={ey + 1} r={ir} fill={c} />
      <circle cx={lx + 1} cy={ey + 2} r={pr} fill="#111" />
      <circle cx={lx + shineOX} cy={ey - shineOY} r={sr} fill="white" />
      {/* Right */}
      <ellipse cx={rx} cy={ey} rx={erx} ry={ery} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <circle cx={rx} cy={ey + 1} r={ir} fill={c} />
      <circle cx={rx - 1} cy={ey + 2} r={pr} fill="#111" />
      <circle cx={rx - shineOX} cy={ey - shineOY} r={sr} fill="white" />
    </>
  )
}

// ─── Eyebrows ────────────────────────────────────────────────

function Brows({
  style, hColor, lx, rx, by,
}: { style: BrowStyle; hColor: string; lx: number; rx: number; by: number }) {
  if (style === 'thick') return (
    <>
      <path d={`M ${lx-18} ${by+3} Q ${lx} ${by-12} ${lx+18} ${by+3}`} stroke={hColor} strokeWidth={9}   fill="none" strokeLinecap="round" />
      <path d={`M ${rx-18} ${by+3} Q ${rx} ${by-12} ${rx+18} ${by+3}`} stroke={hColor} strokeWidth={9}   fill="none" strokeLinecap="round" />
    </>
  )
  if (style === 'thin') return (
    <>
      <path d={`M ${lx-17} ${by} Q ${lx} ${by-7} ${lx+17} ${by}`} stroke={hColor} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <path d={`M ${rx-17} ${by} Q ${rx} ${by-7} ${rx+17} ${by}`} stroke={hColor} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </>
  )
  if (style === 'angular') return (
    <>
      <path d={`M ${lx-17} ${by+5} L ${lx+17} ${by-4}`} stroke={hColor} strokeWidth={6} strokeLinecap="round" />
      <path d={`M ${rx-17} ${by-4} L ${rx+17} ${by+5}`} stroke={hColor} strokeWidth={6} strokeLinecap="round" />
    </>
  )
  return (
    <>
      <path d={`M ${lx-17} ${by+2} Q ${lx} ${by-9} ${lx+17} ${by+2}`} stroke={hColor} strokeWidth={5}   fill="none" strokeLinecap="round" />
      <path d={`M ${rx-17} ${by+2} Q ${rx} ${by-9} ${rx+17} ${by+2}`} stroke={hColor} strokeWidth={5}   fill="none" strokeLinecap="round" />
    </>
  )
}

// ─── Nose ────────────────────────────────────────────────────

function Nose({ style, skin, nx, ny }: { style: NoseStyle; skin: string; nx: number; ny: number }) {
  const nc = darken(skin, 0.78)
  if (style === 'wide') return (
    <>
      <ellipse cx={nx - 7} cy={ny} rx={5} ry={4} fill={nc} stroke={STROKE} strokeWidth={1.5} />
      <ellipse cx={nx + 7} cy={ny} rx={5} ry={4} fill={nc} stroke={STROKE} strokeWidth={1.5} />
    </>
  )
  if (style === 'thin') return <ellipse cx={nx} cy={ny} rx={4} ry={7} fill={nc} stroke={STROKE} strokeWidth={1.5} />
  if (style === 'dots') return (
    <>
      <circle cx={nx - 5} cy={ny} r={3} fill={nc} />
      <circle cx={nx + 5} cy={ny} r={3} fill={nc} />
    </>
  )
  return <circle cx={nx} cy={ny} r={7} fill={nc} stroke={STROKE} strokeWidth={1.5} />
}

// ─── Mouth ───────────────────────────────────────────────────

function Mouth({ style, mx, my }: { style: MouthStyle; mx: number; my: number }) {
  if (style === 'wide') return (
    <path d={`M ${mx-32} ${my} Q ${mx} ${my+22} ${mx+32} ${my}`} stroke={STROKE} strokeWidth={3} fill="none" strokeLinecap="round" />
  )
  if (style === 'toothed') return (
    <>
      <path d={`M ${mx-26} ${my} Q ${mx} ${my+20} ${mx+26} ${my}`} fill="white" stroke={STROKE} strokeWidth={2.5} />
      <line x1={mx-10} y1={my+2} x2={mx-10} y2={my+13} stroke={STROKE} strokeWidth={1.5} opacity={0.5} />
      <line x1={mx}    y1={my+2} x2={mx}    y2={my+18} stroke={STROKE} strokeWidth={1.5} opacity={0.5} />
      <line x1={mx+10} y1={my+2} x2={mx+10} y2={my+13} stroke={STROKE} strokeWidth={1.5} opacity={0.5} />
    </>
  )
  if (style === 'small') return (
    <path d={`M ${mx-16} ${my} Q ${mx} ${my+12} ${mx+16} ${my}`} stroke={STROKE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
  )
  return (
    <path d={`M ${mx-24} ${my} Q ${mx} ${my+18} ${mx+24} ${my}`} stroke={STROKE} strokeWidth={3} fill="none" strokeLinecap="round" />
  )
}

// ─── Accessories ─────────────────────────────────────────────

function Glasses({ lx, rx, ey }: { lx: number; rx: number; ey: number }) {
  return (
    <>
      <rect x={lx-24} y={ey-18} width={48} height={36} rx={10} fill="none" stroke={STROKE} strokeWidth={3} opacity={0.85} />
      <rect x={rx-24} y={ey-18} width={48} height={36} rx={10} fill="none" stroke={STROKE} strokeWidth={3} opacity={0.85} />
      <path d={`M ${lx+24} ${ey} L ${rx-24} ${ey}`}     stroke={STROKE} strokeWidth={2.5} />
      <path d={`M ${lx-24} ${ey-4} L ${lx-40} ${ey+10}`} stroke={STROKE} strokeWidth={2.5} />
      <path d={`M ${rx+24} ${ey-4} L ${rx+40} ${ey+10}`} stroke={STROKE} strokeWidth={2.5} />
    </>
  )
}

function Crown({ hcx, headTop, headW }: { hcx: number; headTop: number; headW: number }) {
  const by = headTop + 6
  const hw = Math.round(headW * 0.44)
  return (
    <>
      <rect x={hcx-hw} y={by-2} width={hw*2} height={18} rx={5} fill="#F0B429" stroke={STROKE} strokeWidth={2} />
      <polygon
        points={`${hcx-hw},${by-2} ${hcx-hw+14},${by-22} ${hcx-hw+30},${by-4} ${hcx},${by-26} ${hcx+hw-30},${by-4} ${hcx+hw-14},${by-22} ${hcx+hw},${by-2}`}
        fill="#F0B429" stroke={STROKE} strokeWidth={2}
      />
      <circle cx={hcx}    cy={by-16} r={6}   fill="#E53E3E" />
      <circle cx={hcx-26} cy={by-6}  r={4.5} fill="#38A169" />
      <circle cx={hcx+26} cy={by-6}  r={4.5} fill="#3182CE" />
    </>
  )
}

function Capelo({ hcx, headTop, headW }: { hcx: number; headTop: number; headW: number }) {
  const by = headTop + 8
  return (
    <>
      <ellipse cx={hcx} cy={by} rx={headW/2+10} ry={14} fill="#2C2418" stroke={STROKE} strokeWidth={2} />
      <rect x={hcx-28} y={by-34} width={56} height={36} rx={7} fill="#2C2418" stroke={STROKE} strokeWidth={2} />
      <line x1={hcx+headW/2+10} y1={by} x2={hcx+headW/2+18} y2={by+36} stroke="#F0B429" strokeWidth={3} />
      <circle cx={hcx+headW/2+18} cy={by+41} r={6} fill="#F0B429" />
    </>
  )
}

function Cartola({ hcx, headTop, headW }: { hcx: number; headTop: number; headW: number }) {
  const by = headTop + 8
  return (
    <>
      <rect x={hcx-40} y={by-72} width={80} height={70} rx={8} fill="#1A1A2E" stroke={STROKE} strokeWidth={2} />
      <rect x={hcx-headW/2+4} y={by-8} width={headW-8} height={20} rx={7} fill="#1A1A2E" stroke={STROKE} strokeWidth={2} />
      <rect x={hcx-40} y={by-18} width={80} height={12} rx={4} fill="#D4845A" opacity={0.75} />
    </>
  )
}

// ─── Main component ──────────────────────────────────────────

export function Avatar({
  config = DEFAULT_AVATAR_CONFIG,
  ownedItemNames = [],
  size = 200,
  className,
}: AvatarProps) {
  const owned = new Set(ownedItemNames.map((n) => n.toLowerCase()))

  const isNinja     = owned.has('ninja da matemática')
  const isMage      = owned.has('mago dos números')
  const isAstronaut = owned.has('astronauta')
  const isScientist = owned.has('cientista')
  const hasGlasses  = owned.has('óculos estilosos')
  const hasCrown    = owned.has('coroa')
  const hasCapelo   = owned.has('capelo')
  const hasCartola  = owned.has('cartola')
  const hat = hasCrown ? 'crown' : hasCapelo ? 'capelo' : hasCartola ? 'cartola' : null

  const bodyColor = isMage ? '#8B7CC4'
    : isAstronaut ? '#DADADA'
    : isScientist ? '#6B9E7A'
    : isNinja     ? '#2C3333'
    : '#D4845A'

  const S     = SKIN_HEX[config.skinTone] ?? SKIN_HEX.medium
  const HAIR  = hairColor(S)
  const CHEEK = darken(S, 0.88)

  // ── Resolved dimensions ──
  const headW  = HEAD_W[config.bodyType]
  const headH  = HEAD_H[config.bodyType]
  const bodyW  = BODY_W[config.bodyType]
  const bodyH  = BODY_H[config.bodyType]
  const armW   = ARM_W[config.bodyType]
  const armH   = ARM_H[config.bodyType]
  const legW   = LEG_W[config.bodyType]
  const footRx = FOOT_RX[config.bodyType]
  const legH   = LEG_H[config.heightType]

  // ── Layout coordinates ──
  const HCX      = 100
  const HEAD_TOP = 28
  const HCY      = HEAD_TOP + headH / 2
  const HEAD_BOT = HEAD_TOP + headH

  const BODY_TOP = HEAD_BOT + 12
  const BODY_BOT = BODY_TOP + bodyH

  const ARM_TOP  = BODY_TOP + 4
  const ARM_LX   = HCX - bodyW / 2 - armW - 2
  const ARM_RX   = HCX + bodyW / 2 + 2
  const HAND_R   = Math.round(armW * 0.68)
  const HAND_Y   = ARM_TOP + armH

  const LEG_TOP  = BODY_BOT - 8
  const LEG_LX   = HCX - bodyW * 0.3 - legW
  const LEG_RX   = HCX + bodyW * 0.3
  const FOOT_Y   = LEG_TOP + legH
  const FOOT_RY  = 11

  const VIEW_H   = FOOT_Y + FOOT_RY + 22

  // ── Face feature positions ──
  const EYE_Y   = HCY - Math.round(headH * 0.04)
  const EYE_LX  = HCX - Math.round(headW * 0.27)
  const EYE_RX  = HCX + Math.round(headW * 0.27)
  const BROW_Y  = EYE_Y - 22
  const NOSE_Y  = HCY + Math.round(headH * 0.12)
  const MOUTH_Y = HCY + Math.round(headH * 0.27)

  return (
    <svg
      width={size}
      height={Math.round((size * VIEW_H) / 200)}
      viewBox={`0 0 200 ${VIEW_H}`}
      className={className}
      aria-hidden
    >
      {/* Ground shadow */}
      <ellipse cx={100} cy={VIEW_H - 5} rx={55} ry={8} fill="#00000018" />

      {/* ── LEGS ── */}
      <rect x={LEG_LX} y={LEG_TOP} width={legW} height={legH} rx={legW / 2} fill={bodyColor} stroke={STROKE} strokeWidth={SW} />
      <rect x={LEG_RX} y={LEG_TOP} width={legW} height={legH} rx={legW / 2} fill={bodyColor} stroke={STROKE} strokeWidth={SW} />

      {/* ── FEET ── */}
      <ellipse cx={LEG_LX + legW / 2 - 5} cy={FOOT_Y} rx={footRx} ry={FOOT_RY} fill={darken(S, 0.62)} stroke={STROKE} strokeWidth={SW} />
      <ellipse cx={LEG_RX + legW / 2 + 5} cy={FOOT_Y} rx={footRx} ry={FOOT_RY} fill={darken(S, 0.62)} stroke={STROKE} strokeWidth={SW} />

      {/* ── ARMS ── */}
      <rect x={ARM_LX} y={ARM_TOP} width={armW} height={armH} rx={armW / 2} fill={bodyColor} stroke={STROKE} strokeWidth={SW} />
      <rect x={ARM_RX} y={ARM_TOP} width={armW} height={armH} rx={armW / 2} fill={bodyColor} stroke={STROKE} strokeWidth={SW} />

      {/* ── HANDS ── */}
      <circle cx={ARM_LX + armW / 2} cy={HAND_Y + HAND_R} r={HAND_R} fill={S} stroke={STROKE} strokeWidth={SW} />
      <circle cx={ARM_RX + armW / 2} cy={HAND_Y + HAND_R} r={HAND_R} fill={S} stroke={STROKE} strokeWidth={SW} />

      {/* ── BODY ── */}
      <rect
        x={HCX - bodyW / 2} y={BODY_TOP}
        width={bodyW} height={bodyH}
        rx={14}
        fill={bodyColor} stroke={STROKE} strokeWidth={SW}
      />

      {/* Outfit details */}
      {isScientist && (
        <path
          d={`M ${HCX - bodyW * 0.45} ${BODY_TOP + 6} L ${HCX} ${BODY_TOP + bodyH * 0.5} L ${HCX + bodyW * 0.45} ${BODY_TOP + 6}`}
          fill="white" opacity={0.5}
        />
      )}
      {isAstronaut && (
        <rect x={HCX - 16} y={BODY_TOP + 8} width={32} height={24} rx={8} fill="white" opacity={0.22} />
      )}
      {isMage && (
        <>
          <text x={HCX - bodyW / 2}     y={BODY_TOP + bodyH * 0.6}  fontSize={14}>⭐</text>
          <text x={HCX + bodyW / 2 - 14} y={BODY_TOP + bodyH * 0.88} fontSize={10}>✨</text>
        </>
      )}
      {isNinja && (
        <rect
          x={HCX - bodyW / 2} y={BODY_TOP + bodyH / 2 - 5}
          width={bodyW} height={10} rx={4}
          fill="#8B0000" opacity={0.85}
        />
      )}

      {/* ── NECK ── */}
      <rect x={HCX - 14} y={HEAD_BOT - 10} width={28} height={24} rx={8} fill={S} />

      {/* ── EARS (before head so head covers inner portion) ── */}
      <ellipse cx={HCX - headW / 2 + 2} cy={HCY + 6} rx={13} ry={16} fill={S} stroke={STROKE} strokeWidth={SW} />
      <ellipse cx={HCX + headW / 2 - 2} cy={HCY + 6} rx={13} ry={16} fill={S} stroke={STROKE} strokeWidth={SW} />
      <ellipse cx={HCX - headW / 2 + 2} cy={HCY + 6} rx={7} ry={9} fill={CHEEK} opacity={0.35} />
      <ellipse cx={HCX + headW / 2 - 2} cy={HCY + 6} rx={7} ry={9} fill={CHEEK} opacity={0.35} />

      {/* ── HEAD — rounded rectangle, FOP style ── */}
      <rect
        x={HCX - headW / 2} y={HEAD_TOP}
        width={headW} height={headH}
        rx={Math.round(headW * 0.22)}
        fill={S} stroke={STROKE} strokeWidth={SW}
      />

      {/* ── HAIR ── */}
      {isNinja ? (
        <>
          {/* Ninja hood covers the top */}
          <rect
            x={HCX - headW / 2 - 4} y={HEAD_TOP - 34}
            width={headW + 8} height={Math.round(headH * 0.58)}
            rx={Math.round(headW * 0.22)}
            fill="#1E2424"
          />
          {/* Lower face wrap */}
          <rect
            x={HCX - headW / 2} y={HEAD_BOT - 22}
            width={headW} height={24} rx={6}
            fill="#1E2424"
          />
        </>
      ) : (
        <>
          {/* Main block — covers top of head */}
          <rect
            x={HCX - headW / 2 - 2} y={HEAD_TOP - 4}
            width={headW + 4} height={Math.round(headH * 0.4)}
            rx={Math.round(headW * 0.22)}
            fill={HAIR}
          />
          {/* Left side tuft */}
          <rect
            x={HCX - headW / 2 - 2}
            y={HEAD_TOP + Math.round(headH * 0.14)}
            width={14} height={Math.round(headH * 0.54)}
            rx={7} fill={HAIR}
          />
          {/* Right side tuft */}
          <rect
            x={HCX + headW / 2 - 12}
            y={HEAD_TOP + Math.round(headH * 0.14)}
            width={14} height={Math.round(headH * 0.54)}
            rx={7} fill={HAIR}
          />
        </>
      )}

      {/* ── CHEEKS ── */}
      <ellipse cx={EYE_LX - 12} cy={MOUTH_Y - 10} rx={14} ry={9} fill={CHEEK} opacity={0.5} />
      <ellipse cx={EYE_RX + 12} cy={MOUTH_Y - 10} rx={14} ry={9} fill={CHEEK} opacity={0.5} />

      {/* ── EYEBROWS ── */}
      <Brows style={config.browStyle} hColor={isNinja ? '#DDD' : HAIR} lx={EYE_LX} rx={EYE_RX} by={BROW_Y} />

      {/* ── EYES ── */}
      <Eyes style={config.eyeStyle} color={config.eyeColor} lx={EYE_LX} rx={EYE_RX} ey={EYE_Y} />

      {/* ── NOSE ── */}
      <Nose style={config.noseStyle} skin={S} nx={HCX} ny={NOSE_Y} />

      {/* ── MOUTH ── */}
      <Mouth style={config.mouthStyle} mx={HCX} my={MOUTH_Y} />

      {/* ── GLASSES ── */}
      {hasGlasses && <Glasses lx={EYE_LX} rx={EYE_RX} ey={EYE_Y} />}

      {/* ── HAT ── */}
      {hat === 'crown'   && <Crown   hcx={HCX} headTop={HEAD_TOP} headW={headW} />}
      {hat === 'capelo'  && <Capelo  hcx={HCX} headTop={HEAD_TOP} headW={headW} />}
      {hat === 'cartola' && <Cartola hcx={HCX} headTop={HEAD_TOP} headW={headW} />}
    </svg>
  )
}
