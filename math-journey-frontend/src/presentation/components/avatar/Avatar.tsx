'use client'

import { SKIN_HEX, EYE_HEX, HAIR_COLOR_HEX, DEFAULT_AVATAR_CONFIG } from './AvatarConfig'
import type { AvatarConfig, BodyType, HeightType, HairStyle } from './AvatarConfig'

export interface AvatarProps {
  config?: AvatarConfig
  ownedItemNames?: string[]
  size?: number
  className?: string
}

// ─── Pixel constants ─────────────────────────────────────────
const P  = 10   // SVG units per pixel cell
const CX = 10   // center column (0–19)

// ─── Color helpers ────────────────────────────────────────────
function h2r(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function r2h(r: number, g: number, b: number) {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
function dk(hex: string, f: number): string {
  const [r, g, b] = h2r(hex)
  return r2h(Math.round(r * f), Math.round(g * f), Math.round(b * f))
}
function lt(hex: string, f: number): string {
  const [r, g, b] = h2r(hex)
  return r2h(Math.min(255, Math.round(r * f)), Math.min(255, Math.round(g * f)), Math.min(255, Math.round(b * f)))
}
// ─── Dimension tables ─────────────────────────────────────────
const HEAD_HW: Record<BodyType, number>   = { slim: 4, normal: 5, athletic: 5, chubby: 6 }
const BODY_HW: Record<BodyType, number>   = { slim: 3, normal: 4, athletic: 5, chubby: 6 }
const ARM_W:   Record<BodyType, number>   = { slim: 2, normal: 2, athletic: 3, chubby: 3 }
const BODY_H:  Record<BodyType, number>   = { slim: 6, normal: 7, athletic: 7, chubby: 9 }
const LEG_H:   Record<HeightType, number> = { short: 4, medium: 6, tall: 8 }

// ─── Pixel rect ───────────────────────────────────────────────
type PR = [number, number, number, number, string]
const blk = (c: number, r: number, w: number, h: number, color: string): PR => [c, r, w, h, color]

// ─── Hair layers ──────────────────────────────────────────────
// bh = "behind" head (rendered before head fill)
// fr = "front"  head (rendered after head fill, visible on top)

function hairLayers(
  style: HairStyle,
  hat: string | null,
  isNinja: boolean,
  HAIR: string,
  HAIRl: string,
  headL: number,
  headR: number,
  headHW: number,
  HEAD_TOP: number,
  HAIR_ROW: number,
  BODY_TOP: number,
  cx: number,
): { bh: PR[]; fr: PR[] } {
  const bh: PR[] = []
  const fr: PR[] = []
  const topH = HEAD_TOP - HAIR_ROW   // rows available above head

  // ── Ninja hood ──
  if (isNinja) {
    fr.push(blk(headL - 1, HAIR_ROW,    headHW * 2 + 2, topH + 1, '#1E2424'))
    fr.push(blk(headL,     HEAD_TOP + 5, headHW * 2,    3,         '#1E2424'))
    return { bh, fr }
  }

  // ── Hat worn: only small side tufts ──
  if (hat) {
    bh.push(blk(headL - 1, HEAD_TOP + 3, 2, 5, HAIR))
    bh.push(blk(headR - 1, HEAD_TOP + 3, 2, 5, HAIR))
    return { bh, fr }
  }

  // ── Free hair styles ──
  switch (style) {

    case 'curto':
      fr.push(blk(headL - 1, HAIR_ROW, headHW * 2 + 2, topH + 1, HAIR))
      fr.push(blk(headL + 1, HAIR_ROW, 2, 1, HAIRl))
      bh.push(blk(headL - 1, HEAD_TOP, 2, 5, HAIR))
      bh.push(blk(headR - 1, HEAD_TOP, 2, 5, HAIR))
      break

    case 'medio':
      fr.push(blk(headL - 1, HAIR_ROW, headHW * 2 + 2, topH + 1, HAIR))
      fr.push(blk(headL + 1, HAIR_ROW, 2, 1, HAIRl))
      bh.push(blk(headL - 1, HEAD_TOP, 2, 9, HAIR))
      bh.push(blk(headR - 1, HEAD_TOP, 2, 9, HAIR))
      break

    case 'longo':
      fr.push(blk(headL - 1, HAIR_ROW, headHW * 2 + 2, topH + 1, HAIR))
      fr.push(blk(headL + 1, HAIR_ROW, 2, 1, HAIRl))
      bh.push(blk(headL - 1, HEAD_TOP, 3, BODY_TOP - HEAD_TOP + 6, HAIR))
      bh.push(blk(headR - 2, HEAD_TOP, 3, BODY_TOP - HEAD_TOP + 6, HAIR))
      break

    case 'cacheado': {
      // Bumpy zigzag top
      for (let i = 0; i < headHW * 2; i += 2) {
        fr.push(blk(headL + i, HAIR_ROW, 1, topH + 2, HAIR))
      }
      fr.push(blk(headL, HAIR_ROW + 1, headHW * 2, topH, HAIR))
      fr.push(blk(headL + 2, HAIR_ROW, 1, 1, HAIRl))
      // Bumpy sides
      for (let r = 0; r < 8; r += 2) {
        bh.push(blk(headL - 1, HEAD_TOP + r, 2, 1, HAIR))
        bh.push(blk(headR - 1, HEAD_TOP + r, 2, 1, HAIR))
      }
      break
    }

    case 'afro':
      // Wide puff extending beyond head on both sides
      fr.push(blk(headL - 2, HAIR_ROW - 1, headHW * 2 + 4, topH + 3, HAIR))
      fr.push(blk(headL,     HAIR_ROW - 1, 2, 1, HAIRl))
      bh.push(blk(headL - 2, HEAD_TOP, 3, 5, HAIR))
      bh.push(blk(headR - 1, HEAD_TOP, 3, 5, HAIR))
      break

    case 'coque':
      // Compact bun at top center
      fr.push(blk(cx - 2, HAIR_ROW - 1, 4, topH + 2, HAIR))
      fr.push(blk(cx,     HAIR_ROW - 1, 1, 1, HAIRl))
      bh.push(blk(headL - 1, HEAD_TOP + 2, 2, 5, HAIR))
      bh.push(blk(headR - 1, HEAD_TOP + 2, 2, 5, HAIR))
      break

    case 'moicano':
      // Center vertical strip only — shaved sides
      fr.push(blk(cx - 1, HAIR_ROW - 1, 2, topH + 3, HAIR))
      fr.push(blk(cx,     HAIR_ROW - 1, 1, 1, HAIRl))
      break

    case 'tranca': {
      fr.push(blk(headL - 1, HAIR_ROW, headHW * 2 + 2, topH + 1, HAIR))
      fr.push(blk(headL + 1, HAIR_ROW, 2, 1, HAIRl))
      // Segmented braids (alternating shade)
      const braidLen = BODY_TOP - HEAD_TOP + 7
      for (let r = 0; r < braidLen; r++) {
        const c = r % 2 === 0 ? HAIR : dk(HAIR, 0.68)
        bh.push(blk(headL - 1, HEAD_TOP + r, 2, 1, c))
        bh.push(blk(headR - 1, HEAD_TOP + r, 2, 1, c))
      }
      break
    }

    default:
      fr.push(blk(headL - 1, HAIR_ROW, headHW * 2 + 2, topH + 1, HAIR))
      fr.push(blk(headL + 1, HAIR_ROW, 2, 1, HAIRl))
      bh.push(blk(headL - 1, HEAD_TOP, 2, 5, HAIR))
      bh.push(blk(headR - 1, HEAD_TOP, 2, 5, HAIR))
  }

  return { bh, fr }
}

// ─── Main component ───────────────────────────────────────────
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

  const OC  = isMage ? '#7B5EA7' : isAstronaut ? '#C0C4D0' : isScientist ? '#5A8C6E' : isNinja ? '#1E2424' : '#E07B40'
  const OCd = dk(OC, 0.72)

  const S     = SKIN_HEX[config.skinTone]
  const Sd    = dk(S, 0.74)
  const HAIR  = HAIR_COLOR_HEX[config.hairColor ?? 'castanho']
  const HAIRl = lt(HAIR, 1.55)
  const EYE   = EYE_HEX[config.eyeColor]

  const headHW = HEAD_HW[config.bodyType]
  const bodyHW = BODY_HW[config.bodyType]
  const armW   = ARM_W[config.bodyType]
  const bodyH  = BODY_H[config.bodyType]
  const legH   = LEG_H[config.heightType]

  // ── Layout rows ──────────────────────────────────────────────
  const HEAD_TOP  = 5
  const HAIR_ROW  = 1
  const HEAD_BOT  = HEAD_TOP + 9
  const NECK_TOP  = HEAD_BOT
  const BODY_TOP  = NECK_TOP + 2
  const BODY_BOT  = BODY_TOP + bodyH
  const LEG_TOP   = BODY_BOT
  const LEG_BOT   = LEG_TOP + legH
  const FOOT_TOP  = LEG_BOT
  const VIEW_ROWS = FOOT_TOP + 3

  // ── Column positions ─────────────────────────────────────────
  const headL = CX - headHW
  const headR = CX + headHW
  const bodyL = CX - bodyHW
  const bodyR = CX + bodyHW
  const armLL = bodyL - armW
  const armRL = bodyR

  // ── Face positions ────────────────────────────────────────────
  const BROW_R  = HEAD_TOP + 2
  const EYE_R   = HEAD_TOP + 3
  const NOSE_R  = HEAD_TOP + 5
  const MOUTH_R = HEAD_TOP + 7

  // ── Eye dimensions ────────────────────────────────────────────
  const eyeEH = config.eyeStyle === 'narrow' ? 1 : config.eyeStyle === 'large' ? 3 : 2
  const eyeEW = config.eyeStyle === 'almond' ? 3 : 2
  const eyeLc = headL + 1
  const eyeRc = headR - 1 - eyeEW

  // ── Hair ─────────────────────────────────────────────────────
  const { bh: hairBehind, fr: hairFront } = hairLayers(
    config.hairStyle ?? 'curto',
    hat, isNinja,
    HAIR, HAIRl,
    headL, headR, headHW,
    HEAD_TOP, HAIR_ROW, BODY_TOP, CX,
  )

  // ── Render layers ─────────────────────────────────────────────
  const bodyLayer: PR[]  = []   // body, legs, arms (bottom z)
  const behindLayer: PR[] = []  // hair-behind + ears (behind head)
  const headLayer: PR[]  = []   // head skin fill
  const faceLayer: PR[]  = []   // hair-front + face features (top z)
  const glassLayer: PR[] = []   // glasses (topmost)

  // ── OUTLINES ────────────────────────────────────────────────
  bodyLayer.push(blk(headL - 1, HEAD_TOP - 1, headHW * 2 + 2, 11, '#222'))
  bodyLayer.push(blk(CX - 1,   NECK_TOP,      3,               2,  '#222'))
  bodyLayer.push(blk(bodyL - 1, BODY_TOP - 1, bodyHW * 2 + 2, bodyH + 2, '#222'))
  bodyLayer.push(blk(armLL - 1, BODY_TOP - 1, armW + 1, bodyH + 2, '#222'))
  bodyLayer.push(blk(armRL,     BODY_TOP - 1, armW + 1, bodyH + 2, '#222'))
  bodyLayer.push(blk(bodyL - 1, LEG_TOP,      bodyHW + 1, legH + 2, '#222'))
  bodyLayer.push(blk(CX - 1,   LEG_TOP,       bodyHW + 1, legH + 2, '#222'))
  bodyLayer.push(blk(bodyL - 2, FOOT_TOP,     bodyHW + 2, 2, '#222'))
  bodyLayer.push(blk(CX - 1,   FOOT_TOP,      bodyHW + 2, 2, '#222'))

  // ── LEGS ─────────────────────────────────────────────────────
  const legW    = Math.max(2, bodyHW - 1)
  const legPant = dk(OC, 0.82)
  bodyLayer.push(blk(bodyL, LEG_TOP, legW, legH, dk(legPant, 0.88)))
  bodyLayer.push(blk(bodyL, LEG_TOP, legW - 1, legH, legPant))
  bodyLayer.push(blk(CX, LEG_TOP, legW, legH, dk(legPant, 0.88)))
  bodyLayer.push(blk(CX, LEG_TOP, legW - 1, legH, legPant))

  // ── FEET ─────────────────────────────────────────────────────
  const shoeC  = dk(S, 0.45)
  const shoeCl = dk(S, 0.55)
  bodyLayer.push(blk(bodyL - 1, FOOT_TOP, legW + 2, 2, shoeCl))
  bodyLayer.push(blk(CX,        FOOT_TOP, legW + 2, 2, shoeCl))
  bodyLayer.push(blk(bodyL - 1, FOOT_TOP, legW + 1, 1, shoeC))
  bodyLayer.push(blk(CX,        FOOT_TOP, legW + 1, 1, shoeC))

  // ── BODY ─────────────────────────────────────────────────────
  bodyLayer.push(blk(bodyL, BODY_TOP, bodyHW * 2, bodyH, OCd))
  bodyLayer.push(blk(bodyL, BODY_TOP, bodyHW * 2 - 1, bodyH, OC))

  // Female: skirt (covers upper leg area)
  if (config.gender === 'feminino') {
    const SKIRT_H = Math.min(4, legH - 1)   // always leave ≥1 row of leg visible
    const sx = bodyL - 2                     // 1 px wider each side than body outline
    const sw = bodyHW * 2 + 4

    // Side outlines
    bodyLayer.push(blk(sx,          BODY_BOT, 1, SKIRT_H + 1, '#222'))
    bodyLayer.push(blk(sx + sw - 1, BODY_BOT, 1, SKIRT_H + 1, '#222'))
    // Bottom hem
    bodyLayer.push(blk(sx, BODY_BOT + SKIRT_H, sw, 1, '#222'))
    // Fill — covers the top-of-legs area drawn earlier
    bodyLayer.push(blk(sx + 1, BODY_BOT, sw - 2, SKIRT_H, OCd))
    bodyLayer.push(blk(sx + 1, BODY_BOT, sw - 3, SKIRT_H, OC))
    // Center pleat detail
    bodyLayer.push(blk(CX, BODY_BOT + 1, 1, SKIRT_H - 1, dk(OC, 0.82)))
  }

  // Outfit details
  if (isScientist) {
    bodyLayer.push(blk(bodyL,     BODY_TOP, 2, bodyH, '#EEE'))
    bodyLayer.push(blk(bodyR - 2, BODY_TOP, 2, bodyH, '#EEE'))
  }
  if (isAstronaut) {
    bodyLayer.push(blk(CX - 1, BODY_TOP + 1, 3, 2, '#89A8CC'))
  }
  if (isMage) {
    bodyLayer.push(blk(CX - 1, BODY_TOP + 2, 1, 1, '#FFD700'))
    bodyLayer.push(blk(CX,     BODY_TOP + 1, 1, 1, '#FFD700'))
    bodyLayer.push(blk(CX + 1, BODY_TOP + 2, 1, 1, '#FFD700'))
  }
  if (isNinja) {
    bodyLayer.push(blk(bodyL, BODY_TOP + Math.floor(bodyH / 2), bodyHW * 2, 1, '#8B0000'))
  }

  // ── ARMS + HANDS ─────────────────────────────────────────────
  bodyLayer.push(blk(armLL, BODY_TOP, armW, bodyH - 1, OCd))
  bodyLayer.push(blk(armLL, BODY_TOP, armW - 1, bodyH - 1, OC))
  bodyLayer.push(blk(armRL, BODY_TOP, armW, bodyH - 1, OCd))
  bodyLayer.push(blk(armRL, BODY_TOP, armW - 1, bodyH - 1, OC))
  bodyLayer.push(blk(armLL, BODY_BOT - 1, armW, 2, Sd))
  bodyLayer.push(blk(armLL, BODY_BOT - 1, armW - 1, 2, S))
  bodyLayer.push(blk(armRL, BODY_BOT - 1, armW, 2, Sd))
  bodyLayer.push(blk(armRL, BODY_BOT - 1, armW - 1, 2, S))

  // ── NECK ─────────────────────────────────────────────────────
  bodyLayer.push(blk(CX - 1, NECK_TOP, 3, 2, S))
  bodyLayer.push(blk(CX + 1, NECK_TOP, 1, 2, Sd))

  // ── EARS + HAIR BEHIND ───────────────────────────────────────
  behindLayer.push(blk(headL - 1, HEAD_TOP + 3, 1, 3, S))
  behindLayer.push(blk(headR,     HEAD_TOP + 3, 1, 3, S))
  behindLayer.push(blk(headL - 1, HEAD_TOP + 4, 1, 1, Sd))
  behindLayer.push(blk(headR,     HEAD_TOP + 4, 1, 1, Sd))
  hairBehind.forEach((b) => behindLayer.push(b))

  // ── HEAD FILL ────────────────────────────────────────────────
  headLayer.push(blk(headL, HEAD_TOP, headHW * 2, 9, Sd))       // shadow
  headLayer.push(blk(headL, HEAD_TOP, headHW * 2 - 1, 9, S))    // main

  // ── HATS ─────────────────────────────────────────────────────
  if (hat === 'crown') {
    const hw = headHW * 2 + 2
    const hx = headL - 1
    faceLayer.push(blk(hx, HAIR_ROW + 3, hw, 2, '#F0B429'))
    faceLayer.push(blk(hx, HAIR_ROW + 2, 2, 2, '#F0B429'))
    faceLayer.push(blk(hx + Math.floor(hw / 2) - 1, HAIR_ROW + 1, 2, 2, '#F0B429'))
    faceLayer.push(blk(hx + hw - 2, HAIR_ROW + 2, 2, 2, '#F0B429'))
    faceLayer.push(blk(hx + 2, HAIR_ROW + 3, 1, 1, '#E53E3E'))
    faceLayer.push(blk(hx + Math.floor(hw / 2), HAIR_ROW + 2, 1, 1, '#9B1515'))
    faceLayer.push(blk(hx + hw - 3, HAIR_ROW + 3, 1, 1, '#2B5CE6'))
  }
  if (hat === 'capelo') {
    const bw = headHW * 2 + 4
    faceLayer.push(blk(headL - 2, HEAD_TOP - 1, bw, 1, '#2C2418'))
    faceLayer.push(blk(headL, HAIR_ROW - 1, headHW * 2, HEAD_TOP - HAIR_ROW, '#2C2418'))
    faceLayer.push(blk(headR + 1, HEAD_TOP - 1, 1, 3, '#F0B429'))
    faceLayer.push(blk(headR + 1, HEAD_TOP + 1, 2, 1, '#F0B429'))
  }
  if (hat === 'cartola') {
    const bw = headHW * 2 + 4
    faceLayer.push(blk(headL - 2, HEAD_TOP - 1, bw, 1, '#1A1A2E'))
    faceLayer.push(blk(headL + 1, HAIR_ROW - 1, headHW * 2 - 2, HEAD_TOP - HAIR_ROW, '#1A1A2E'))
    faceLayer.push(blk(headL + 1, HAIR_ROW + 1, headHW * 2 - 2, 1, '#D4845A'))
  }

  // ── HAIR FRONT ───────────────────────────────────────────────
  hairFront.forEach((b) => faceLayer.push(b))

  // ── EYEBROWS ─────────────────────────────────────────────────
  const BC  = isNinja ? '#CCC' : HAIR
  const bw2 = config.browStyle === 'thin' ? eyeEW - 1 : eyeEW
  const bh2 = config.browStyle === 'thick' ? 2 : 1

  if (config.browStyle === 'angular') {
    faceLayer.push(blk(eyeLc,             BROW_R,     eyeEW - 1, 1, BC))
    faceLayer.push(blk(eyeLc + eyeEW - 1, BROW_R - 1, 1,         1, BC))
    faceLayer.push(blk(eyeRc,             BROW_R - 1, 1,         1, BC))
    faceLayer.push(blk(eyeRc + 1,         BROW_R,     eyeEW - 1, 1, BC))
  } else {
    faceLayer.push(blk(eyeLc, BROW_R, bw2, bh2, BC))
    faceLayer.push(blk(eyeRc, BROW_R, bw2, bh2, BC))
  }

  // ── EYES ─────────────────────────────────────────────────────
  faceLayer.push(blk(eyeLc, EYE_R, eyeEW, eyeEH, 'white'))
  faceLayer.push(blk(eyeRc, EYE_R, eyeEW, eyeEH, 'white'))
  // Iris
  faceLayer.push(blk(eyeLc,             EYE_R, 1, eyeEH, EYE))
  faceLayer.push(blk(eyeRc + eyeEW - 1, EYE_R, 1, eyeEH, EYE))
  // Pupil
  faceLayer.push(blk(eyeLc,             EYE_R + Math.floor(eyeEH / 2), 1, 1, '#111'))
  faceLayer.push(blk(eyeRc + eyeEW - 1, EYE_R + Math.floor(eyeEH / 2), 1, 1, '#111'))
  // Shine
  faceLayer.push(blk(eyeLc + 1, EYE_R, 1, 1, 'white'))
  faceLayer.push(blk(eyeRc,     EYE_R, 1, 1, 'white'))

  // Female eyelashes
  if (config.gender === 'feminino') {
    faceLayer.push(blk(eyeLc - 1,     EYE_R - 1, 1, 1, '#222'))
    faceLayer.push(blk(eyeLc + eyeEW, EYE_R - 1, 1, 1, '#222'))
    faceLayer.push(blk(eyeRc - 1,     EYE_R - 1, 1, 1, '#222'))
    faceLayer.push(blk(eyeRc + eyeEW, EYE_R - 1, 1, 1, '#222'))
  }

  // ── NOSE ─────────────────────────────────────────────────────
  const NC = dk(S, 0.72)
  if (config.noseStyle === 'dots') {
    faceLayer.push(blk(CX - 1, NOSE_R, 1, 1, NC))
    faceLayer.push(blk(CX + 1, NOSE_R, 1, 1, NC))
  } else if (config.noseStyle === 'wide') {
    faceLayer.push(blk(CX - 1, NOSE_R, 3, 1, NC))
  } else if (config.noseStyle === 'thin') {
    faceLayer.push(blk(CX, NOSE_R, 1, 2, NC))
  } else {
    faceLayer.push(blk(CX - 1, NOSE_R, 2, 1, NC))
    faceLayer.push(blk(CX,     NOSE_R + 1, 1, 1, NC))
  }

  // ── CHEEKS ───────────────────────────────────────────────────
  faceLayer.push(blk(headL,     MOUTH_R - 1, 1, 1, '#FF9999'))
  faceLayer.push(blk(headR - 2, MOUTH_R - 1, 1, 1, '#FF9999'))

  // ── MOUTH ────────────────────────────────────────────────────
  const MW     = config.mouthStyle === 'wide' ? 5 : config.mouthStyle === 'small' ? 2 : 3
  const MX     = CX - Math.floor(MW / 2)
  const DARK_M = '#7A2020'

  if (config.mouthStyle === 'toothed') {
    faceLayer.push(blk(MX, MOUTH_R, MW, 2, 'white'))
    faceLayer.push(blk(MX, MOUTH_R, MW, 1, DARK_M))
    faceLayer.push(blk(MX + 1, MOUTH_R + 1, 1, 1, '#CCC'))
    faceLayer.push(blk(MX + 3, MOUTH_R + 1, 1, 1, '#CCC'))
  } else {
    faceLayer.push(blk(MX, MOUTH_R, MW, 1, DARK_M))
    if (MW >= 3) {
      faceLayer.push(blk(MX,       MOUTH_R + 1, 1, 1, DARK_M))
      faceLayer.push(blk(MX + MW - 1, MOUTH_R + 1, 1, 1, DARK_M))
    }
  }

  // ── GLASSES ──────────────────────────────────────────────────
  if (hasGlasses) {
    const gy = EYE_R - 1
    const gh = eyeEH + 2
    glassLayer.push(blk(eyeLc, EYE_R, eyeEW, eyeEH, '#88AACC'))
    glassLayer.push(blk(eyeRc, EYE_R, eyeEW, eyeEH, '#88AACC'))
    // Left frame
    glassLayer.push(blk(eyeLc - 1, gy, eyeEW + 2, 1, '#333'))
    glassLayer.push(blk(eyeLc - 1, gy + gh, eyeEW + 2, 1, '#333'))
    glassLayer.push(blk(eyeLc - 1, gy, 1, gh + 1, '#333'))
    glassLayer.push(blk(eyeLc + eyeEW, gy, 1, gh + 1, '#333'))
    // Right frame
    glassLayer.push(blk(eyeRc - 1, gy, eyeEW + 2, 1, '#333'))
    glassLayer.push(blk(eyeRc - 1, gy + gh, eyeEW + 2, 1, '#333'))
    glassLayer.push(blk(eyeRc - 1, gy, 1, gh + 1, '#333'))
    glassLayer.push(blk(eyeRc + eyeEW, gy, 1, gh + 1, '#333'))
    // Bridge
    glassLayer.push(blk(eyeLc + eyeEW, EYE_R, eyeRc - eyeLc - eyeEW, 1, '#333'))
    // Temple arms
    glassLayer.push(blk(eyeLc - 2,     gy + 1, 1, 1, '#333'))
    glassLayer.push(blk(eyeRc + eyeEW + 1, gy + 1, 1, 1, '#333'))
  }

  // ── Composite all layers ──────────────────────────────────────
  const ALL = [...bodyLayer, ...behindLayer, ...headLayer, ...faceLayer]

  return (
    <svg
      width={size}
      height={Math.round((size * VIEW_ROWS) / 20)}
      viewBox={`0 0 ${20 * P} ${VIEW_ROWS * P}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {/* Ground shadow */}
      <rect x={(CX - 5) * P} y={(VIEW_ROWS - 1) * P} width={10 * P} height={P} fill="#00000020" />

      {ALL.map(([col, row, w, h, color], i) => (
        <rect key={i} x={col * P} y={row * P} width={w * P} height={h * P} fill={color} />
      ))}

      {/* Glasses on top of everything */}
      {glassLayer.map(([col, row, w, h, color], i) => (
        <rect
          key={`g${i}`}
          x={col * P} y={row * P} width={w * P} height={h * P}
          fill={color}
          opacity={color === '#88AACC' ? 0.45 : 1}
        />
      ))}
    </svg>
  )
}
