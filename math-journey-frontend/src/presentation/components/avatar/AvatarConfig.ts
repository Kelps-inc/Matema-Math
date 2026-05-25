// Tipos e constantes do sistema de avatar
// Cada valor do banco corresponde a uma entrada aqui.

export const SKIN_TONES   = ['light','light-warm','medium','medium-warm','olive','tan','brown','dark'] as const
export const EYE_COLORS   = ['blue','green','brown','dark-brown','gray','hazel','amber','black'] as const
export const EYE_STYLES   = ['round','almond','narrow','large'] as const
export const NOSE_STYLES  = ['round','wide','thin','dots'] as const
export const BROW_STYLES  = ['normal','thick','thin','angular'] as const
export const MOUTH_STYLES = ['smile','wide','toothed','small'] as const
export const BODY_TYPES   = ['slim','normal','athletic','chubby'] as const
export const HEIGHT_TYPES = ['short','medium','tall'] as const
export const HAIR_STYLES  = ['curto','medio','longo','cacheado','afro','coque','moicano','tranca'] as const
export const GENDERS      = ['masculino','feminino'] as const

export type SkinTone   = typeof SKIN_TONES[number]
export type EyeColor   = typeof EYE_COLORS[number]
export type EyeStyle   = typeof EYE_STYLES[number]
export type NoseStyle  = typeof NOSE_STYLES[number]
export type BrowStyle  = typeof BROW_STYLES[number]
export type MouthStyle = typeof MOUTH_STYLES[number]
export type BodyType   = typeof BODY_TYPES[number]
export type HeightType = typeof HEIGHT_TYPES[number]
export type HairStyle  = typeof HAIR_STYLES[number]
export type Gender     = typeof GENDERS[number]

export interface AvatarConfig {
  skinTone:   SkinTone
  eyeColor:   EyeColor
  eyeStyle:   EyeStyle
  noseStyle:  NoseStyle
  browStyle:  BrowStyle
  mouthStyle: MouthStyle
  bodyType:   BodyType
  heightType: HeightType
  hairStyle:  HairStyle
  gender:     Gender
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone:   'medium',
  eyeColor:   'brown',
  eyeStyle:   'round',
  noseStyle:  'round',
  browStyle:  'normal',
  mouthStyle: 'smile',
  bodyType:   'normal',
  heightType: 'medium',
  hairStyle:  'curto',
  gender:     'masculino',
}

// ── Cores de pele ─────────────────────────────────────────────
export const SKIN_HEX: Record<SkinTone, string> = {
  'light':       '#FDDBB4',
  'light-warm':  '#F5C9A0',
  'medium':      '#E8A87C',
  'medium-warm': '#D4956A',
  'olive':       '#C68A5E',
  'tan':         '#A0633A',
  'brown':       '#7B4A2D',
  'dark':        '#4A2912',
}
export const SKIN_LABELS: Record<SkinTone, string> = {
  'light':       'Clarinha',
  'light-warm':  'Clara',
  'medium':      'Média',
  'medium-warm': 'Média quente',
  'olive':       'Oliva',
  'tan':         'Bronzeada',
  'brown':       'Morena',
  'dark':        'Negra',
}

// ── Cores de olhos ────────────────────────────────────────────
export const EYE_HEX: Record<EyeColor, string> = {
  'blue':       '#4A7FD4',
  'green':      '#4A8C5C',
  'brown':      '#8B5A2B',
  'dark-brown': '#4A2C1A',
  'gray':       '#7A8A96',
  'hazel':      '#8B7035',
  'amber':      '#C47B25',
  'black':      '#1A1008',
}
export const EYE_COLOR_LABELS: Record<EyeColor, string> = {
  'blue':       'Azul',
  'green':      'Verde',
  'brown':      'Castanho',
  'dark-brown': 'Castanho escuro',
  'gray':       'Cinza',
  'hazel':      'Avelã',
  'amber':      'Âmbar',
  'black':      'Preto',
}

// ── Labels ────────────────────────────────────────────────────
export const EYE_STYLE_LABELS: Record<EyeStyle, string> = {
  round: 'Redondo', almond: 'Amendoado', narrow: 'Fino', large: 'Grande',
}
export const NOSE_STYLE_LABELS: Record<NoseStyle, string> = {
  round: 'Redondo', wide: 'Largo', thin: 'Fino', dots: 'Discreto',
}
export const BROW_STYLE_LABELS: Record<BrowStyle, string> = {
  normal: 'Normal', thick: 'Grosso', thin: 'Fino', angular: 'Angular',
}
export const MOUTH_STYLE_LABELS: Record<MouthStyle, string> = {
  smile: 'Sorriso', wide: 'Largo', toothed: 'Dentinho', small: 'Pequeno',
}
export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  slim: 'Magro', normal: 'Normal', athletic: 'Atlético', chubby: 'Gordinho',
}
export const HEIGHT_LABELS: Record<HeightType, string> = {
  short: 'Baixinho', medium: 'Normal', tall: 'Altão',
}
export const HAIR_STYLE_LABELS: Record<HairStyle, string> = {
  curto:    'Curto',
  medio:    'Médio',
  longo:    'Longo',
  cacheado: 'Cacheado',
  afro:     'Afro',
  coque:    'Coque',
  moicano:  'Moicano',
  tranca:   'Trança',
}
export const GENDER_LABELS: Record<Gender, string> = {
  masculino: '♂ Masculino',
  feminino:  '♀ Feminino',
}
