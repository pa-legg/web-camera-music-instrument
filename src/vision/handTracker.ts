import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision'

export interface HandState {
  detected: boolean
  /** Normalized 0–1, 0 = top of frame */
  fingerTipY: number
  /** Normalized 0–1 */
  fingerTipX: number
  /** Number of extended fingers (0–5) */
  fingerCount: number
  /** Pinch: thumb and index tips are close */
  isPinching: boolean
  /** Open palm: 4+ fingers extended */
  isOpenPalm: boolean
}

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task'

function isFingerExtended(
  landmarks: { x: number; y: number; z: number }[],
  tipIdx: number,
  pipIdx: number,
): boolean {
  return landmarks[tipIdx].y < landmarks[pipIdx].y - 0.02
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function parseHandResult(result: HandLandmarkerResult | null): HandState {
  const empty: HandState = {
    detected: false,
    fingerTipY: 0.5,
    fingerTipX: 0.5,
    fingerCount: 0,
    isPinching: false,
    isOpenPalm: false,
  }

  if (!result?.landmarks.length) return empty

  const lm = result.landmarks[0]
  const indexTip = lm[8]
  const thumbTip = lm[4]

  const extended = [
    isFingerExtended(lm, 8, 6), // index
    isFingerExtended(lm, 12, 10), // middle
    isFingerExtended(lm, 16, 14), // ring
    isFingerExtended(lm, 20, 18), // pinky
    isFingerExtended(lm, 4, 3), // thumb (approximate)
  ]
  const fingerCount = extended.filter(Boolean).length
  const pinchDist = distance(thumbTip, indexTip)

  return {
    detected: true,
    fingerTipY: indexTip.y,
    fingerTipX: indexTip.x,
    fingerCount,
    isPinching: pinchDist < 0.06,
    isOpenPalm: fingerCount >= 4,
  }
}

export class HandTracker {
  private landmarker: HandLandmarker | null = null

  async init(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE)
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 1,
    })
  }

  detect(video: HTMLVideoElement, timestampMs: number): HandLandmarkerResult | null {
    if (!this.landmarker || video.readyState < 2) return null
    return this.landmarker.detectForVideo(video, timestampMs)
  }

  dispose(): void {
    this.landmarker?.close()
    this.landmarker = null
  }
}
