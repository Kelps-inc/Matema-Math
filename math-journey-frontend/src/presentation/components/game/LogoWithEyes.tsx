'use client'

/**
 * Easter egg: os "olhos" do logo (os símbolos + e ÷) ficam cada vez menos
 * vesgos conforme o usuário sobe de nível.
 *
 * Level 1  → olhos bem cruzados (ângulo ~45°)
 * Level 18+ → olhos perfeitamente alinhados (ângulo 0°)
 */

interface EyeProps {
  /** Ângulo em graus: 0 = olhando para frente, + = olhando para a direita */
  angle: number
  size: number
}

function Eye({ angle, size }: EyeProps) {
  const rad = (angle * Math.PI) / 180
  // Pupila offset a 30% do raio do olho, na direção do ângulo
  const px = 50 + Math.sin(rad) * 30
  const py = 50 - Math.cos(rad) * 30

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'white',
        border: '0.75px solid rgba(0,0,0,0.18)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'all 0.6s ease',
      }}
    >
      {/* Pupila */}
      <div
        style={{
          position: 'absolute',
          width: '46%',
          height: '46%',
          borderRadius: '50%',
          backgroundColor: '#2d1b69',
          left: `${px}%`,
          top: `${py}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.6s ease, top 0.6s ease',
        }}
      />
    </div>
  )
}

interface LogoWithEyesProps {
  level: number
  height?: number
}

export function LogoWithEyes({ level, height = 65 }: LogoWithEyesProps) {
  // Começa vesgo (45°) no nível 1, vai a 0° no nível 18
  const crossAngle = Math.max(0, 45 - (level - 1) * 2.65)

  const eyeSize = Math.round(height * 0.135) // ~9px para h=65

  // Posição dos olhos como fração da imagem (medido no PNG 314×314)
  // + fica em x≈19%, y≈25%   |   ÷ fica em x≈79%, y≈25%
  const leftEyeLeft  = height * 0.19  - eyeSize / 2
  const rightEyeLeft = height * 0.795 - eyeSize / 2
  const eyeTop       = height * 0.245 - eyeSize / 2

  return (
    <div style={{ position: 'relative', height, display: 'inline-block' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/matema-logo.webp"
        alt="Matema"
        style={{ height, width: 'auto', display: 'block' }}
      />

      {/* Olho esquerdo — pupila vira para a direita quando vesgo */}
      <div style={{ position: 'absolute', left: leftEyeLeft, top: eyeTop, pointerEvents: 'none' }}>
        <Eye angle={crossAngle} size={eyeSize} />
      </div>

      {/* Olho direito — pupila vira para a esquerda quando vesgo */}
      <div style={{ position: 'absolute', left: rightEyeLeft, top: eyeTop, pointerEvents: 'none' }}>
        <Eye angle={-crossAngle} size={eyeSize} />
      </div>
    </div>
  )
}
