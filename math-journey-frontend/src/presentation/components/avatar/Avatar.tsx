'use client'

import { SKIN_HEX, EYE_HEX, DEFAULT_AVATAR_CONFIG } from './AvatarConfig'
import type { AvatarConfig, EyeStyle, NoseStyle, BrowStyle, MouthStyle, BodyType, HeightType } from './AvatarConfig'

export interface AvatarProps {
  config?: AvatarConfig
  ownedItemNames?: string[]
  size?: number
  className?: string
}

// ─── Helpers de cor ─────────────────────────────────────────

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

// ─── Dimensões por tipo ──────────────────────────────────────

const BODY_W: Record<BodyType, number> = { slim: 36, normal: 50, athletic: 58, chubby: 66 }
const BODY_H: Record<BodyType, number> = { slim: 56, normal: 64, athletic: 61, chubby: 74 }
const CHEEK_RX: Record<BodyType, number> = { slim: 13, normal: 18, athletic: 15, chubby: 24 }
const CHEEK_RY: Record<BodyType, number> = { slim: 8,  normal: 12, athletic: 10, chubby: 16 }
const HEAD_RX: Record<BodyType, number> = { slim: 76, normal: 80, athletic: 78, chubby: 84 }
const HEAD_RY: Record<BodyType, number> = { slim: 80, normal: 84, athletic: 82, chubby: 90 }

const BODY_Y: Record<HeightType, number>  = { short: 218, medium: 240, tall: 264 }
const ARM_Y: Record<HeightType, number>   = { short: 214, medium: 236, tall: 260 }
const ARM_H: Record<HeightType, number>   = { short: 40,  medium: 46,  tall: 54  }
const VIEW_H: Record<HeightType, number>  = { short: 270, medium: 298, tall: 332 }

const STROKE = '#111'
const SW = 2.5

// ─── Partes do rosto ────────────────────────────────────────

function Eyes({ style, color }: { style: EyeStyle; color: EyeColor }) {
  const EY = 78
  const c = EYE_HEX[color] ?? EYE_HEX.brown

  if (style === 'narrow') return (
    <>
      <ellipse cx={70} cy={EY} rx={22} ry={10} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <ellipse cx={71} cy={EY + 1} rx={13} ry={7} fill={c} />
      <ellipse cx={72} cy={EY + 1} rx={8} ry={4.5} fill="#111" />
      <ellipse cx={76} cy={EY - 3} rx={3.5} ry={2} fill="white" />
      <ellipse cx={130} cy={EY} rx={22} ry={10} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <ellipse cx={129} cy={EY + 1} rx={13} ry={7} fill={c} />
      <ellipse cx={128} cy={EY + 1} rx={8} ry={4.5} fill="#111" />
      <ellipse cx={124} cy={EY - 3} rx={3.5} ry={2} fill="white" />
    </>
  )

  if (style === 'almond') return (
    <>
      <ellipse cx={70} cy={EY} rx={21} ry={14} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <circle cx={71} cy={EY + 1} r={10} fill={c} />
      <circle cx={72} cy={EY + 1} r={6.5} fill="#111" />
      <circle cx={76} cy={EY - 3} r={2.5} fill="white" />
      <ellipse cx={130} cy={EY} rx={21} ry={14} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <circle cx={129} cy={EY + 1} r={10} fill={c} />
      <circle cx={128} cy={EY + 1} r={6.5} fill="#111" />
      <circle cx={124} cy={EY - 3} r={2.5} fill="white" />
    </>
  )

  if (style === 'large') return (
    <>
      <ellipse cx={70} cy={EY} rx={21} ry={24} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <circle cx={71} cy={EY + 2} r={15} fill={c} />
      <circle cx={72} cy={EY + 3} r={10} fill="#111" />
      <circle cx={77} cy={EY - 5} r={5} fill="white" />
      <ellipse cx={130} cy={EY} rx={21} ry={24} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <circle cx={129} cy={EY + 2} r={15} fill={c} />
      <circle cx={128} cy={EY + 3} r={10} fill="#111" />
      <circle cx={123} cy={EY - 5} r={5} fill="white" />
    </>
  )

  // round — estilo Padrinhos Mágicos padrão
  return (
    <>
      <ellipse cx={70} cy={EY} rx={18} ry={21} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <circle cx={71} cy={EY + 2} r={13} fill={c} />
      <circle cx={72} cy={EY + 3} r={8.5} fill="#111" />
      <circle cx={76} cy={EY - 4} r={3.5} fill="white" />
      <ellipse cx={130} cy={EY} rx={18} ry={21} fill="white" stroke={STROKE} strokeWidth={SW - 0.5} />
      <circle cx={129} cy={EY + 2} r={13} fill={c} />
      <circle cx={128} cy={EY + 3} r={8.5} fill="#111" />
      <circle cx={124} cy={EY - 4} r={3.5} fill="white" />
    </>
  )
}

function Brows({ style, hColor }: { style: BrowStyle; hColor: string }) {
  const BY = 63
  if (style === 'thick') return (
    <>
      <path d={`M 56 ${BY + 2} Q 70 ${BY - 10} 86 ${BY + 2}`} stroke={hColor} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M 114 ${BY + 2} Q 130 ${BY - 10} 144 ${BY + 2}`} stroke={hColor} strokeWidth={9} fill="none" strokeLinecap="round" />
    </>
  )
  if (style === 'thin') return (
    <>
      <path d={`M 58 ${BY} Q 70 ${BY - 7} 84 ${BY}`} stroke={hColor} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <path d={`M 116 ${BY} Q 130 ${BY - 7} 142 ${BY}`} stroke={hColor} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </>
  )
  if (style === 'angular') return (
    <>
      <path d={`M 57 ${BY + 5} L 86 ${BY - 3}`} stroke={hColor} strokeWidth={6} strokeLinecap="round" />
      <path d={`M 114 ${BY - 3} L 143 ${BY + 5}`} stroke={hColor} strokeWidth={6} strokeLinecap="round" />
    </>
  )
  return (
    <>
      <path d={`M 57 ${BY + 2} Q 70 ${BY - 8} 85 ${BY + 2}`} stroke={hColor} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M 115 ${BY + 2} Q 130 ${BY - 8} 143 ${BY + 2}`} stroke={hColor} strokeWidth={5} fill="none" strokeLinecap="round" />
    </>
  )
}

function Nose({ style, skin }: { style: NoseStyle; skin: string }) {
  const NY = 106
  const nc = darken(skin, 0.78)
  if (style === 'wide') return <ellipse cx={100} cy={NY} rx={13} ry={7} fill={nc} stroke={STROKE} strokeWidth={1.5} />
  if (style === 'thin')  return <ellipse cx={100} cy={NY} rx={5}  ry={9} fill={nc} stroke={STROKE} strokeWidth={1.5} />
  if (style === 'dots')  return (
    <>
      <circle cx={93} cy={NY + 2} r={4} fill={nc} stroke={STROKE} strokeWidth={1.5} />
      <circle cx={107} cy={NY + 2} r={4} fill={nc} stroke={STROKE} strokeWidth={1.5} />
    </>
  )
  return <circle cx={100} cy={NY} r={9} fill={nc} stroke={STROKE} strokeWidth={1.5} />
}

function Mouth({ style }: { style: MouthStyle }) {
  const MY = 124
  if (style === 'wide') return (
    <path d={`M 60 ${MY} Q 100 ${MY + 24} 140 ${MY}`} stroke={STROKE} strokeWidth={3} fill="none" strokeLinecap="round" />
  )
  if (style === 'toothed') return (
    <>
      <path d={`M 68 ${MY} Q 100 ${MY + 22} 132 ${MY}`} stroke={STROKE} strokeWidth={2.5} fill="white" />
      <path d={`M 68 ${MY} Q 100 ${MY + 22} 132 ${MY}`} stroke={STROKE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <line x1={82} y1={MY + 2} x2={82} y2={MY + 14} stroke={STROKE} strokeWidth={1.5} opacity={0.5} />
      <line x1={100} y1={MY + 2} x2={100} y2={MY + 19} stroke={STROKE} strokeWidth={1.5} opacity={0.5} />
      <line x1={118} y1={MY + 2} x2={118} y2={MY + 14} stroke={STROKE} strokeWidth={1.5} opacity={0.5} />
    </>
  )
  if (style === 'small') return (
    <path d={`M 84 ${MY} Q 100 ${MY + 12} 116 ${MY}`} stroke={STROKE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
  )
  return (
    <path d={`M 72 ${MY} Q 100 ${MY + 20} 128 ${MY}`} stroke={STROKE} strokeWidth={3} fill="none" strokeLinecap="round" />
  )
}

// ─── Acessórios da loja ──────────────────────────────────────

function Glasses() {
  const EY = 78
  return (
    <>
      <circle cx={70} cy={EY} r={21} fill="none" stroke={STROKE} strokeWidth={3} opacity={0.85} />
      <circle cx={130} cy={EY} r={21} fill="none" stroke={STROKE} strokeWidth={3} opacity={0.85} />
      <path d={`M 91 ${EY} L 109 ${EY}`} stroke={STROKE} strokeWidth={2.5} />
      <path d={`M 30 ${EY} L 49 ${EY}`} stroke={STROKE} strokeWidth={2.5} />
      <path d={`M 151 ${EY} L 170 ${EY}`} stroke={STROKE} strokeWidth={2.5} />
    </>
  )
}

function Crown({ hcx, hcy, hrx, hry }: { hcx: number; hcy: number; hrx: number; hry: number }) {
  const baseY = hcy - hry + 14
  return (
    <>
      <rect x={hcx - hrx + 8} y={baseY + 2} width={(hrx - 8) * 2} height={18} rx={5} fill="#F0B429" stroke={STROKE} strokeWidth={2} />
      <polygon
        points={`${hcx - hrx + 8},${baseY + 2} ${hcx - hrx + 22},${baseY - 20} ${hcx - hrx + 38},${baseY - 2} ${hcx},${baseY - 24} ${hcx + hrx - 38},${baseY - 2} ${hcx + hrx - 22},${baseY - 20} ${hcx + hrx - 8},${baseY + 2}`}
        fill="#F0B429" stroke={STROKE} strokeWidth={2}
      />
      <circle cx={hcx} cy={baseY - 14} r={6} fill="#E53E3E" />
      <circle cx={hcx - 28} cy={baseY - 4} r={4.5} fill="#38A169" />
      <circle cx={hcx + 28} cy={baseY - 4} r={4.5} fill="#3182CE" />
    </>
  )
}

function Capelo({ hcx, hcy, hrx, hry }: { hcx: number; hcy: number; hrx: number; hry: number }) {
  const baseY = hcy - hry + 12
  return (
    <>
      <ellipse cx={hcx} cy={baseY} rx={hrx + 10} ry={16} fill="#2C2418" stroke={STROKE} strokeWidth={2} />
      <rect x={hcx - 28} y={baseY - 32} width={56} height={34} rx={7} fill="#2C2418" stroke={STROKE} strokeWidth={2} />
      <line x1={hcx + hrx + 10} y1={baseY} x2={hcx + hrx + 18} y2={baseY + 34} stroke="#F0B429" strokeWidth={3} />
      <circle cx={hcx + hrx + 18} cy={baseY + 39} r={6} fill="#F0B429" />
    </>
  )
}

function Cartola({ hcx, hcy, hrx, hry }: { hcx: number; hcy: number; hrx: number; hry: number }) {
  const baseY = hcy - hry + 12
  return (
    <>
      <rect x={hcx - 40} y={baseY - 66} width={80} height={66} rx={8} fill="#1A1A2E" stroke={STROKE} strokeWidth={2} />
      <rect x={hcx - hrx + 4} y={baseY - 8} width={(hrx - 4) * 2} height={18} rx={6} fill="#1A1A2E" stroke={STROKE} strokeWidth={2} />
      <rect x={hcx - 40} y={baseY - 16} width={80} height={12} rx={4} fill="#D4845A" opacity={0.75} />
    </>
  )
}

// ─── Componente principal ────────────────────────────────────

export function Avatar({ config = DEFAULT_AVATAR_CONFIG, ownedItemNames = [], size = 200, className }: AvatarProps) {
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

  const bodyColor = isMage ? '#8B7CC4' : isAstronaut ? '#DADADA' : isScientist ? '#6B9E7A' : isNinja ? '#2C3333' : '#D4845A'

  const S    = SKIN_HEX[config.skinTone] ?? SKIN_HEX.medium
  const HAIR = hairColor(S)
  const CHEEK = darken(S, 0.88)

  const bW = BODY_W[config.bodyType]
  const bH = BODY_H[config.bodyType]
  const hrx = HEAD_RX[config.bodyType]
  const hry = HEAD_RY[config.bodyType]
  const HCX = 100
  const HCY = 92

  const bodyY = BODY_Y[config.heightType]
  const armY  = ARM_Y[config.heightType]
  const armH  = ARM_H[config.heightType]
  const viewH = VIEW_H[config.heightType]

  // Ajuste sutil: chubby tem cabeça ligeiramente mais baixa
  const headCY = config.bodyType === 'chubby' ? HCY + 4 : HCY

  return (
    <svg
      width={size}
      height={Math.round(size * viewH / 200)}
      viewBox={`0 0 200 ${viewH}`}
      className={className}
      aria-hidden
    >
      {/* Sombra chão */}
      <ellipse cx={100} cy={viewH - 4} rx={52} ry={8} fill="#00000018" />

      {/* ── BRAÇOS ── */}
      <ellipse cx={34} cy={armY} rx={20} ry={armH} fill={bodyColor} stroke={STROKE} strokeWidth={SW} transform={`rotate(-8 34 ${armY})`} />
      <circle cx={29} cy={armY + armH + 10} r={15} fill={S} stroke={STROKE} strokeWidth={SW} />
      <ellipse cx={166} cy={armY} rx={20} ry={armH} fill={bodyColor} stroke={STROKE} strokeWidth={SW} transform={`rotate(8 166 ${armY})`} />
      <circle cx={171} cy={armY + armH + 10} r={15} fill={S} stroke={STROKE} strokeWidth={SW} />

      {/* ── CORPO ── */}
      <ellipse cx={100} cy={bodyY} rx={bW} ry={bH} fill={bodyColor} stroke={STROKE} strokeWidth={SW} />

      {/* Detalhes de roupa */}
      {isScientist && <path d={`M ${100 - bW * 0.48} ${bodyY - bH * 0.44} L 100 ${bodyY - bH * 0.08} L ${100 + bW * 0.48} ${bodyY - bH * 0.44}`} fill="white" opacity={0.52} />}
      {isAstronaut && <rect x={80} y={bodyY - 22} width={40} height={30} rx={10} fill="white" opacity={0.22} />}
      {isMage && <>
        <text x={58} y={bodyY + 12} fontSize={16}>⭐</text>
        <text x={120} y={bodyY + 32} fontSize={12}>✨</text>
      </>}
      {isNinja && <rect x={100 - bW} y={bodyY - 5} width={bW * 2} height={10} rx={4} fill="#8B0000" opacity={0.85} />}

      {/* ── PESCOÇO ── */}
      <rect x={83} y={headCY + hry - 12} width={34} height={24} rx={8} fill={S} />

      {/* ── ORELHAS ── */}
      <circle cx={HCX - hrx + 10} cy={headCY + 6} r={19} fill={S} stroke={STROKE} strokeWidth={SW} />
      <circle cx={HCX + hrx - 10} cy={headCY + 6} r={19} fill={S} stroke={STROKE} strokeWidth={SW} />
      <circle cx={HCX - hrx + 10} cy={headCY + 6} r={11} fill={CHEEK} opacity={0.4} />
      <circle cx={HCX + hrx - 10} cy={headCY + 6} r={11} fill={CHEEK} opacity={0.4} />

      {/* ── CABEÇA ── */}
      <ellipse cx={HCX} cy={headCY} rx={hrx} ry={hry} fill={S} stroke={STROKE} strokeWidth={SW} />

      {/* ── CABELO ── */}
      {!isNinja && !hat && <>
        <ellipse cx={HCX} cy={headCY - hry + 20} rx={hrx} ry={32} fill={HAIR} />
        <ellipse cx={HCX} cy={headCY - hry + 8} rx={hrx - 10} ry={22} fill={HAIR} />
        <ellipse cx={HCX - hrx + 14} cy={headCY - 8} rx={15} ry={28} fill={HAIR} />
        <ellipse cx={HCX + hrx - 14} cy={headCY - 8} rx={15} ry={28} fill={HAIR} />
      </>}
      {/* Capelo/cartola escondem o cabelo do topo */}
      {!isNinja && hat && <>
        <ellipse cx={HCX - hrx + 14} cy={headCY - 8} rx={15} ry={28} fill={HAIR} />
        <ellipse cx={HCX + hrx - 14} cy={headCY - 8} rx={15} ry={28} fill={HAIR} />
      </>}
      {isNinja && <>
        <ellipse cx={HCX} cy={headCY - 50} rx={hrx + 4} ry={38} fill="#1E2424" />
        <rect x={HCX - hrx} y={headCY + 6} width={hrx * 2} height={20} rx={7} fill="#1E2424" />
      </>}

      {/* ── BOCHECHAS ── */}
      <ellipse cx={HCX - 32} cy={115} rx={CHEEK_RX[config.bodyType]} ry={CHEEK_RY[config.bodyType]} fill={CHEEK} opacity={0.55} />
      <ellipse cx={HCX + 32} cy={115} rx={CHEEK_RX[config.bodyType]} ry={CHEEK_RY[config.bodyType]} fill={CHEEK} opacity={0.55} />

      {/* ── SOBRANCELHAS ── */}
      <Brows style={config.browStyle} hColor={isNinja ? '#DDD' : HAIR} />

      {/* ── OLHOS ── */}
      <Eyes style={config.eyeStyle} color={config.eyeColor} />

      {/* ── NARIZ ── */}
      <Nose style={config.noseStyle} skin={S} />

      {/* ── BOCA ── */}
      <Mouth style={config.mouthStyle} />

      {/* ── ÓCULOS ── */}
      {hasGlasses && <Glasses />}

      {/* ── CHAPÉU ── */}
      {hat === 'crown'  && <Crown  hcx={HCX} hcy={headCY} hrx={hrx} hry={hry} />}
      {hat === 'capelo' && <Capelo hcx={HCX} hcy={headCY} hrx={hrx} hry={hry} />}
      {hat === 'cartola' && <Cartola hcx={HCX} hcy={headCY} hrx={hrx} hry={hry} />}
    </svg>
  )
}
