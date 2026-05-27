import * as Tone from 'tone'

/** C major scale — C through B plus high C */
export const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] as const
export type NoteName = (typeof NOTES)[number]

const NOTE_COLORS = [
  '#ff6b6b',
  '#ffa94d',
  '#ffd43b',
  '#a9e34b',
  '#69db7c',
  '#4dabf7',
  '#9775fa',
  '#da77f2',
]

export function getNoteColor(index: number): string {
  return NOTE_COLORS[index % NOTE_COLORS.length]
}

export class AudioEngine {
  private synth: Tone.PolySynth | null = null
  private lastNote: NoteName | null = null
  private lastTriggerTime = 0
  private readonly retriggerMs = 180

  async start(): Promise<void> {
    await Tone.start()
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.25, sustain: 0.4, release: 0.6 },
    }).toDestination()
    this.synth.volume.value = -6
  }

  playNote(index: number): void {
    if (!this.synth) return
    const clamped = Math.max(0, Math.min(NOTES.length - 1, index))
    const note = NOTES[clamped]
    const now = performance.now()

    if (note === this.lastNote && now - this.lastTriggerTime < this.retriggerMs) return

    this.synth.triggerAttackRelease(note, '8n')
    this.lastNote = note
    this.lastTriggerTime = now
  }

  stop(): void {
    this.synth?.releaseAll()
    this.lastNote = null
  }

  dispose(): void {
    this.synth?.dispose()
    this.synth = null
  }
}
