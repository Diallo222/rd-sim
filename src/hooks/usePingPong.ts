import { useMemo, useRef } from "react";
import { WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType } from "three";
import { useThree } from "@react-three/fiber";

/**
 * Creates two Float32 WebGLRenderTargets and exposes read/write getters
 * plus a swap() function for ping-pong rendering.
 *
 * Always access `.read` and `.write` as properties — never destructure them,
 * since their values change after each swap().
 */
export function usePingPong(size: number) {
  const { gl } = useThree();

  const targets = useMemo(() => {
    const opts = {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
      type: FloatType,
    };
    return [
      new WebGLRenderTarget(size, size, opts),
      new WebGLRenderTarget(size, size, opts),
    ];
  }, [size, gl]);

  const idxRef = useRef(0);

  return useMemo(
    () => ({
      get read() {
        return targets[idxRef.current];
      },
      get write() {
        return targets[idxRef.current ^ 1];
      },
      swap() {
        idxRef.current ^= 1;
      },
    }),
    [targets],
  );
}
