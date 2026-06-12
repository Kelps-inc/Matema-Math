/** Web Audio API utilities — music + SFX */

export function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
}

/**
 * Chiptune arcade — 4 songs play in sequence, each looping twice before switching.
 *
 *  Song 1 · 150 BPM · C major  · I-V-vi-IV   (arcade, upbeat)
 *  Song 2 · 120 BPM · G major  · I-V-vi-IV   (relaxed adventure)
 *  Song 3 · 105 BPM · A minor  · i-VI-III-VII (atmospheric, mysterious)
 *  Song 4 · 138 BPM · F major  · I-IV-ii-V   (cheerful, jovial)
 */
export function startAmbientMusic(
  ctx: AudioContext,
  initialVol = 1,
): { stop: () => void; setVolume: (v: number) => void } {
  const BASE_GAIN      = 0.15
  const LOOKAHEAD      = 0.5   // schedule up to 500 ms ahead
  const INTERVAL       = 200   // scheduler tick every 200 ms
  const LOOPS_PER_SONG = 2     // each song plays twice before switching

  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(BASE_GAIN * initialVol, ctx.currentTime + 0.4)
  master.connect(ctx.destination)

  let stopped = false

  // ── note frequency map (C3 – B5, chromatic subset) ──────────────────────
  const N: Record<string, number> = {
    C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, Bb3:233.08, B3:246.94,
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, Fs4:369.99, G4:392.00, A4:440.00, Bb4:466.16, B4:493.88,
    C5:523.25, D5:587.33, E5:659.25, F5:698.46, Fs5:739.99, G5:783.99, A5:880.00, Bb5:932.33, B5:987.77,
    R: 0,
  }

  // ── current beat duration — updated on every song switch ────────────────
  let T = 60 / 150

  // ── synthesis helpers ────────────────────────────────────────────────────
  function playNote(
    freq: number, t: number, beats: number, vol: number,
    type: OscillatorType = 'square',
  ) {
    if (!freq || stopped) return
    const d   = beats * T
    const osc = ctx.createOscillator()
    const g   = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0,          t)
    g.gain.linearRampToValueAtTime(vol,        t + 0.005)
    g.gain.setValueAtTime(vol * 0.75,  t + d * 0.65)
    g.gain.linearRampToValueAtTime(0,          t + d * 0.88)
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

  const noiseBuf  = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.09), ctx.sampleRate)
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

  // ── song definitions ─────────────────────────────────────────────────────
  type Song = { bpm: number; mel: [number, number][]; bas: [number, number][] }

  // Songs in DESCENDING BPM order: 150 → 138 → 120 → 105
  const songs: Song[] = [

    // ── Song 1 · 150 BPM · C major · I-V-vi-IV ──────────────────────────
    {
      bpm: 150,
      mel: [
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
      ],
      bas: [
        ...[0,1].flatMap(() => [[N.C4,.5],[N.E4,.5],[N.G4,.5],[N.E4,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.G3,.5],[N.B3,.5],[N.D4,.5],[N.B3,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.A3,.5],[N.C4,.5],[N.E4,.5],[N.C4,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.F3,.5],[N.A3,.5],[N.C4,.5],[N.A3,.5]] as [number,number][]),
      ],
    },

    // ── Song 2 · 138 BPM · F major · I-IV-ii-V ──────────────────────────
    {
      bpm: 138,
      mel: [
        // Frase A — F (alegre)
        [N.F5,.5],[N.A5,.5],[N.G5,.5],[N.F5,.5],
        [N.C5,1 ],[N.F5,.5],[N.R,.5],
        // Frase B — Bb
        [N.Bb5,.5],[N.A5,.5],[N.G5,.5],[N.F5,.5],
        [N.Bb4,2 ],
        // Frase C — Dm
        [N.D5,.5],[N.F5,.5],[N.A5,.5],[N.F5,.5],
        [N.D5,1 ],[N.E5,.5],[N.F5,.5],
        // Frase D — C
        [N.E5,.5],[N.G5,.5],[N.C5,.5],[N.G4,.5],
        [N.C5,2 ],
        // Frase E — F (arpejo veloz)
        [N.F4,.25],[N.A4,.25],[N.C5,.25],[N.F5,.25],
        [N.A5,.5 ],[N.G5,.5 ],
        [N.F5,.5 ],[N.E5,.5 ],[N.D5,1],
        // Frase F — Bb (descida)
        [N.Bb5,.25],[N.G5,.25],[N.F5,.25],[N.D5,.25],
        [N.Bb4,.5 ],[N.D5,.5 ],
        [N.F5,.5 ],[N.A5,.5 ],[N.Bb5,1],
        // Frase G — Dm
        [N.D5,.5],[N.E5,.5],[N.F5,.5],[N.A5,.5],
        [N.G5,.5],[N.F5,.5],[N.D5,1],
        // Frase H — C → F (resolução)
        [N.C5,.5],[N.E5,.5],[N.G5,.5],[N.C5,.5],
        [N.F5,1 ],[N.R,1],
      ],
      bas: [
        ...[0,1].flatMap(() => [[N.F3,.5],[N.C4,.5],[N.F4,.5],[N.C4,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.Bb3,.5],[N.F3,.5],[N.D4,.5],[N.F3,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.D3,.5],[N.A3,.5],[N.F4,.5],[N.A3,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.C3,.5],[N.G3,.5],[N.E4,.5],[N.G3,.5]] as [number,number][]),
      ],
    },

    // ── Song 3 · 120 BPM · G major · I-V-vi-IV ──────────────────────────
    {
      bpm: 120,
      mel: [
        [N.G4,.5],[N.B4,.5],[N.D5,.5],[N.B4,.5],
        [N.G5,1 ],[N.Fs5,.5],[N.G5,.5],
        [N.Fs5,.5],[N.D5,.5],[N.A4,.5],[N.D5,.5],
        [N.Fs5,1 ],[N.R,1],
        [N.E5,.5],[N.G5,.5],[N.B5,.5],[N.A5,.5],
        [N.G5,1 ],[N.E5,.5],[N.D5,.5],
        [N.C5,.5],[N.B4,.5],[N.A4,.5],[N.G4,.5],
        [N.E4,2 ],
        [N.D5,.25],[N.B4,.25],[N.G4,.25],[N.D4,.25],
        [N.G4,.5 ],[N.B4,.5 ],
        [N.D5,.5 ],[N.G5,.5 ],[N.B5,1],
        [N.A5,.25],[N.Fs5,.25],[N.D5,.25],[N.A4,.25],
        [N.Fs4,.5],[N.A4,.5 ],
        [N.D5,.5 ],[N.Fs5,.5],[N.D5,1],
        [N.E5,.5],[N.Fs5,.5],[N.G5,.5],[N.A5,.5],
        [N.G5,.5],[N.E5,.5 ],[N.B4,1],
        [N.C5,.5],[N.B4,.5],[N.A4,.5],[N.G4,.5],
        [N.D5,.5],[N.G4,.5],[N.R,1],
      ],
      bas: [
        ...[0,1].flatMap(() => [[N.G3,.5],[N.D4,.5],[N.G4,.5],[N.D4,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.D3,.5],[N.A3,.5],[N.Fs4,.5],[N.A3,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.E3,.5],[N.B3,.5],[N.E4,.5],[N.B3,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.C3,.5],[N.G3,.5],[N.E4,.5],[N.G3,.5]] as [number,number][]),
      ],
    },

    // ── Song 4 · 105 BPM · A minor · i-VI-III-VII ────────────────────────
    {
      bpm: 105,
      mel: [
        [N.E5,.5],[N.C5,.5],[N.A4,.5],[N.C5,.5],
        [N.E5,1 ],[N.G5,.5],[N.R,.5],
        [N.F5,.5],[N.A5,.5],[N.C5,.5],[N.A4,.5],
        [N.F4,2 ],
        [N.G5,.5],[N.E5,.5],[N.C5,.5],[N.E5,.5],
        [N.G5,1 ],[N.A5,.5],[N.G5,.5],
        [N.D5,.5],[N.B4,.5],[N.G4,.5],[N.D5,.5],
        [N.G5,1 ],[N.R,1],
        [N.A5,.5],[N.G5,.5],[N.E5,.5],[N.C5,.5],
        [N.A4,1 ],[N.G4,.5],[N.A4,.5],
        [N.F4,.25],[N.A4,.25],[N.C5,.25],[N.F5,.25],
        [N.E5,.5 ],[N.C5,.5 ],[N.A4,1],[N.G4,.5],[N.R,.5],
        [N.C5,.5],[N.E5,.5],[N.G5,.5],[N.E5,.5],
        [N.D5,.5],[N.C5,.5],[N.E5,1],
        [N.D5,.5],[N.B4,.5],[N.G4,.5],[N.E5,.5],
        [N.A4,2 ],
      ],
      bas: [
        ...[0,1].flatMap(() => [[N.A3,.5],[N.E4,.5],[N.A4,.5],[N.E4,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.F3,.5],[N.C4,.5],[N.F4,.5],[N.C4,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.C3,.5],[N.G3,.5],[N.E4,.5],[N.G3,.5]] as [number,number][]),
        ...[0,1].flatMap(() => [[N.G3,.5],[N.D4,.5],[N.G4,.5],[N.D4,.5]] as [number,number][]),
      ],
    },
  ]

  // ── scheduler state ───────────────────────────────────────────────────────
  let songIdx = 0, melLoop = 0
  let melIdx  = 0, melTime = ctx.currentTime
  let basIdx  = 0, basTime = ctx.currentTime
  let drTime  = ctx.currentTime, drBeat = 0

  function schedule() {
    if (stopped) return

    // ── melody + song-switch detection ──────────────────────────────────────
    while (melTime < ctx.currentTime + LOOKAHEAD) {
      const noteIdx = melIdx % songs[songIdx].mel.length

      // Full loop boundary — maybe switch to next song
      if (noteIdx === 0 && melIdx > 0) {
        melLoop++
        if (melLoop >= LOOPS_PER_SONG) {
          melLoop = 0
          songIdx = (songIdx + 1) % songs.length
          melIdx  = 0
          T       = 60 / songs[songIdx].bpm
          // Sync bass and drums to new song start
          basTime = melTime; basIdx = 0
          drTime  = melTime; drBeat = 0
        }
      }

      const [f, b] = songs[songIdx].mel[melIdx % songs[songIdx].mel.length]
      playNote(f, melTime, b, 0.09)
      melTime += b * T
      melIdx++
    }

    // ── bass ────────────────────────────────────────────────────────────────
    while (basTime < ctx.currentTime + LOOKAHEAD) {
      const [f, b] = songs[songIdx].bas[basIdx % songs[songIdx].bas.length]
      playNote(f, basTime, b, 0.065, 'triangle')
      basTime += b * T
      basIdx++
    }

    // ── drums — kick on beats 1 & 3, snare on 2 & 4 ────────────────────────
    while (drTime < ctx.currentTime + LOOKAHEAD) {
      const beat = drBeat % 4
      if (beat === 0 || beat === 2) playKick(drTime)
      else                           playSnare(drTime)
      drTime += T
      drBeat++
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

/**
 * Som de chuva relaxante a partir do arquivo /sounds/rain.mp3.
 * Carrega, decodifica e toca em loop com fade-in/out suave.
 */
export function startRainSound(
  ctx: AudioContext,
  initialVol = 1,
): { stop: () => void; setVolume: (v: number) => void } {
  const BASE_GAIN = 0.6
  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.connect(ctx.destination)

  let src: AudioBufferSourceNode | null = null
  let stopped = false

  fetch('/sounds/rain.mp3')
    .then((r) => r.arrayBuffer())
    .then((arr) => ctx.decodeAudioData(arr))
    .then((buf) => {
      if (stopped) return
      src = ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      src.connect(master)
      src.start()
      master.gain.linearRampToValueAtTime(BASE_GAIN * initialVol, ctx.currentTime + 1.5)
    })
    .catch(() => { /* falhou silenciosamente */ })

  return {
    stop: () => {
      stopped = true
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2)
      setTimeout(() => { try { src?.stop() } catch { /* ok */ } }, 1300)
    },
    setVolume: (v: number) => {
      master.gain.linearRampToValueAtTime(BASE_GAIN * v, ctx.currentTime + 0.2)
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

/**
 * Fanfarra ascendente — level up (vol: 0–1)
 * C4 → E4 → G4 → C5 → E5 → C6 (sparkle)
 */
export function playSfxLevelUp(ctx: AudioContext, vol = 1) {
  function note(freq: number, dt: number, dur: number, type: OscillatorType = 'sine') {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    const t    = ctx.currentTime + dt
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0,             t)
    gain.gain.linearRampToValueAtTime(0.28 * vol, t + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.001,  t + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur + 0.01)
  }

  // Ascending fanfare
  note(261.63, 0.00, 0.22)           // C4
  note(329.63, 0.12, 0.22)           // E4
  note(392.00, 0.24, 0.22)           // G4
  note(523.25, 0.38, 0.40)           // C5
  note(659.25, 0.52, 0.55)           // E5
  // Harmonic richness on the last chord
  note(523.25, 0.52, 0.55, 'triangle')
  // Sparkle high note
  note(1046.50, 0.58, 0.60, 'sine')  // C6
}

/** Dois tons suaves descendentes — resposta errada (vol: 0–1) */
export function playSfxWrong(ctx: AudioContext, vol = 1) {
  const notes: [number, number][] = [[311.13, 0], [246.94, 0.16]]
  notes.forEach(([freq, dt]) => {
    const osc = ctx.createOscillator()
    const softener = ctx.createGain()
    const gain = ctx.createGain()
    const t = ctx.currentTime + dt
    osc.type = 'sine'
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
