import { getNoteColor, NOTES } from '../audio/engine'
import type { PlayMode } from '../gesture/noteMapper'
import type { HandState } from '../vision/handTracker'

export interface Sparkle {
  id: number
  x: number
  y: number
  color: string
  size: number
}

let sparkleId = 0

export function createSparkle(x: number, y: number, color: string): Sparkle {
  return {
    id: sparkleId++,
    x,
    y,
    color,
    size: 8 + Math.random() * 16,
  }
}

export function buildApp(): HTMLElement {
  const root = document.createElement('div')
  root.className = 'app'
  root.innerHTML = `
    <header class="header">
      <h1 class="title">🎵 WaveTunes</h1>
      <p class="subtitle">Make music with your hands!</p>
    </header>

    <section class="welcome" id="welcome">
      <div class="welcome-card">
        <div class="welcome-icon">👋🎹</div>
        <h2>Ready to play?</h2>
        <p>We'll use your camera to see your hand and turn your moves into music!</p>
        <button class="btn btn-primary btn-large" id="start-btn" type="button">
          Start Playing!
        </button>
      </div>
    </section>

    <section class="game hidden" id="game">
      <div class="camera-wrap">
        <video id="video" playsinline autoplay muted></video>
        <canvas id="overlay"></canvas>
        <div class="zones" id="zones"></div>
        <div class="sparkles" id="sparkles"></div>
        <div class="hand-hint hidden" id="hand-hint">
          <span>👋 Show your hand!</span>
        </div>
      </div>

      <div class="controls">
        <div class="mode-picker">
          <span class="mode-label">How to play:</span>
          <button class="mode-btn active" data-mode="zones" type="button">
            🌈 Magic Zones
          </button>
          <button class="mode-btn" data-mode="fingers" type="button">
            ✋ Finger Count
          </button>
        </div>
        <p class="instructions" id="instructions">
          Move your hand up &amp; down to pick a color. Pinch or show your palm to play!
        </p>
      </div>

      <div class="keyboard" id="keyboard"></div>
    </section>
  `
  return root
}

export function buildZones(container: HTMLElement): void {
  container.innerHTML = ''
  NOTES.forEach((_, i) => {
    const zone = document.createElement('div')
    zone.className = 'zone'
    zone.dataset.index = String(i)
    zone.style.setProperty('--zone-color', getNoteColor(i))
    zone.style.top = `${(i / NOTES.length) * 100}%`
    zone.style.height = `${100 / NOTES.length}%`
    container.appendChild(zone)
  })
}

export function buildKeyboard(container: HTMLElement): void {
  container.innerHTML = ''
  NOTES.forEach((note, i) => {
    const key = document.createElement('div')
    key.className = 'key'
    key.dataset.index = String(i)
    key.style.setProperty('--key-color', getNoteColor(i))
    key.innerHTML = `<span class="key-note">${note.replace(/\d/, '')}</span>`
    container.appendChild(key)
  })
}

export function setMode(mode: PlayMode, instructionsEl: HTMLElement): void {
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode)
  })

  if (mode === 'zones') {
    instructionsEl.textContent =
      'Move your hand up & down to pick a color. Pinch 👌 or open your palm 🖐️ to play!'
  } else {
    instructionsEl.textContent =
      'Hold up fingers to play! 1 finger = red, 2 = orange, 3 = yellow… up to 6 notes!'
  }
}

export function highlightZone(zoneIndex: number, active: boolean): void {
  document.querySelectorAll('.zone').forEach((el, i) => {
    el.classList.toggle('active', i === zoneIndex && active)
  })
  document.querySelectorAll('.key').forEach((el, i) => {
    el.classList.toggle('playing', i === zoneIndex && active)
  })
}

export function drawOverlay(
  canvas: HTMLCanvasElement,
  hand: HandState,
  zoneIndex: number,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (!hand.detected) return

  const x = hand.fingerTipX * canvas.width
  const y = hand.fingerTipY * canvas.height

  // Hand position dot
  ctx.beginPath()
  ctx.arc(x, y, 18, 0, Math.PI * 2)
  ctx.fillStyle = zoneIndex >= 0 ? getNoteColor(zoneIndex) : '#fff'
  ctx.globalAlpha = 0.85
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 3
  ctx.stroke()

  // Crosshair lines
  ctx.setLineDash([6, 6])
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(canvas.width, y)
  ctx.stroke()
  ctx.setLineDash([])
}

export function addSparkle(container: HTMLElement, sparkle: Sparkle): void {
  const el = document.createElement('div')
  el.className = 'sparkle'
  el.dataset.id = String(sparkle.id)
  el.style.left = `${sparkle.x}px`
  el.style.top = `${sparkle.y}px`
  el.style.width = `${sparkle.size}px`
  el.style.height = `${sparkle.size}px`
  el.style.background = sparkle.color
  container.appendChild(el)
  el.addEventListener('animationend', () => el.remove())
}

export function showHandHint(show: boolean): void {
  document.getElementById('hand-hint')?.classList.toggle('hidden', !show)
}

export function showGame(show: boolean): void {
  document.getElementById('welcome')?.classList.toggle('hidden', show)
  document.getElementById('game')?.classList.toggle('hidden', !show)
}

export function setStartLoading(loading: boolean): void {
  const btn = document.getElementById('start-btn') as HTMLButtonElement | null
  if (!btn) return
  btn.disabled = loading
  btn.textContent = loading ? 'Getting ready…' : 'Start Playing!'
}
