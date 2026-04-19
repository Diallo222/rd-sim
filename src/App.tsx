import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";

import { RDSimulation } from "./components/RDSimulation";
import { PRESETS, type PresetKey } from "./constants/presets";

const PRESET_KEYS = Object.keys(PRESETS) as PresetKey[];

export default function App() {
  const [preset, setPreset] = useState<PresetKey>("coral");
  const [seed, setSeed] = useState(0);

  return (
    <div className="fixed inset-0 touch-none bg-[#0a0a0a] font-pixel">
      <Canvas gl={{ antialias: false }}>
        <OrthographicCamera makeDefault position={[0, 0, 1]} />
        <RDSimulation params={PRESETS[preset]} seed={seed} />
      </Canvas>

      {/* Title — code-comment style */}
      <p className="absolute top-5 left-5 select-none pointer-events-none text-2xs tracking-[0.18em] text-white/25 leading-none">
        // rd-sim
      </p>

      {/* Controls */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 select-none w-[calc(100vw-2.5rem)] sm:w-max"
        role="toolbar"
        aria-label="Simulation presets"
      >
        <div className="flex flex-col sm:flex-row border border-white/20 bg-black/75 backdrop-blur-md">

          {/* Preset buttons */}
          <div className="flex sm:contents">
            {PRESET_KEYS.map((key, i) => (
              <button
                key={key}
                type="button"
                aria-pressed={preset === key}
                onClick={() => {
                  setPreset(key);
                  setSeed((s) => s + 1);
                }}
                className={[
                  "relative flex flex-1 sm:flex-none items-center justify-center",
                  "px-4 py-3 text-2xs tracking-[0.12em] transition-none cursor-pointer",
                  i < PRESET_KEYS.length - 1
                    ? "border-r border-white/15"
                    : "sm:border-r sm:border-white/15",
                  preset === key
                    ? "text-white font-bold"
                    : "text-white/35 hover:text-white/70",
                ].join(" ")}
              >
                {/* active underline */}
                {preset === key && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-px bg-white/70"
                    aria-hidden="true"
                  />
                )}
                {PRESETS[key].label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 text-2xs tracking-[0.12em] text-white/25 hover:text-white/55 transition-none cursor-pointer border-t sm:border-t-0 sm:border-l border-white/15"
          >
            <span aria-hidden="true">↺</span>
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}
