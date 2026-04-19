import { DataTexture, RGBAFormat, FloatType, NearestFilter } from "three";

/**
 * Creates a Float32 DataTexture seeded for Gray-Scott simulation.
 *
 * Convention:
 *   R channel = A concentration (starts at 1.0 everywhere)
 *   G channel = B concentration (starts at 0.0, seeded in random patches)
 */
export function createInitialTexture(size: number): DataTexture {
  const data = new Float32Array(size * size * 4);

  // Fill entire grid: A=1, B=0
  for (let i = 0; i < size * size; i++) {
    data[i * 4 + 0] = 1.0; // A
    data[i * 4 + 1] = 0.0; // B
    data[i * 4 + 2] = 0.0;
    data[i * 4 + 3] = 1.0;
  }

  // Seed random square patches with A≈0.5, B≈0.25 (plus noise)
  const numSeeds = 30;
  const halfPatch = 4;
  for (let s = 0; s < numSeeds; s++) {
    const cx = Math.floor(Math.random() * size);
    const cy = Math.floor(Math.random() * size);
    for (let dy = -halfPatch; dy <= halfPatch; dy++) {
      for (let dx = -halfPatch; dx <= halfPatch; dx++) {
        const x = ((cx + dx) % size + size) % size;
        const y = ((cy + dy) % size + size) % size;
        const i = (y * size + x) * 4;
        data[i + 0] = 0.5 + (Math.random() - 0.5) * 0.1;
        data[i + 1] = 0.5 + (Math.random() - 0.5) * 0.1;
      }
    }
  }

  const texture = new DataTexture(data, size, size, RGBAFormat, FloatType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.needsUpdate = true;
  return texture;
}
