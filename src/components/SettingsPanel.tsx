import type { SimSize, SeedPattern } from "../constants/presets";

const COLORMAPS = ["MONO", "THERMAL", "NEON", "PHOSPHOR", "INVERT"] as const;
const PATTERNS: SeedPattern[] = ["random", "center", "grid", "ring", "cross"];
const SIZES: SimSize[] = [128, 256, 512, 1024];

const sectionCls = "border-t border-white/10";
const rowCls = "flex items-center gap-3 px-4 py-2.5";
const labelCls = "text-2xs tracking-[0.1em] text-white/35 uppercase shrink-0 w-12";
const valueCls = "text-2xs text-white/50 tabular-nums w-12 text-right shrink-0";

function OptionBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "relative shrink-0 px-2.5 py-2 text-2xs tracking-[0.06em] transition-none cursor-pointer border-r border-white/15 last:border-r-0",
        active ? "text-white font-bold" : "text-white/35 hover:text-white/70",
      ].join(" ")}
    >
      {active && <span className="absolute bottom-0 left-1.5 right-1.5 h-px bg-white/70" aria-hidden="true" />}
      {children}
    </button>
  );
}

/* Scrollable button group — clips overflow on small screens without layout break */
function OptionGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex border border-white/15 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}

interface Props {
  stepsPerFrame: number;
  onStepsChange: (v: number) => void;
  feedOverride: number;
  onFeedChange: (v: number) => void;
  killOverride: number;
  onKillChange: (v: number) => void;
  colormap: number;
  onColormapChange: (v: number) => void;
  seedPattern: SeedPattern;
  onSeedPatternChange: (p: SeedPattern) => void;
  wrapMode: boolean;
  onWrapModeChange: (v: boolean) => void;
  driftMode: boolean;
  onDriftModeChange: (v: boolean) => void;
  simSize: SimSize;
  onSimSizeChange: (sz: SimSize) => void;
  onSnapshot: () => void;
}

export function SettingsPanel({
  stepsPerFrame, onStepsChange,
  feedOverride, onFeedChange,
  killOverride, onKillChange,
  colormap, onColormapChange,
  seedPattern, onSeedPatternChange,
  wrapMode, onWrapModeChange,
  driftMode, onDriftModeChange,
  simSize, onSimSizeChange,
  onSnapshot,
}: Props) {
  return (
    <div className="border border-white/20 bg-black/85 backdrop-blur-md mb-px">

      {/* Sliders */}
      <div className="py-1">
        <div className={rowCls}>
          <span className={labelCls}>SPEED</span>
          <input
            type="range" min={1} max={20} step={1} value={stepsPerFrame}
            onChange={e => onStepsChange(Number(e.target.value))}
            className="flex-1 min-w-0 cursor-pointer"
            style={{ accentColor: "white" }}
            aria-label="Steps per frame"
          />
          <span className={valueCls}>{stepsPerFrame}x</span>
        </div>

        <div className={rowCls}>
          <span className={labelCls}>FEED</span>
          <input
            type="range" min={0.01} max={0.1} step={0.0001} value={feedOverride}
            onChange={e => onFeedChange(Number(e.target.value))}
            className="flex-1 min-w-0 cursor-pointer"
            style={{ accentColor: "white" }}
            aria-label="Feed rate"
          />
          <span className={valueCls}>{feedOverride.toFixed(4)}</span>
        </div>

        <div className={rowCls}>
          <span className={labelCls}>KILL</span>
          <input
            type="range" min={0.03} max={0.08} step={0.0001} value={killOverride}
            onChange={e => onKillChange(Number(e.target.value))}
            className="flex-1 min-w-0 cursor-pointer"
            style={{ accentColor: "white" }}
            aria-label="Kill rate"
          />
          <span className={valueCls}>{killOverride.toFixed(4)}</span>
        </div>
      </div>

      {/* Palette */}
      <div className={sectionCls}>
        <div className={rowCls}>
          <span className={labelCls}>PAL</span>
          <OptionGroup>
            {COLORMAPS.map((name, i) => (
              <OptionBtn key={name} active={colormap === i} onClick={() => onColormapChange(i)}>
                {name}
              </OptionBtn>
            ))}
          </OptionGroup>
        </div>
      </div>

      {/* Seed pattern */}
      <div className={sectionCls}>
        <div className={rowCls}>
          <span className={labelCls}>SEED</span>
          <OptionGroup>
            {PATTERNS.map(p => (
              <OptionBtn key={p} active={seedPattern === p} onClick={() => onSeedPatternChange(p)}>
                {p.toUpperCase()}
              </OptionBtn>
            ))}
          </OptionGroup>
        </div>
      </div>

      {/* Wrap + Drift — stacked on mobile, side by side on sm+ */}
      <div className={sectionCls}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2 gap-2">
          <div className="flex items-center gap-3">
            <span className={labelCls}>WRAP</span>
            <OptionGroup>
              <OptionBtn active={wrapMode} onClick={() => onWrapModeChange(true)}>ON</OptionBtn>
              <OptionBtn active={!wrapMode} onClick={() => onWrapModeChange(false)}>OFF</OptionBtn>
            </OptionGroup>
          </div>
          <div className="flex items-center gap-3">
            <span className={labelCls}>DRIFT</span>
            <OptionGroup>
              <OptionBtn active={driftMode} onClick={() => onDriftModeChange(true)}>ON</OptionBtn>
              <OptionBtn active={!driftMode} onClick={() => onDriftModeChange(false)}>OFF</OptionBtn>
            </OptionGroup>
          </div>
        </div>
      </div>

      {/* Resolution */}
      <div className={sectionCls}>
        <div className={rowCls}>
          <span className={labelCls}>SIZE</span>
          <OptionGroup>
            {SIZES.map(sz => (
              <OptionBtn key={sz} active={simSize === sz} onClick={() => onSimSizeChange(sz)}>
                {sz}
              </OptionBtn>
            ))}
          </OptionGroup>
        </div>
      </div>

      {/* Screenshot */}
      <div className={sectionCls}>
        <button
          type="button"
          onClick={onSnapshot}
          className="w-full py-2.5 text-2xs tracking-[0.1em] text-white/30 hover:text-white/65 transition-none cursor-pointer text-center"
        >
          ↓ SCREENSHOT
        </button>
      </div>
    </div>
  );
}
