import { Canvas, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { ShaderMaterial } from "three";
import { useMemo } from "react";

import vertSrc from "./shaders/fullscreen.vert.glsl";
import fragSrc from "./shaders/hello.frag.glsl";
import { useInitialTexture } from "./hooks/useInitialTexture";

const SIZE = 256;

function Quad() {
  const { size } = useThree();
  const texture = useInitialTexture(SIZE);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertSrc,
        fragmentShader: fragSrc,
        uniforms: {
          u_state: { value: null },
        },
      }),
    [],
  );
  // keep the uniform in sync with the texture
  material.uniforms.u_state.value = texture;
  return (
    <mesh material={material}>
      <planeGeometry args={[size.width, size.height]} />
    </mesh>
  );
}

function App() {
  return (
    <div className="fixed inset-0 touch-none">
      <Canvas>
        <OrthographicCamera makeDefault position={[0, 0, 1]} />
        <Quad />
      </Canvas>
    </div>
  );
}

export default App;
