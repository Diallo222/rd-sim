# rd-sim

A real-time **Gray-Scott reaction-diffusion** simulation running entirely on the GPU via WebGL fragment shaders. Watch emergent patterns — coral branches, cell mitosis, worm networks, spotted arrays, maze labyrinths — form and evolve from random noise.

---

## What is Reaction-Diffusion?

Reaction-diffusion systems model how two chemical species (A and B) interact as they spread through space. The **Gray-Scott model** uses two parameters to control the behavior:

- **Feed (f)** — rate at which A is replenished
- **Kill (k)** — rate at which B is removed

Small changes to f and k produce radically different pattern regimes. This simulator lets you explore that parameter space in real time.

The update rule per step:

```
dA = Da·∇²A − A·B² + f·(1 − A)
dB = Db·∇²B + A·B² − (k + f)·B
```

---

## Features

| Feature | Description |
|---|---|
| **5 presets** | Coral, Mitosis, Worms, Spots, Maze — each at a distinct (f, k) coordinate |
| **Paint brush** | Hold and drag on the canvas to inject chemical B into the simulation |
| **Pause / Play** | Freeze the simulation at any frame |
| **Speed control** | 1–20 compute steps per frame |
| **Feed & Kill sliders** | Explore the parameter space without resetting |
| **5 colormaps** | Mono, Thermal, Neon, Phosphor, Invert |
| **Boundary modes** | Toroidal wrap (seamless tiling) or Neumann clamp (hard walls) |
| **Resolution** | 128 / 256 / 512 / 1024 — trade detail for performance |
| **Seed patterns** | Random, Center, Grid, Ring, Cross — different initial conditions |
| **Drift mode** | Autonomous slow oscillation of f and k over time |
| **Screenshot** | Export the current frame as a PNG |

---

## Stack

```
React 19 + TypeScript
React Three Fiber / Three.js   — WebGL canvas & render loop
GLSL (ES 1.00)                 — Gray-Scott compute shader + colormap display shader
Tailwind CSS v4                — UI styling
Vite + vite-plugin-glsl        — build tooling
Space Mono                     — UI typeface
```

---

## Architecture

```
src/
├── shaders/
│   ├── fullscreen.vert.glsl     — pass-through vertex shader
│   ├── rd.frag.glsl             — Gray-Scott compute (ping-pong target)
│   └── display.frag.glsl        — colormap display (reads simulation state)
│
├── hooks/
│   └── usePingPong.ts           — two Float32 WebGLRenderTargets, swap on each step
│
├── utils/
│   └── createInitialTexture.ts  — Float32 DataTexture seeded by pattern
│
├── constants/
│   └── presets.ts               — f/k/Da/Db/dt per preset + SimSize/SeedPattern types
│
└── components/
    ├── RDSimulation.tsx         — simulation loop, uniforms, brush, drift, screenshot
    └── SettingsPanel.tsx        — collapsible controls panel
```

### Simulation pipeline (per frame)

```
[useFrame]
    │
    ├─ N × compute pass ──────────────────────────────────┐
    │      rd.frag.glsl reads pingPong.read               │
    │      writes to pingPong.write                       │
    │      swap()                                         ◄┘
    │
    └─ display pass
           display.frag.glsl reads pingPong.read
           renders to screen canvas
```

State is stored as a Float32 RGBA texture pair (ping-pong). The R channel holds concentration A, G holds B. B and A channels are unused.

---

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

```bash
npm run build    # production build
npm run preview  # preview production build
```

---

## Preset Parameter Map

```
kill (k) →
  0.030   0.040   0.050   0.060   0.070   0.080
  ─────────────────────────────────────────────
0.020 │                              maze
0.030 │                   spots
0.040 │         mitosis
0.050 │                              coral
feed  0.060 │
(f)   0.070 │                              worms
0.080 │
```

The parameter space has dozens of other named regimes (fingerprints, bubbles, solitons). Use the Feed/Kill sliders to find them.

---

## Controls

| Input | Action |
|---|---|
| Click + drag on canvas | Paint chemical B |
| `CORAL` / `MITOSIS` / ... | Switch preset and re-seed |
| `↺ RESET` | Re-seed with current preset and pattern |
| `⏸ PAUSE` / `▶ PLAY` | Freeze / resume |
| `⚙ SET` | Toggle settings panel |
| **SPEED slider** | Steps computed per frame (higher = faster evolution) |
| **FEED / KILL sliders** | Live parameter adjustment (no reset) |
| **PAL** | Switch colormap |
| **SEED** | Choose initial pattern shape |
| **WRAP** | Toroidal boundaries vs. clamped walls |
| **DRIFT** | Slowly oscillate f and k autonomously |
| **SIZE** | Simulation grid resolution |
| **↓ SCREENSHOT** | Download current frame as PNG |

---

## License

MIT
