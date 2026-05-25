/** Web Audio API utilities — music + SFX */

export function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
}

/** Ambient drone inspirado no C418 — acorde Am suave com tremolo lento */
export function startAmbientMusic(ctx: AudioContext): () => void {
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 5) // fade-in de 5s
  master.connect(ctx.destination)

  // Delay feedback para sensação de reverb
  const delay = ctx.createDelay(1.5)
  delay.delayTime.setValueAtTime(0.6, ctx.currentTime)
  const delayFb = ctx.createGain()
  delayFb.gain.setValueAtTime(0.25, ctx.currentTime)
  delay.connect(delayFb)
  delayFb.connect(delay)
  delayFb.connect(master)

  // Frequências: A2, E3, A3, C4, E4, G4, A4 (Am7 spread)
  const freqs = [110, 164.81, 220, 261.63, 329.63, 392, 440]
  const oscs: OscillatorNode[] = []
  const lfos: OscillatorNode[] = []

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    const vol = 0.045 * Math.pow(0.72, i)
    oscGain.gain.setValueAtTime(vol, ctx.currentTime)

    // Tremolo muito lento (não sincronizado entre vozes)
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(0.04 + i * 0.013, ctx.currentTime)
    lfoGain.gain.setValueAtTime(vol * 0.35, ctx.currentTime)

    lfo.connect(lfoGain)
    lfoGain.connect(oscGain.gain)
    osc.connect(oscGain)
    oscGain.connect(master)
    oscGain.connect(delay)

    osc.start()
    lfo.start()
    oscs.push(osc)
    lfos.push(lfo)
  })

  return () => {
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
    setTimeout(() => {
      oscs.forEach(o => { try { o.stop() } catch { /* ignore */ } })
      lfos.forEach(l => { try { l.stop() } catch { /* ignore */ } })
    }, 2500)
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
