# WaveTunes 🎵👋

A child-friendly web app that turns your webcam into a musical instrument. Move your hand in front of the camera to play notes — no buttons or keyboard needed!

## How it works

WaveTunes uses **AI hand tracking** (MediaPipe) to watch your hand through the webcam and **Web Audio** (Tone.js) to play sounds.

### Two play modes

| Mode | How to play |
|------|-------------|
| **Magic Zones** | Move your hand up and down to select a colored zone. Open your palm 🖐️ to play — a fist ✊ stays silent. |
| **Finger Count** | Hold up 1–8 fingers to play different notes — 1 finger = red, 2 = orange, and so on. |

Notes use the full **C major scale** (C, D, E, F, G, A, B, C).

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`). Click **Start Playing!** and allow camera access when prompted.

> **Tip:** Use Chrome or Edge for the best hand-tracking performance. Works on phones and tablets too — front camera recommended.

## Build for production

```bash
npm run build
npm run preview
```

## Deployment

The live app is hosted on [pa-legg.github.io](https://pa-legg.github.io) at:

**https://pa-legg.github.io/resources/web-camera-musical-instrument/**

To redeploy after changes, run the workflow on the site repository:

```bash
gh workflow run deploy-wavetunes.yml --repo pa-legg/pa-legg.github.io
```

## Tech stack

- [Vite](https://vitejs.dev/) + TypeScript
- [MediaPipe Hand Landmarker](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) — real-time hand tracking in the browser
- [Tone.js](https://tonejs.github.io/) — Web Audio synthesis

## Privacy

All processing happens **locally in your browser**. No video is uploaded or stored.
