import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";

import { RDSimulation } from "./components/RDSimulation";
import { PRESETS, type PresetKey } from "./constants/presets";

export default function App() {
  const [preset, setPreset] = useState<PresetKey>("coral");
  const [seed, setSeed] = useState(0);

  return (
    <div className="fixed inset-0 touch-none bg-[#0a0a0a] font-pixel">
      <Canvas gl={{ antialias: false }}>
        <OrthographicCamera makeDefault position={[0, 0, 1]} />
        <RDSimulation params={PRESETS[preset]} seed={seed} />
      </Canvas>

      {/* Title — top left */}
      <p className="absolute top-4 left-4 select-none pointer-events-none text-white/25 text-2xs tracking-[0.15em] leading-none">
        RD-SIM v1.0
      </p>

      {/* Controls — bottom center */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 select-none"
        role="toolbar"
        aria-label="Simulation presets"
      >
        <div className="flex items-center bg-[#0a0a0a] border-2 border-white/70">
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={preset === key}
              onClick={() => {
                setPreset(key);
                setSeed((s) => s + 1);
              }}
              className={[
                "relative flex items-center justify-center px-3 min-h-[36px] text-2xs tracking-[0.05em] border-r-2 border-white/70 transition-none cursor-pointer",
                preset === key
                  ? "bg-white text-[#0a0a0a]"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {preset === key && (
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-white" aria-hidden="true" />
              )}
              {PRESETS[key].label.toUpperCase()}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="flex items-center justify-center px-3 min-h-[36px] text-2xs tracking-[0.05em] text-white/50 hover:bg-white/10 hover:text-white transition-none cursor-pointer"
          >
            [ RESET ]
          </button>
        </div>

        {/* pixel drop-shadow */}
        <div className="h-0.5 bg-white/20 mx-0.5" aria-hidden="true" />
        <div className="h-0.5 bg-white/10 mx-1" aria-hidden="true" />
      </div>
    </div>
  );
}
