import { useMemo } from "react";
import { DataTexture, RGBAFormat, FloatType, NearestFilter } from "three";

export function useInitialTexture(size: number): DataTexture {
  return useMemo(() => {
    // 4 floats per pixel (R, G, B, A)
    const data = new Float32Array(size * size * 4);

    // fill every pixel with A=1, B=0 (uniform "empty" state)
    for (let i = 0; i < size * size; i++) {
      const stride = i * 4;
      data[stride + 0] = 1.0; // R = chemical A
      data[stride + 1] = 0.0; // G = chemical B
      data[stride + 2] = 0.0; // B = unused
      data[stride + 3] = 1.0; // A = unused (but set to 1)
    }

    // seed ~20 random blobs where B > 0
    for (let s = 0; s < 20; s++) {
      const cx = Math.floor(Math.random() * size); // eslint-disable-line react-hooks/exhaustive-deps
      const cy = Math.floor(Math.random() * size); // eslint-disable-line react-hooks/exhaustive-deps

      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          // wrap around edges (toroidal boundary)
          const x = (cx + dx + size) % size;
          const y = (cy + dy + size) % size;
          const stride = (y * size + x) * 4;

          data[stride + 0] = 0.5; // A = 0.5
          data[stride + 1] = 0.25; // B = 0.25
        }
      }
    }

    const texture = new DataTexture(data, size, size, RGBAFormat, FloatType);
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    texture.needsUpdate = true; // tells Three.js to upload to GPU

    return texture;
  }, [size]);
}
