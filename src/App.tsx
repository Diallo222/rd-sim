import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";

import { RDSimulation } from "./components/RDSimulation";
import { PRESETS, type PresetKey } from "./constants/presets";

export default function App() {
  const [preset, setPreset] = useState<PresetKey>("coral");
  const [seed, setSeed] = useState(0);

  return (
    <div className="fixed inset-0 touch-none bg-black">
      <Canvas gl={{ antialias: false }}>
        <OrthographicCamera makeDefault position={[0, 0, 1]} />
        <RDSimulation params={PRESETS[preset]} seed={seed} />
      </Canvas>

      {/* ── Overlay UI ─────────────────────────────────────────────── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 select-none">
        {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
          <button
            key={key}
            onClick={() => {
              setPreset(key);
              setSeed((s) => s + 1); // re-seed on preset change
            }}
            className={[
              "px-3 py-1 rounded text-sm font-medium transition-colors",
              preset === key
                ? "bg-white text-black"
                : "bg-white/15 text-white/80 hover:bg-white/25",
            ].join(" ")}
          >
            {PRESETS[key].label}
          </button>
        ))}

        <div className="w-px h-5 bg-white/20 mx-1" />

        <button
          onClick={() => setSeed((s) => s + 1)}
          className="px-3 py-1 rounded text-sm font-medium bg-white/15 text-white/80 hover:bg-white/25 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
