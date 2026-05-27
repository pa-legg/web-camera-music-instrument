import type { HandState } from '../vision/handTracker'
import { NOTES } from '../audio/engine'

export type PlayMode = 'zones' | 'fingers'

export interface PlayEvent {
  noteIndex: number
  triggered: boolean
  zoneIndex: number
}

/** Map hand state to a note index and whether to trigger sound */
export function mapHandToNote(hand: HandState, mode: PlayMode): PlayEvent {
  const zoneCount = NOTES.length

  if (!hand.detected) {
    return { noteIndex: -1, triggered: false, zoneIndex: -1 }
  }

  if (mode === 'fingers') {
    const count = Math.min(hand.fingerCount, zoneCount)
    if (count === 0) {
      return { noteIndex: -1, triggered: false, zoneIndex: -1 }
    }
    const index = count - 1
    return { noteIndex: index, triggered: true, zoneIndex: index }
  }

  // Zone mode: vertical position selects note; pinch or open palm triggers
  const zoneIndex = Math.min(
    zoneCount - 1,
    Math.max(0, Math.floor(hand.fingerTipY * zoneCount)),
  )
  const triggered = hand.isPinching || hand.isOpenPalm || hand.fingerCount >= 2

  return {
    noteIndex: zoneIndex,
    triggered,
    zoneIndex,
  }
}
