import * as Tone from 'tone'

/** C major scale — C through B plus high C */
export const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] as const
export type NoteName = (typeof NOTES)[number]

export type NoteDurationId = 'crotchet' | 'minim' | 'dotted-minim' | 'semibreve'

export interface NoteDurationOption {
  id: NoteDurationId
  label: string
  beats: number
  symbol: string
  toneValue: Tone.Unit.Time
  hotkey: string
}

/** At 120 BPM: crotchet = 1 beat, minim = 2, dotted minim = 3, semibreve = 4 */
export const NOTE_DURATIONS: readonly NoteDurationOption[] = [
  {
    id: 'crotchet',
    label: 'Crotchet',
    beats: 1,
    symbol: '♩',
    toneValue: '4n',
    hotkey: 'a',
  },
  {
    id: 'minim',
    label: 'Minim',
    beats: 2,
    symbol: '𝅗',
    toneValue: '2n',
    hotkey: 's',
  },
  {
    id: 'dotted-minim',
    label: 'Dotted minim',
    beats: 3,
    symbol: '𝅗.',
    toneValue: '2n.',
    hotkey: 'd',
  },
  {
    id: 'semibreve',
    label: 'Semibreve',
    beats: 4,
    symbol: '𝅝',
    toneValue: '1n',
    hotkey: 'f',
  },
] as const

const BPM = 120

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
  private durationId: NoteDurationId = 'crotchet'

  getDurationId(): NoteDurationId {
    return this.durationId
  }

  setDuration(id: NoteDurationId): void {
    this.durationId = id
  }

  getDurationOption(): NoteDurationOption {
    return NOTE_DURATIONS.find((d) => d.id === this.durationId) ?? NOTE_DURATIONS[0]
  }

  private retriggerMs(): number {
    const beats = this.getDurationOption().beats
    return (beats * 60_000) / BPM
  }

  async start(): Promise<void> {
    await Tone.start()
    Tone.getTransport().bpm.value = BPM
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
    const retriggerMs = this.retriggerMs()

    if (note === this.lastNote && now - this.lastTriggerTime < retriggerMs) return

    this.synth.triggerAttackRelease(note, this.getDurationOption().toneValue)
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
