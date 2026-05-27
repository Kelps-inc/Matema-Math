/** Web Audio API utilities — music + SFX */

export function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
}

/** Chiptune arcade original — melodia + baixo + bateria, estilo 8-bit */
export function startAmbientMusic(ctx: AudioContext, initialVol = 1): { stop: () => void; setVolume: (v: number) => void } {
  const BASE_GAIN = 0.15
  const BPM = 150
  const T = 60 / BPM           // duração de 1 beat (0.4 s)
  const LOOKAHEAD = 0.5        // agenda até 500 ms à frente
  const INTERVAL  = 200        // verifica a cada 200 ms

  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(BASE_GAIN * initialVol, ctx.currentTime + 0.4)
  master.connect(ctx.destination)

  let stopped = false

  // ── mapa de notas ──────────────────────────────────────────────────────────
  const N: Record<string, number> = {
    F3:174.61, G3:196.00, A3:220.00, B3:246.94,
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
    C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.00, B5:987.77,
    R:0,
  }

  // ── helpers ────────────────────────────────────────────────────────────────
  function playNote(freq: number, t: number, beats: number, vol: number, type: OscillatorType = 'square') {
    if (!freq || stopped) return
    const d = beats * T
    const osc = ctx.createOscillator()
    const g   = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0,         t)
    g.gain.linearRampToValueAtTime(vol,       t + 0.005)
    g.gain.setValueAtTime(vol * 0.75, t + d * 0.65)
    g.gain.linearRampToValueAtTime(0,         t + d * 0.88)
    osc.connect(g); g.connect(master)
    osc.start(t); osc.stop(t + d)
  }

  function playKick(t: number) {
    const osc = ctx.createOscillator()
    const g   = ctx.createGain()
    osc.frequency.setValueAtTime(130, t)
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.09)
    g.gain.setValueAtTime(0.20, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.13)
    osc.connect(g); g.connect(master)
    osc.start(t); osc.stop(t + 0.14)
  }

  // buffer de ruído pré-gerado para o snare (reaproveitado)
  const noiseBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.09), ctx.sampleRate)
  const noiseData = noiseBuf.getChannelData(0)
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1

  function playSnare(t: number) {
    const src    = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const g      = ctx.createGain()
    src.buffer = noiseBuf
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2200, t)
    filter.Q.setValueAtTime(0.6, t)
    g.gain.setValueAtTime(0.07, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    src.connect(filter); filter.connect(g); g.connect(master)
    src.start(t); src.stop(t + 0.09)
  }

  // ── melodia original (C maior, I-V-vi-IV) ─────────────────────────────────
  const mel: [number, number][] = [
    // Frase A — C
    [N.G5,.5],[N.E5,.5],[N.C5,.5],[N.E5,.5],
    [N.G5,1 ],[N.A5,.5],[N.G5,.5],
    // Frase B — G
    [N.F5,.5],[N.D5,.5],[N.B4,.5],[N.D5,.5],
    [N.F5,1 ],[N.G5,.5],[N.R, .5],
    // Frase C — Am
    [N.E5,.5],[N.C5,.5],[N.A4,.5],[N.C5,.5],
    [N.E5,1 ],[N.D5,.5],[N.E5,.5],
    // Frase D — F
    [N.F5,.5],[N.A5,.5],[N.C5,.5],[N.A5,.5],
    [N.G5,2 ],
    // Frase E — C (corrida ascendente)
    [N.C5,.25],[N.D5,.25],[N.E5,.25],[N.G5,.25],
    [N.A5,.5 ],[N.G5,.5 ],
    [N.E5,.5 ],[N.C5,.5 ],[N.D5,1],
    // Frase F — G (corrida)
    [N.B4,.25],[N.D5,.25],[N.G5,.25],[N.B5,.25],
    [N.D5,.5 ],[N.B4,.5 ],
    [N.A4,.5 ],[N.B4,.5 ],[N.G4,1],
    // Frase G — Am (descida)
    [N.A4,.5],[N.C5,.5],[N.E5,.5],[N.A5,.5],
    [N.G5,.5],[N.E5,.5],[N.C5,1 ],
    // Frase H — F → C (cadência)
    [N.F5,.5],[N.E5,.5],[N.D5,.5],[N.C5,.5],
    [N.E5,.5],[N.G5,.5],[N.C5,1 ],[N.R,1],
  ]

  // ── baixo arpejado (I-V-vi-IV, 2 barras cada) ─────────────────────────────
  const bas: [number, number][] = [
    ...[0,1].flatMap(() => [[N.C4,.5],[N.E4,.5],[N.G4,.5],[N.E4,.5]] as [number,number][]),
    ...[0,1].flatMap(() => [[N.G3,.5],[N.B3,.5],[N.D4,.5],[N.B3,.5]] as [number,number][]),
    ...[0,1].flatMap(() => [[N.A3,.5],[N.C4,.5],[N.E4,.5],[N.C4,.5]] as [number,number][]),
    ...[0,1].flatMap(() => [[N.F3,.5],[N.A3,.5],[N.C4,.5],[N.A3,.5]] as [number,number][]),
  ]

  // ── agendador ──────────────────────────────────────────────────────────────
  let melTime = ctx.currentTime, melIdx  = 0
  let basTime = ctx.currentTime, basIdx  = 0
  let drTime  = ctx.currentTime, drBeat = 0

  function schedule() {
    if (stopped) return

    // melodia
    while (melTime < ctx.currentTime + LOOKAHEAD) {
      const [f, b] = mel[melIdx % mel.length]
      playNote(f, melTime, b, 0.09)
      melTime += b * T; melIdx++
    }
    // baixo
    while (basTime < ctx.currentTime + LOOKAHEAD) {
      const [f, b] = bas[basIdx % bas.length]
      playNote(f, basTime, b, 0.065, 'triangle')
      basTime += b * T; basIdx++
    }
    // bateria — kick no 1 e 3, snare no 2 e 4 (quarter notes)
    while (drTime < ctx.currentTime + LOOKAHEAD) {
      const beat = drBeat % 4
      if (beat === 0 || beat === 2) playKick(drTime)
      else                          playSnare(drTime)
      drTime += T; drBeat++
    }
  }

  schedule()
  const id = setInterval(schedule, INTERVAL)

  return {
    stop: () => {
      stopped = true
      clearInterval(id)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
    },
    setVolume: (v: number) => {
      master.gain.linearRampToValueAtTime(BASE_GAIN * v, ctx.currentTime + 0.15)
    },
  }
}

/** Clique discreto ao selecionar opção (vol: 0–1) */
export function playSfxClick(ctx: AudioContext, vol = 1) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(640, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05)
  gain.gain.setValueAtTime(0.055 * vol, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.09)
}

/** Arpejo suave ascendente — resposta correta (vol: 0–1) */
export function playSfxCorrect(ctx: AudioContext, vol = 1) {
  const notes: [number, number][] = [[523.25, 0], [659.25, 0.1], [783.99, 0.2]]
  notes.forEach(([freq, dt]) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t = ctx.currentTime + dt
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.1 * vol, t + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.38)
  })
}

/** Dois tons suaves descendentes — resposta errada (vol: 0–1) */
export function playSfxWrong(ctx: AudioContext, vol = 1) {
  const notes: [number, number][] = [[311.13, 0], [246.94, 0.16]]
  notes.forEach(([freq, dt]) => {
    const osc = ctx.createOscillator()
    const softener = ctx.createGain()
    const gain = ctx.createGain()
    const t = ctx.currentTime + dt
    osc.type = 'sine' // sine em vez de sawtooth — mais suave
    osc.frequency.setValueAtTime(freq, t)
    softener.gain.setValueAtTime(1, t)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.09 * vol, t + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
    osc.connect(softener)
    softener.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.35)
  })
}
