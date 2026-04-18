import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
} from "three";

import { usePingPong } from "../hooks/usePingPong";
import { createInitialTexture } from "../utils/createInitialTexture";
import type { RDParams } from "../constants/presets";

import vertSrc from "../shaders/fullscreen.vert.glsl";
import rdFragSrc from "../shaders/rd.frag.glsl";
import displayFragSrc from "../shaders/display.frag.glsl";

const SIM_SIZE = 512;

interface Props {
  params: RDParams;
  /** Increment this value to re-seed the simulation. */
  seed: number;
}

export function RDSimulation({ params, seed }: Props) {
  const { gl, size } = useThree();
  const pingPong = usePingPong(SIM_SIZE);

  // Off-screen scene + NDC-aligned camera used for compute passes
  const computeScene = useMemo(() => new Scene(), []);
  const computeCam = useMemo(
    () => new OrthographicCamera(-1, 1, 1, -1, 0, 1),
    [],
  );

  // ── Compute material (Gray-Scott shader) ────────────────────────────────
  const computeMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertSrc,
        fragmentShader: rdFragSrc,
        uniforms: {
          u_state: { value: null },
          u_texelSize: { value: new Vector2(1 / SIM_SIZE, 1 / SIM_SIZE) },
          u_feed: { value: params.feed },
          u_kill: { value: params.kill },
          u_Da: { value: params.Da },
          u_Db: { value: params.Db },
          u_dt: { value: params.dt },
        },
        depthTest: false,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Display material (color-mapping shader) ──────────────────────────────
  const displayMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertSrc,
        fragmentShader: displayFragSrc,
        uniforms: {
          u_state: { value: null },
        },
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  // ── Wire up the compute quad inside the off-screen scene ─────────────────
  useEffect(() => {
    const geo = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geo, computeMat);
    computeScene.add(mesh);
    return () => {
      computeScene.remove(mesh);
      geo.dispose();
    };
  }, [computeScene, computeMat]);

  // ── Keep compute uniforms in sync with params ────────────────────────────
  useEffect(() => {
    const u = computeMat.uniforms;
    u.u_feed.value = params.feed;
    u.u_kill.value = params.kill;
    u.u_Da.value = params.Da;
    u.u_Db.value = params.Db;
    u.u_dt.value = params.dt;
  }, [computeMat, params]);

  // ── Seed / reset the simulation state ───────────────────────────────────
  const seedSimulation = useCallback(() => {
    const tex = createInitialTexture(SIM_SIZE);
    computeMat.uniforms.u_state.value = tex;
    gl.setRenderTarget(pingPong.write);
    gl.render(computeScene, computeCam);
    pingPong.swap();
    gl.setRenderTarget(null);
    tex.dispose();
  }, [computeMat, computeCam, computeScene, gl, pingPong]);

  // Run seedSimulation on first mount and whenever `seed` changes
  const lastSeed = useRef<number | null>(null);
  useEffect(() => {
    if (lastSeed.current !== seed) {
      lastSeed.current = seed;
      seedSimulation();
    }
  }, [seed, seedSimulation]);

  // ── Simulation loop ──────────────────────────────────────────────────────
  useFrame(() => {
    if (lastSeed.current === null) return;

    for (let i = 0; i < params.stepsPerFrame; i++) {
      computeMat.uniforms.u_state.value = pingPong.read.texture;
      gl.setRenderTarget(pingPong.write);
      gl.render(computeScene, computeCam);
      pingPong.swap();
    }

    // Let R3F render the display quad to the screen
    gl.setRenderTarget(null);
    displayMat.uniforms.u_state.value = pingPong.read.texture;
  });

  // ── Display quad (rendered by R3F into the main scene) ───────────────────
  return (
    <mesh material={displayMat}>
      <planeGeometry args={[size.width, size.height]} />
    </mesh>
  );
}
