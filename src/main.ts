import './style.css'
import { AudioEngine } from './audio/engine'
import { mapHandToNote, type PlayMode } from './gesture/noteMapper'
import { HandTracker, parseHandResult } from './vision/handTracker'
import { getNoteColor } from './audio/engine'
import {
  addSparkle,
  buildApp,
  buildKeyboard,
  buildZones,
  createSparkle,
  drawOverlay,
  highlightZone,
  setMode,
  setStartLoading,
  showGame,
  showHandHint,
} from './ui/app'

const app = document.getElementById('app')!
app.appendChild(buildApp())

let playMode: PlayMode = 'zones'
let running = false
let rafId = 0

const audio = new AudioEngine()
const tracker = new HandTracker()

const video = () => document.getElementById('video') as HTMLVideoElement
const overlay = () => document.getElementById('overlay') as HTMLCanvasElement
const zonesEl = () => document.getElementById('zones')!
const keyboardEl = () => document.getElementById('keyboard')!
const sparklesEl = () => document.getElementById('sparkles')!
const instructionsEl = () => document.getElementById('instructions') as HTMLElement

buildZones(zonesEl())
buildKeyboard(keyboardEl())

document.querySelectorAll('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    playMode = btn.getAttribute('data-mode') as PlayMode
    setMode(playMode, instructionsEl())
  })
})

async function startCamera(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  })

  const vid = video()
  vid.srcObject = stream
  await vid.play()

  const resize = () => {
    const canvas = overlay()
    canvas.width = vid.videoWidth
    canvas.height = vid.videoHeight
  }
  vid.addEventListener('loadedmetadata', resize)
  resize()
}

function loop(timestamp: number): void {
  if (!running) return

  const result = tracker.detect(video(), timestamp)
  const hand = parseHandResult(result)
  const event = mapHandToNote(hand, playMode)

  showHandHint(!hand.detected)

  const activeIndex = hand.detected ? event.zoneIndex : -1
  const isPlaying = event.triggered && event.noteIndex >= 0

  highlightZone(activeIndex, hand.detected, isPlaying)
  drawOverlay(overlay(), hand, activeIndex)

  if (isPlaying) {
    audio.playNote(event.noteIndex)
    const canvas = overlay()
    const x = hand.fingerTipX * canvas.clientWidth
    const y = hand.fingerTipY * canvas.clientHeight
    addSparkle(
      sparklesEl(),
      createSparkle(x, y, getNoteColor(event.noteIndex)),
    )
  }

  rafId = requestAnimationFrame(loop)
}

document.getElementById('start-btn')!.addEventListener('click', async () => {
  setStartLoading(true)
  try {
    await tracker.init()
    await startCamera()
    await audio.start()
    showGame(true)
    running = true
    rafId = requestAnimationFrame(loop)
  } catch (err) {
    console.error(err)
    alert(
      'Could not start the camera or hand tracking. Please allow camera access and try again.',
    )
  } finally {
    setStartLoading(false)
  }
})

window.addEventListener('beforeunload', () => {
  running = false
  cancelAnimationFrame(rafId)
  tracker.dispose()
  audio.dispose()
  const stream = video()?.srcObject as MediaStream | null
  stream?.getTracks().forEach((t) => t.stop())
})
