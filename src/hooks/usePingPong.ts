import { useEffect, useMemo, useRef } from "react";
import { WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType } from "three";

const RT_OPTS = {
  minFilter: NearestFilter,
  magFilter: NearestFilter,
  format: RGBAFormat,
  type: FloatType,
} as const;

export function usePingPong(size: number) {
  const targetsRef = useRef<[WebGLRenderTarget, WebGLRenderTarget] | null>(null);
  const idxRef = useRef(0);

  // Synchronous init so targets exist before the first seedSimulation call.
  // Also handles size changes: dispose old targets and create new ones immediately.
  if (targetsRef.current === null || targetsRef.current[0].width !== size) {
    const prev = targetsRef.current;
    targetsRef.current = [
      new WebGLRenderTarget(size, size, RT_OPTS),
      new WebGLRenderTarget(size, size, RT_OPTS),
    ];
    idxRef.current = 0;
    prev?.[0].dispose();
    prev?.[1].dispose();
  }

  // Dispose on unmount only.
  useEffect(() => {
    return () => {
      targetsRef.current?.[0].dispose();
      targetsRef.current?.[1].dispose();
    };
  }, []);

  // Stable object — never re-creates across renders.
  return useMemo(() => ({
    get read() { return targetsRef.current![idxRef.current]; },
    get write() { return targetsRef.current![idxRef.current ^ 1]; },
    swap() { idxRef.current ^= 1; },
  }), []);
}
