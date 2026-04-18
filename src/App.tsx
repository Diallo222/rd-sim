import { Canvas, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { ShaderMaterial } from "three";
import { useMemo } from "react";

import vertSrc from "./shaders/fullscreen.vert.glsl";
import fragSrc from "./shaders/hello.frag.glsl";

function Quad() {
  const { size } = useThree();
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertSrc,
        fragmentShader: fragSrc,
      }),
    [],
  );

  return (
    <mesh material={material}>
      <planeGeometry args={[size.width, size.height]} />
    </mesh>
  );
}

function App() {

  return (
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <Quad />
    </Canvas>
  );
}

export default App;
