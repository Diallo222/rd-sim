import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

import { usePingPong } from "../hooks/usePingPong";
import { createInitialTexture } from "../utils/createInitialTexture";
import type { RDParams, SimSize, SeedPattern } from "../constants/presets";

import vertSrc from "../shaders/fullscreen.vert.glsl";
import rdFragSrc from "../shaders/rd.frag.glsl";
import displayFragSrc from "../shaders/display.frag.glsl";

interface Props {
  params: RDParams;
  seed: number;
  seedPattern: SeedPattern;
  paused: boolean;
  stepsPerFrame: number;
  feedOverride: number;
  killOverride: number;
  colormap: number;
  wrapMode: boolean;
  simSize: SimSize;
  driftMode: boolean;
  brushRef: React.RefObject<{ x: number; y: number; active: boolean }>;
  snapshotRef: React.RefObject<(() => void) | null>;
}

export function RDSimulation({
  params, seed, seedPattern, paused,
  stepsPerFrame, feedOverride, killOverride,
  colormap, wrapMode, simSize, driftMode,
  brushRef, snapshotRef,
}: Props) {
  const { gl, size } = useThree();
  const pingPong = usePingPong(simSize);

  const computeScene = useMemo(() => new Scene(), []);
  const computeCam = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), []);

  const computeMat = useMemo(() => new ShaderMaterial({
    vertexShader: vertSrc,
    fragmentShader: rdFragSrc,
    uniforms: {
      u_state:    { value: null },
      u_texelSize:{ value: new Vector2(1 / simSize, 1 / simSize) },
      u_feed:     { value: feedOverride },
      u_kill:     { value: killOverride },
      u_Da:       { value: params.Da },
      u_Db:       { value: params.Db },
      u_dt:       { value: params.dt },
      u_wrap:     { value: 1.0 },
      u_brush:    { value: new Vector3(0, 0, 0) },
    },
    depthTest: false,
    depthWrite: false,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const displayMat = useMemo(() => new ShaderMaterial({
    vertexShader: vertSrc,
    fragmentShader: displayFragSrc,
    uniforms: {
      u_state:    { value: null },
      u_colormap: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  }), []);

  // Wire compute quad into off-screen scene
  useEffect(() => {
    const geo = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geo, computeMat);
    computeScene.add(mesh);
    return () => { computeScene.remove(mesh); geo.dispose(); };
  }, [computeScene, computeMat]);

  // Sync Da/Db/dt from params
  useEffect(() => {
    computeMat.uniforms.u_Da.value = params.Da;
    computeMat.uniforms.u_Db.value = params.Db;
    computeMat.uniforms.u_dt.value = params.dt;
  }, [computeMat, params]);

  // Sync feed/kill overrides (does not re-seed)
  useEffect(() => {
    computeMat.uniforms.u_feed.value = feedOverride;
    computeMat.uniforms.u_kill.value = killOverride;
  }, [computeMat, feedOverride, killOverride]);

  // Sync texel size when resolution changes
  useEffect(() => {
    computeMat.uniforms.u_texelSize.value.set(1 / simSize, 1 / simSize);
  }, [computeMat, simSize]);

  // Sync wrap mode
  useEffect(() => {
    computeMat.uniforms.u_wrap.value = wrapMode ? 1.0 : 0.0;
  }, [computeMat, wrapMode]);

  // Sync colormap
  useEffect(() => {
    displayMat.uniforms.u_colormap.value = colormap;
  }, [displayMat, colormap]);

  // Expose screenshot function via ref
  useEffect(() => {
    snapshotRef.current = () => {
      const url = gl.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `rd-sim-${Date.now()}.png`;
      a.click();
    };
    return () => { snapshotRef.current = null; };
  }, [gl, snapshotRef]);

  // Use refs for simSize/seedPattern inside seedSimulation to keep callback stable
  const simSizeRef = useRef(simSize);
  const seedPatternRef = useRef(seedPattern);
  simSizeRef.current = simSize;
  seedPatternRef.current = seedPattern;

  const seedSimulation = useCallback(() => {
    const tex = createInitialTexture(simSizeRef.current, seedPatternRef.current);
    computeMat.uniforms.u_state.value = tex;
    gl.setRenderTarget(pingPong.write);
    gl.render(computeScene, computeCam);
    pingPong.swap();
    gl.setRenderTarget(null);
    tex.dispose();
  }, [computeMat, computeCam, computeScene, gl, pingPong]);

  const lastSeed = useRef<number | null>(null);
  useEffect(() => {
    if (lastSeed.current !== seed) {
      lastSeed.current = seed;
      seedSimulation();
    }
  }, [seed, seedSimulation]);

  // Drift elapsed time
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (lastSeed.current === null) return;

    if (paused) {
      gl.setRenderTarget(null);
      displayMat.uniforms.u_state.value = pingPong.read.texture;
      return;
    }

    // Drift: slowly oscillate feed/kill around override values
    if (driftMode) {
      elapsedRef.current += delta;
      const t = elapsedRef.current;
      computeMat.uniforms.u_feed.value = feedOverride + Math.sin(t * 0.3) * 0.008;
      computeMat.uniforms.u_kill.value = killOverride + Math.sin(t * 0.17 + 1.2) * 0.008;
    } else {
      // Restore override values immediately when drift is off
      computeMat.uniforms.u_feed.value = feedOverride;
      computeMat.uniforms.u_kill.value = killOverride;
    }

    // Brush
    const b = brushRef.current;
    computeMat.uniforms.u_brush.value.set(b.x, b.y, b.active ? 0.03 : 0.0);

    for (let i = 0; i < stepsPerFrame; i++) {
      computeMat.uniforms.u_state.value = pingPong.read.texture;
      gl.setRenderTarget(pingPong.write);
      gl.render(computeScene, computeCam);
      pingPong.swap();
    }

    gl.setRenderTarget(null);
    displayMat.uniforms.u_state.value = pingPong.read.texture;
  });

  return (
    <mesh material={displayMat}>
      <planeGeometry args={[size.width, size.height]} />
    </mesh>
  );
}
