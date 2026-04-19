import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";

import { RDSimulation } from "./components/RDSimulation";
import { SettingsPanel } from "./components/SettingsPanel";
import { PRESETS, type PresetKey, type SimSize, type SeedPattern } from "./constants/presets";

const PRESET_KEYS = Object.keys(PRESETS) as PresetKey[];

export default function App() {
  // Core simulation
  const [preset, setPreset] = useState<PresetKey>("coral");
  const [seed, setSeed] = useState(0);
  const [paused, setPaused] = useState(false);

  // Parameter overrides (synced from preset on preset change)
  const [stepsPerFrame, setStepsPerFrame] = useState(PRESETS.coral.stepsPerFrame);
  const [feedOverride, setFeedOverride] = useState(PRESETS.coral.feed);
  const [killOverride, setKillOverride] = useState(PRESETS.coral.kill);

  // Visual / simulation options
  const [colormap, setColormap] = useState(0);
  const [wrapMode, setWrapMode] = useState(true);
  const [simSize, setSimSize] = useState<SimSize>(512);
  const [seedPattern, setSeedPattern] = useState<SeedPattern>("random");
  const [driftMode, setDriftMode] = useState(false);

  // UI
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Refs — no re-renders needed
  const snapshotRef = useRef<(() => void) | null>(null);
  const brushRef = useRef({ x: 0, y: 0, active: false });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePresetChange = (key: PresetKey) => {
    setPreset(key);
    setFeedOverride(PRESETS[key].feed);
    setKillOverride(PRESETS[key].kill);
    setStepsPerFrame(PRESETS[key].stepsPerFrame);
    setSeed(s => s + 1);
  };

  const handleSimSizeChange = (sz: SimSize) => {
    setSimSize(sz);
    setSeed(s => s + 1);
  };

  const handleSeedPatternChange = (p: SeedPattern) => {
    setSeedPattern(p);
    setSeed(s => s + 1);
  };

  // Pointer handlers — write directly to ref, no state update = no re-renders
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    brushRef.current = {
      x: (e.clientX - r.left) / r.width,
      y: 1 - (e.clientY - r.top) / r.height,
      active: true,
    };
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!brushRef.current.active) return;
    const r = e.currentTarget.getBoundingClientRect();
    brushRef.current.x = (e.clientX - r.left) / r.width;
    brushRef.current.y = 1 - (e.clientY - r.top) / r.height;
  };
  const handlePointerUp = () => { brushRef.current.active = false; };
  const handlePointerLeave = () => { brushRef.current.active = false; };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] font-pixel">
      {/* WebGL canvas */}
      <Canvas gl={{ antialias: false, preserveDrawingBuffer: true }}>
        <OrthographicCamera makeDefault position={[0, 0, 1]} />
        <RDSimulation
          params={PRESETS[preset]}
          seed={seed}
          seedPattern={seedPattern}
          paused={paused}
          stepsPerFrame={stepsPerFrame}
          feedOverride={feedOverride}
          killOverride={killOverride}
          colormap={colormap}
          wrapMode={wrapMode}
          simSize={simSize}
          driftMode={driftMode}
          brushRef={brushRef}
          snapshotRef={snapshotRef}
        />
      </Canvas>

      {/* Brush paint target — above canvas, below all UI */}
      <div
        className="absolute inset-0 touch-none"
        style={{ zIndex: 1 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />

      {/* Title */}
      <p
        className="absolute top-5 left-5 select-none pointer-events-none text-2xs tracking-[0.18em] text-white/25 leading-none"
        style={{ zIndex: 2 }}
      >
        // rd-sim
      </p>

      {/* Controls */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 select-none w-[calc(100vw-2.5rem)] sm:w-max"
        style={{ zIndex: 10 }}
      >
        {/* Settings panel — slides up above main bar */}
        {settingsOpen && (
          <SettingsPanel
            stepsPerFrame={stepsPerFrame}
            onStepsChange={setStepsPerFrame}
            feedOverride={feedOverride}
            onFeedChange={setFeedOverride}
            killOverride={killOverride}
            onKillChange={setKillOverride}
            colormap={colormap}
            onColormapChange={setColormap}
            seedPattern={seedPattern}
            onSeedPatternChange={handleSeedPatternChange}
            wrapMode={wrapMode}
            onWrapModeChange={setWrapMode}
            driftMode={driftMode}
            onDriftModeChange={setDriftMode}
            simSize={simSize}
            onSimSizeChange={handleSimSizeChange}
            onSnapshot={() => snapshotRef.current?.()}
          />
        )}

        {/* Main bar */}
        <div className="flex flex-col sm:flex-row border border-white/20 bg-black/75 backdrop-blur-md">

          {/* Row 1 (mobile) / inline (desktop): preset buttons */}
          <div className="flex sm:contents">
            {PRESET_KEYS.map((key, i) => (
              <button
                key={key}
                type="button"
                aria-pressed={preset === key}
                onClick={() => handlePresetChange(key)}
                className={[
                  "relative flex flex-1 sm:flex-none items-center justify-center",
                  "px-3 py-3 text-2xs tracking-[0.08em] transition-none cursor-pointer",
                  i < PRESET_KEYS.length - 1
                    ? "border-r border-white/15"
                    : "sm:border-r sm:border-white/15",
                  preset === key ? "text-white font-bold" : "text-white/35 hover:text-white/70",
                ].join(" ")}
              >
                {preset === key && (
                  <span className="absolute bottom-0 left-2 right-2 h-px bg-white/70" aria-hidden="true" />
                )}
                {PRESETS[key].label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Row 2 (mobile) / inline (desktop): utility buttons */}
          {/* border-t shows on mobile between rows; invisible on desktop (display:contents) */}
          <div className="flex sm:contents border-t border-white/15">
            <button
              type="button"
              aria-label={paused ? "Play" : "Pause"}
              onClick={() => setPaused(p => !p)}
              className="flex flex-1 sm:flex-none items-center justify-center gap-1 px-3 py-3 text-2xs tracking-[0.08em] border-r border-white/15 transition-none cursor-pointer text-white/50 hover:text-white/90"
            >
              {paused ? "▶ PLAY" : "⏸ PAUSE"}
            </button>

            <button
              type="button"
              onClick={() => setSeed(s => s + 1)}
              className="flex flex-1 sm:flex-none items-center justify-center gap-1 px-3 py-3 text-2xs tracking-[0.08em] border-r border-white/15 transition-none cursor-pointer text-white/25 hover:text-white/55"
            >
              <span aria-hidden="true">↺</span> RESET
            </button>

            <button
              type="button"
              aria-expanded={settingsOpen}
              aria-label="Toggle settings"
              onClick={() => setSettingsOpen(o => !o)}
              className={[
                "flex flex-1 sm:flex-none items-center justify-center px-3 py-3 text-2xs tracking-[0.08em] transition-none cursor-pointer",
                settingsOpen ? "text-white" : "text-white/25 hover:text-white/55",
              ].join(" ")}
            >
              ⚙ SET
            </button>
          </div>
        </div>

        {/* Pixel drop-shadow */}
        <div className="h-px bg-white/15 mx-0.5" aria-hidden="true" />
        <div className="h-px bg-white/8 mx-1" aria-hidden="true" />
      </div>
    </div>
  );
}
