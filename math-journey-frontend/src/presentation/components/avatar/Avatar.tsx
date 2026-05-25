'use client'

import { SKIN_HEX, EYE_HEX, DEFAULT_AVATAR_CONFIG } from './AvatarConfig'
import type {
  AvatarConfig,
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

// ─── Pixel size & helpers ────────────────────────────────────
// Each "pixel" = P SVG units. Character grid = 20 cols × variable rows.

const P  = 10   // SVG units per pixel cell
const CX = 10   // center column (character centered)

function h2r(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function r2h(r: number, g: number, b: number) {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
function dk(hex: string, f: number) {
  const [r, g, b] = h2r(hex)
  return r2h(Math.round(r * f), Math.round(g * f), Math.round(b * f))
}
function lt(hex: string, f: number) {
  const [r, g, b] = h2r(hex)
  return r2h(Math.min(255, Math.round(r * f)), Math.min(255, Math.round(g * f)), Math.min(255, Math.round(b * f)))
}

function hairCol(skin: string): string {
  const r = parseInt(skin.slice(1, 3), 16)
  if (r > 230) return '#7B4A2A'
  if (r > 200) return '#5C3018'
  if (r > 160) return '#3A1C08'
  return '#1A0A04'
}

// ─── Dimension tables ────────────────────────────────────────

const HEAD_HW:  Record<BodyType, number>   = { slim: 4, normal: 5, athletic: 5, chubby: 6 }
const BODY_HW:  Record<BodyType, number>   = { slim: 3, normal: 4, athletic: 5, chubby: 6 }
const ARM_W:    Record<BodyType, number>   = { slim: 2, normal: 2, athletic: 3, chubby: 3 }
const BODY_H:   Record<BodyType, number>   = { slim: 6, normal: 7, athletic: 7, chubby: 9 }
const LEG_H:    Record<HeightType, number> = { short: 4, medium: 6, tall: 8 }

// ─── Rect helpers ────────────────────────────────────────────

type PR = [number, number, number, number, string] // [col, row, w, h, color]

function blk(col: number, row: number, w: number, h: number, color: string): PR {
  return [col, row, w, h, color]
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

  const OC = isMage ? '#7B5EA7'
    : isAstronaut ? '#C0C4D0'
    : isScientist ? '#5A8C6E'
    : isNinja     ? '#1E2424'
    : '#E07B40'
  const OCd = dk(OC, 0.72)

  const S    = SKIN_HEX[config.skinTone]
  const Sd   = dk(S, 0.74)
  const HAIR = hairCol(S)
  const HAIRl = lt(HAIR, 1.45)
  const EYE  = EYE_HEX[config.eyeColor]

  // Dimensions
  const headHW = HEAD_HW[config.bodyType]
  const bodyHW = BODY_HW[config.bodyType]
  const armW   = ARM_W[config.bodyType]
  const bodyH  = BODY_H[config.bodyType]
  const legH   = LEG_H[config.heightType]

  // Layout rows
  const HAIR_ROW  = 0
  const HEAD_TOP  = 3
  const HEAD_BOT  = HEAD_TOP + 9    // head is 9 rows
  const NECK_TOP  = HEAD_BOT
  const BODY_TOP  = NECK_TOP + 2
  const BODY_BOT  = BODY_TOP + bodyH
  const LEG_TOP   = BODY_BOT
  const LEG_BOT   = LEG_TOP + legH
  const FOOT_TOP  = LEG_BOT
  const VIEW_ROWS = FOOT_TOP + 3    // foot + shadow

  // Column positions
  const headL = CX - headHW
  const headR = CX + headHW
  const bodyL = CX - bodyHW
  const bodyR = CX + bodyHW
  const armLL = bodyL - armW
  const armRL = bodyR

  // Face positions
  const BROW_R  = HEAD_TOP + 2
  const EYE_R   = HEAD_TOP + 3
  const NOSE_R  = HEAD_TOP + 5
  const MOUTH_R = HEAD_TOP + 7

  // Eye columns (symmetric around CX)
  const eyeEH = config.eyeStyle === 'narrow' ? 1 : config.eyeStyle === 'large' ? 3 : 2
  const eyeEW = config.eyeStyle === 'almond' ? 3 : 2
  const eyeLc = headL + 1
  const eyeRc = headR - 1 - eyeEW

  const blocks: PR[] = []

  // ─── OUTLINE pass: dark shadow under each major shape ─────
  blocks.push(blk(headL - 1, HEAD_TOP - 1, headHW * 2 + 2, 11, '#222'))
  blocks.push(blk(CX - 1,   NECK_TOP,     3,               2,  '#222'))
  blocks.push(blk(bodyL - 1, BODY_TOP - 1, bodyHW * 2 + 2, bodyH + 2, '#222'))
  blocks.push(blk(armLL - 1, BODY_TOP - 1, armW + 1,        bodyH + 2, '#222'))
  blocks.push(blk(armRL,     BODY_TOP - 1, armW + 1,        bodyH + 2, '#222'))
  blocks.push(blk(bodyL - 1, LEG_TOP,      bodyHW + 1,      legH + 2,  '#222'))
  blocks.push(blk(CX - 1,   LEG_TOP,      bodyHW + 1,      legH + 2,  '#222'))
  blocks.push(blk(bodyL - 2, FOOT_TOP,     bodyHW + 2,      2,         '#222'))
  blocks.push(blk(CX - 1,   FOOT_TOP,     bodyHW + 2,      2,         '#222'))

  // ─── LEGS ─────────────────────────────────────────────────
  const legW = Math.max(2, bodyHW - 1)
  const legPantC = dk(OC, 0.82)
  blocks.push(blk(bodyL,  LEG_TOP, legW, legH, dk(legPantC, 0.88))) // left dark
  blocks.push(blk(bodyL,  LEG_TOP, legW - 1, legH, legPantC))         // left
  blocks.push(blk(CX,     LEG_TOP, legW, legH, dk(legPantC, 0.88))) // right dark
  blocks.push(blk(CX,     LEG_TOP, legW - 1, legH, legPantC))         // right

  // ─── FEET ─────────────────────────────────────────────────
  const shoeC = dk(S, 0.45)
  const shoeCl = dk(S, 0.55)
  blocks.push(blk(bodyL - 1, FOOT_TOP, legW + 2, 2, shoeCl))
  blocks.push(blk(CX,        FOOT_TOP, legW + 2, 2, shoeCl))
  blocks.push(blk(bodyL - 1, FOOT_TOP, legW + 1, 1, shoeC))
  blocks.push(blk(CX,        FOOT_TOP, legW + 1, 1, shoeC))

  // ─── BODY ─────────────────────────────────────────────────
  blocks.push(blk(bodyL, BODY_TOP, bodyHW * 2, bodyH, OCd))
  blocks.push(blk(bodyL, BODY_TOP, bodyHW * 2 - 1, bodyH, OC))

  // Outfit details
  if (isScientist) {
    blocks.push(blk(bodyL, BODY_TOP, 2, bodyH, '#EEE'))
    blocks.push(blk(bodyR - 2, BODY_TOP, 2, bodyH, '#EEE'))
  }
  if (isAstronaut) {
    blocks.push(blk(CX - 1, BODY_TOP + 1, 3, 2, '#89A8CC'))
  }
  if (isMage) {
    blocks.push(blk(CX - 1, BODY_TOP + 2, 1, 1, '#FFD700'))
    blocks.push(blk(CX,     BODY_TOP + 1, 1, 1, '#FFD700'))
    blocks.push(blk(CX + 1, BODY_TOP + 2, 1, 1, '#FFD700'))
  }
  if (isNinja) {
    blocks.push(blk(bodyL, BODY_TOP + Math.floor(bodyH / 2), bodyHW * 2, 1, '#8B0000'))
  }

  // ─── ARMS ─────────────────────────────────────────────────
  blocks.push(blk(armLL, BODY_TOP, armW, bodyH - 1, OCd))
  blocks.push(blk(armLL, BODY_TOP, armW - 1, bodyH - 1, OC))
  blocks.push(blk(armRL, BODY_TOP, armW, bodyH - 1, OCd))
  blocks.push(blk(armRL, BODY_TOP, armW - 1, bodyH - 1, OC))

  // ─── HANDS ────────────────────────────────────────────────
  blocks.push(blk(armLL, BODY_BOT - 1, armW, 2, Sd))
  blocks.push(blk(armLL, BODY_BOT - 1, armW - 1, 2, S))
  blocks.push(blk(armRL, BODY_BOT - 1, armW, 2, Sd))
  blocks.push(blk(armRL, BODY_BOT - 1, armW - 1, 2, S))

  // ─── NECK ─────────────────────────────────────────────────
  blocks.push(blk(CX - 1, NECK_TOP, 3, 2, S))
  blocks.push(blk(CX + 1, NECK_TOP, 1, 2, Sd))

  // ─── EARS ─────────────────────────────────────────────────
  blocks.push(blk(headL - 1, HEAD_TOP + 3, 1, 3, S))
  blocks.push(blk(headR,     HEAD_TOP + 3, 1, 3, S))
  blocks.push(blk(headL - 1, HEAD_TOP + 4, 1, 1, Sd))
  blocks.push(blk(headR,     HEAD_TOP + 4, 1, 1, Sd))

  // ─── HEAD ─────────────────────────────────────────────────
  blocks.push(blk(headL, HEAD_TOP, headHW * 2, 9, Sd))         // shadow side
  blocks.push(blk(headL, HEAD_TOP, headHW * 2 - 1, 9, S))      // main face

  // ─── HAIR ─────────────────────────────────────────────────
  if (isNinja) {
    // Hood covers top + lower face
    blocks.push(blk(headL - 1, HAIR_ROW + 1,   headHW * 2 + 2, 6, '#1E2424'))
    blocks.push(blk(headL,     HEAD_TOP + 6,    headHW * 2,     3, '#1E2424'))
  } else if (hat) {
    // Only side hair tufts below hat
    blocks.push(blk(headL - 1, HEAD_TOP + 3, 2, 5, HAIR))
    blocks.push(blk(headR - 1, HEAD_TOP + 3, 2, 5, HAIR))
  } else {
    // Main hair block
    blocks.push(blk(headL - 1, HAIR_ROW,      headHW * 2 + 2, 5, HAIR))
    // Highlight row
    blocks.push(blk(headL + 1, HAIR_ROW,      2, 1, HAIRl))
    // Side tufts extend down
    blocks.push(blk(headL - 1, HEAD_TOP + 2,  2, 6, HAIR))
    blocks.push(blk(headR - 1, HEAD_TOP + 2,  2, 6, HAIR))
  }

  // ─── HATS ─────────────────────────────────────────────────
  if (hat === 'crown') {
    const hw = headHW * 2 + 2
    const hx = headL - 1
    blocks.push(blk(hx, HAIR_ROW + 2, hw, 2, '#F0B429'))            // band
    blocks.push(blk(hx,              HAIR_ROW + 1, 2, 2, '#F0B429')) // left spike
    blocks.push(blk(hx + Math.floor(hw / 2) - 1, HAIR_ROW, 2, 2, '#F0B429')) // mid spike
    blocks.push(blk(hx + hw - 2,     HAIR_ROW + 1, 2, 2, '#F0B429')) // right spike
    blocks.push(blk(hx + 1,          HAIR_ROW + 2, 1, 1, '#E53E3E'))
    blocks.push(blk(hx + Math.floor(hw / 2), HAIR_ROW + 1, 1, 1, '#9B1515'))
    blocks.push(blk(hx + hw - 2,     HAIR_ROW + 2, 1, 1, '#2B5CE6'))
  }
  if (hat === 'capelo') {
    const hw = headHW * 2 + 4
    const hx = headL - 2
    blocks.push(blk(hx,     HAIR_ROW + 3, hw, 1, '#2C2418')) // brim
    blocks.push(blk(headL,  HAIR_ROW,     headHW * 2, 4, '#2C2418')) // top
    blocks.push(blk(headR + 1, HAIR_ROW + 3, 1, 3, '#F0B429')) // tassel line
    blocks.push(blk(headR + 1, HAIR_ROW + 5, 2, 1, '#F0B429')) // tassel end
  }
  if (hat === 'cartola') {
    const bw = headHW * 2 + 4
    blocks.push(blk(headL - 2, HAIR_ROW + 3, bw, 1, '#1A1A2E'))          // brim
    blocks.push(blk(headL + 1, HAIR_ROW - 3, headHW * 2 - 2, 7, '#1A1A2E')) // tall hat
    blocks.push(blk(headL + 1, HAIR_ROW,     headHW * 2 - 2, 1, '#D4845A')) // band
  }

  // ─── EYEBROWS ─────────────────────────────────────────────
  const BC  = isNinja ? '#CCC' : HAIR
  const bh  = config.browStyle === 'thick' ? 2 : 1
  const bw2 = config.browStyle === 'thin' ? eyeEW - 1 : eyeEW

  if (config.browStyle === 'angular') {
    blocks.push(blk(eyeLc,         BROW_R,     eyeEW - 1, 1, BC))
    blocks.push(blk(eyeLc + eyeEW - 1, BROW_R - 1, 1, 1, BC))
    blocks.push(blk(eyeRc,         BROW_R - 1, 1,         1, BC))
    blocks.push(blk(eyeRc + 1,     BROW_R,     eyeEW - 1, 1, BC))
  } else {
    blocks.push(blk(eyeLc, BROW_R, bw2, bh, BC))
    blocks.push(blk(eyeRc, BROW_R, bw2, bh, BC))
  }

  // ─── EYES ─────────────────────────────────────────────────
  // Whites
  blocks.push(blk(eyeLc, EYE_R, eyeEW, eyeEH, 'white'))
  blocks.push(blk(eyeRc, EYE_R, eyeEW, eyeEH, 'white'))
  // Iris
  blocks.push(blk(eyeLc,            EYE_R, 1, eyeEH, EYE))
  blocks.push(blk(eyeRc + eyeEW - 1, EYE_R, 1, eyeEH, EYE))
  // Pupil
  blocks.push(blk(eyeLc,             EYE_R + Math.floor(eyeEH / 2), 1, 1, '#111'))
  blocks.push(blk(eyeRc + eyeEW - 1, EYE_R + Math.floor(eyeEH / 2), 1, 1, '#111'))
  // Shine
  blocks.push(blk(eyeLc + 1, EYE_R, 1, 1, 'white'))
  blocks.push(blk(eyeRc,     EYE_R, 1, 1, 'white'))

  // ─── NOSE ─────────────────────────────────────────────────
  const NC = dk(S, 0.72)
  if (config.noseStyle === 'dots') {
    blocks.push(blk(CX - 1, NOSE_R, 1, 1, NC))
    blocks.push(blk(CX + 1, NOSE_R, 1, 1, NC))
  } else if (config.noseStyle === 'wide') {
    blocks.push(blk(CX - 1, NOSE_R, 3, 1, NC))
  } else if (config.noseStyle === 'thin') {
    blocks.push(blk(CX, NOSE_R, 1, 2, NC))
  } else {
    blocks.push(blk(CX - 1, NOSE_R, 2, 1, NC))
    blocks.push(blk(CX,     NOSE_R + 1, 1, 1, NC))
  }

  // ─── CHEEKS ───────────────────────────────────────────────
  blocks.push(blk(headL,     MOUTH_R - 1, 1, 1, '#FF9999'))
  blocks.push(blk(headR - 2, MOUTH_R - 1, 1, 1, '#FF9999'))

  // ─── MOUTH ────────────────────────────────────────────────
  const MW = config.mouthStyle === 'wide' ? 5
    : config.mouthStyle === 'small' ? 2
    : 3
  const MX = CX - Math.floor(MW / 2)
  const DARK_M = '#7A2020'

  if (config.mouthStyle === 'toothed') {
    blocks.push(blk(MX, MOUTH_R, MW, 2, 'white'))
    blocks.push(blk(MX, MOUTH_R, MW, 1, DARK_M))
    blocks.push(blk(MX + 1, MOUTH_R + 1, 1, 1, '#CCC'))
    blocks.push(blk(MX + 3, MOUTH_R + 1, 1, 1, '#CCC'))
  } else {
    blocks.push(blk(MX, MOUTH_R, MW, 1, DARK_M))
    if (MW >= 3) {
      blocks.push(blk(MX,      MOUTH_R + 1, 1, 1, DARK_M))
      blocks.push(blk(MX + MW - 1, MOUTH_R + 1, 1, 1, DARK_M))
    }
  }

  // ─── GLASSES ──────────────────────────────────────────────
  const glassBlocks: PR[] = []
  if (hasGlasses) {
    const gy = EYE_R - 1
    const gh = eyeEH + 2
    // Lens tint
    glassBlocks.push(blk(eyeLc, EYE_R, eyeEW, eyeEH, '#88AACC'))
    glassBlocks.push(blk(eyeRc, EYE_R, eyeEW, eyeEH, '#88AACC'))
    // Left frame
    glassBlocks.push(blk(eyeLc - 1, gy, eyeEW + 2, 1, '#333'))
    glassBlocks.push(blk(eyeLc - 1, gy + gh, eyeEW + 2, 1, '#333'))
    glassBlocks.push(blk(eyeLc - 1, gy, 1, gh + 1, '#333'))
    glassBlocks.push(blk(eyeLc + eyeEW, gy, 1, gh + 1, '#333'))
    // Right frame
    glassBlocks.push(blk(eyeRc - 1, gy, eyeEW + 2, 1, '#333'))
    glassBlocks.push(blk(eyeRc - 1, gy + gh, eyeEW + 2, 1, '#333'))
    glassBlocks.push(blk(eyeRc - 1, gy, 1, gh + 1, '#333'))
    glassBlocks.push(blk(eyeRc + eyeEW, gy, 1, gh + 1, '#333'))
    // Bridge
    glassBlocks.push(blk(eyeLc + eyeEW, EYE_R, eyeRc - eyeLc - eyeEW, 1, '#333'))
    // Arms
    glassBlocks.push(blk(eyeLc - 2, gy + 1, 1, 1, '#333'))
    glassBlocks.push(blk(eyeRc + eyeEW + 1, gy + 1, 1, 1, '#333'))
  }

  const totalH = VIEW_ROWS
  const totalW = 20

  return (
    <svg
      width={size}
      height={Math.round((size * totalH) / totalW)}
      viewBox={`0 0 ${totalW * P} ${totalH * P}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {/* Ground shadow */}
      <rect
        x={(CX - 5) * P}
        y={(VIEW_ROWS - 1) * P}
        width={10 * P}
        height={P}
        fill="#00000020"
      />

      {/* Character blocks */}
      {blocks.map(([col, row, w, h, color], i) => (
        <rect
          key={i}
          x={col * P}
          y={row * P}
          width={w * P}
          height={h * P}
          fill={color}
        />
      ))}

      {/* Glasses (on top) */}
      {glassBlocks.map(([col, row, w, h, color], i) => (
        <rect
          key={`g${i}`}
          x={col * P}
          y={row * P}
          width={w * P}
          height={h * P}
          fill={color}
          opacity={color === '#88AACC' ? 0.45 : 1}
        />
      ))}
    </svg>
  )
}
